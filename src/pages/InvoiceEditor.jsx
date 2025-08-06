import React, { useState, useEffect } from "react";
import { Invoice, GDSTicket, Client, User, Agency } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import InvoicePreview from "@/components/invoices/InvoicePreview";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Send,
  Eye,
  Calculator,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function InvoiceEditor() {
  const [invoice, setInvoice] = useState({
    invoice_number: `INV-${Date.now()}`,
    client_name: "",
    client_email: "",
    client_phone: "",
    items: [{ description: "", quantity: 1, unit_price: 0, total: 0 }],
    subtotal: 0,
    tax_rate: 0,
    tax_amount: 0,
    service_fee: 0,
    commission: 0,
    total_amount: 0,
    amount_paid: 0,
    balance_due: 0,
    currency: "USD",
    status: "draft",
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [ticketOptions, setTicketOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [agency, setAgency] = useState(null);

  useEffect(() => {
    initializeEditor();
  }, []);

  const initializeEditor = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const invoiceId = urlParams.get('id');
      const ticketId = urlParams.get('ticket_id');

      const user = await User.me();
      setCurrentUser(user);

      if (!user?.agency_id) {
        alert("No agency found. Please contact support.");
        window.location.href = createPageUrl("Dashboard");
        return;
      }

      // Load agency data for preview
      try {
        const agencyData = await Agency.get(user.agency_id);
        setAgency(agencyData);
      } catch (error) {
        console.error("Error loading agency:", error);
      }

      // Load dropdown options
      const [tickets, clients] = await Promise.all([
        GDSTicket.filter({ agency_id: user.agency_id }, '-created_date', 100),
        Client.filter({ agency_id: user.agency_id }, 'name', 100)
      ]);

      setTicketOptions(tickets.filter(t => !t.invoice_id));
      setClientOptions(clients);

      if (invoiceId) {
        // Edit existing invoice
        const existingInvoice = await Invoice.get(invoiceId);
        if (existingInvoice && existingInvoice.agency_id === user.agency_id) {
          setInvoice({
            ...existingInvoice,
            due_date: existingInvoice.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
        } else {
          alert("Invoice not found or access denied.");
          window.location.href = createPageUrl("Invoicing");
          return;
        }
      } else if (ticketId) {
        // Create invoice from ticket
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
          setInvoice(prev => ({
            ...prev,
            ticket_id: ticket.id,
            client_name: ticket.passenger_name,
            client_email: ticket.passenger_email,
            client_phone: ticket.passenger_phone,
            items: [{
              description: `Flight Ticket - ${ticket.pnr}`,
              quantity: 1,
              unit_price: ticket.total_amount || 0,
              total: ticket.total_amount || 0
            }],
            subtotal: ticket.total_amount || 0,
            total_amount: ticket.total_amount || 0,
            balance_due: ticket.total_amount || 0,
            currency: ticket.currency || 'USD'
          }));
        }
      }
    } catch (error) {
      console.error("Error initializing invoice editor:", error);
      alert("Error loading invoice data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Recalculate totals whenever items or rates change
  useEffect(() => {
    calculateTotals();
  }, [invoice.items, invoice.tax_rate, invoice.service_fee, invoice.commission]);

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax_amount = subtotal * (invoice.tax_rate / 100);
    const total_amount = subtotal + tax_amount + (invoice.service_fee || 0) + (invoice.commission || 0);
    const balance_due = total_amount - (invoice.amount_paid || 0);

    setInvoice(prev => ({
      ...prev,
      subtotal,
      tax_amount,
      total_amount,
      balance_due
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate item total
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price;
    }

    setInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unit_price: 0, total: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (invoice.items.length > 1) {
      const updatedItems = invoice.items.filter((_, i) => i !== index);
      setInvoice(prev => ({ ...prev, items: updatedItems }));
    }
  };

  const handleSave = async (status = 'draft') => {
    if (!invoice.client_name || !invoice.total_amount) {
      alert("Please fill in client name and ensure there's at least one item.");
      return;
    }

    setSaving(true);
    try {
      const invoiceData = {
        ...invoice,
        status,
        agency_id: currentUser.agency_id,
        agent_email: currentUser.email
      };

      let savedInvoice;
      if (invoice.id) {
        savedInvoice = await Invoice.update(invoice.id, invoiceData);
      } else {
        savedInvoice = await Invoice.create(invoiceData);
      }

      alert(status === 'draft' ? 'Invoice saved as draft!' : 'Invoice sent successfully!');
      window.location.href = createPageUrl("Invoicing");
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const selectTicket = (ticketId) => {
    const ticket = ticketOptions.find(t => t.id === ticketId);
    if (ticket) {
      setInvoice(prev => ({
        ...prev,
        ticket_id: ticket.id,
        client_name: ticket.passenger_name,
        client_email: ticket.passenger_email,
        client_phone: ticket.passenger_phone,
        items: [{
          description: `Flight Ticket - ${ticket.pnr}`,
          quantity: 1,
          unit_price: ticket.total_amount || 0,
          total: ticket.total_amount || 0
        }],
        currency: ticket.currency || 'USD'
      }));
    }
  };

  const selectClient = (clientId) => {
    const client = clientOptions.find(c => c.id === clientId);
    if (client) {
      setInvoice(prev => ({
        ...prev,
        client_name: client.name,
        client_email: client.email,
        client_phone: client.phone
      }));
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-amber-800/20 dark:bg-amber-400/20 rounded-xl w-64"></div>
            <div className="h-64 bg-amber-800/10 dark:bg-amber-400/10 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Invoicing")}>
              <Button variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                {invoice.id ? 'Edit Invoice' : 'Create New Invoice'}
              </h1>
              <p className="text-amber-800/80 dark:text-amber-200/80">
                {invoice.invoice_number}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button
              onClick={() => handleSave('draft')}
              disabled={saving}
              variant="outline"
              className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave('sent')}
              disabled={saving}
              className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg"
            >
              <Send className="w-4 h-4 mr-2" />
              Save & Send
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="space-y-6">
            {/* Quick Select */}
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-100">Quick Select</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-amber-900 dark:text-amber-100">From Ticket</Label>
                  <Select onValueChange={selectTicket}>
                    <SelectTrigger className="bg-amber-100/50 border-amber-300/50 text-amber-900">
                      <SelectValue placeholder="Select a processed ticket" />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketOptions.map(ticket => (
                        <SelectItem key={ticket.id} value={ticket.id}>
                          {ticket.passenger_name} - {ticket.pnr} ({ticket.currency} {ticket.total_amount?.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-amber-900 dark:text-amber-100">From Client</Label>
                  <Select onValueChange={selectClient}>
                    <SelectTrigger className="bg-amber-100/50 border-amber-300/50 text-amber-900">
                      <SelectValue placeholder="Select an existing client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientOptions.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-100">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="client_name" className="text-amber-900 dark:text-amber-100">Client Name *</Label>
                  <Input
                    id="client_name"
                    value={invoice.client_name}
                    onChange={(e) => setInvoice(prev => ({ ...prev, client_name: e.target.value }))}
                    className="bg-amber-100/50 border-amber-300/50 text-amber-900"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="client_email" className="text-amber-900 dark:text-amber-100">Client Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={invoice.client_email}
                    onChange={(e) => setInvoice(prev => ({ ...prev, client_email: e.target.value }))}
                    className="bg-amber-100/50 border-amber-300/50 text-amber-900"
                  />
                </div>
                <div>
                  <Label htmlFor="client_phone" className="text-amber-900 dark:text-amber-100">Client Phone</Label>
                  <Input
                    id="client_phone"
                    value={invoice.client_phone}
                    onChange={(e) => setInvoice(prev => ({ ...prev, client_phone: e.target.value }))}
                    className="bg-amber-100/50 border-amber-300/50 text-amber-900"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Details */}
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-100">Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoice_number" className="text-amber-900 dark:text-amber-100">Invoice Number</Label>
                    <Input
                      id="invoice_number"
                      value={invoice.invoice_number}
                      onChange={(e) => setInvoice(prev => ({ ...prev, invoice_number: e.target.value }))}
                      className="bg-amber-100/50 border-amber-300/50 text-amber-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date" className="text-amber-900 dark:text-amber-100">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={invoice.due_date}
                      onChange={(e) => setInvoice(prev => ({ ...prev, due_date: e.target.value }))}
                      className="bg-amber-100/50 border-amber-300/50 text-amber-900"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="currency" className="text-amber-900 dark:text-amber-100">Currency</Label>
                  <Select value={invoice.currency} onValueChange={(value) => setInvoice(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger className="bg-amber-100/50 border-amber-300/50 text-amber-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="UGX">UGX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-900 dark:text-amber-100">Invoice Items</CardTitle>
                  <Button onClick={addItem} size="sm" className="bg-amber-800 text-white hover:bg-amber-900">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-amber-100/30 rounded-lg">
                      <div className="col-span-5">
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="bg-white border-amber-300/50 text-amber-900"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="bg-white border-amber-300/50 text-amber-900"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="bg-white border-amber-300/50 text-amber-900"
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center justify-center h-9 text-sm font-medium text-amber-900">
                          {invoice.currency} {item.total.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={invoice.items.length === 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Totals and Fees */}
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Calculations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tax_rate" className="text-amber-900 dark:text-amber-100">Tax Rate (%)</Label>
                    <Input
                      id="tax_rate"
                      type="number"
                      step="0.01"
                      value={invoice.tax_rate}
                      onChange={(e) => setInvoice(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                      className="bg-amber-100/50 border-amber-300/50 text-amber-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="service_fee" className="text-amber-900 dark:text-amber-100">Service Fee</Label>
                    <Input
                      id="service_fee"
                      type="number"
                      step="0.01"
                      value={invoice.service_fee}
                      onChange={(e) => setInvoice(prev => ({ ...prev, service_fee: parseFloat(e.target.value) || 0 }))}
                      className="bg-amber-100/50 border-amber-300/50 text-amber-900"
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-800 dark:text-amber-200">Subtotal:</span>
                    <span className="font-medium text-amber-900 dark:text-amber-100">{invoice.currency} {invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-800 dark:text-amber-200">Tax ({invoice.tax_rate}%):</span>
                    <span className="font-medium text-amber-900 dark:text-amber-100">{invoice.currency} {invoice.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-800 dark:text-amber-200">Service Fee:</span>
                    <span className="font-medium text-amber-900 dark:text-amber-100">{invoice.currency} {invoice.service_fee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-amber-900 dark:text-amber-100">Total Amount:</span>
                    <span className="text-amber-900 dark:text-amber-100">{invoice.currency} {invoice.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-100">Notes & Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any notes, payment terms, or special instructions..."
                  value={invoice.notes}
                  onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="bg-amber-100/50 border-amber-300/50 text-amber-900"
                />
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="lg:sticky lg:top-8">
              <Card className="bg-white border border-amber-200/50 rounded-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-amber-900 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Invoice Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <InvoicePreview invoice={invoice} agency={agency} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}