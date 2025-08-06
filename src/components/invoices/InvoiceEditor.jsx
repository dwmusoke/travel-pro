import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Download, 
  Send, 
  Settings,
  Palette,
  Image,
  Building,
  Globe,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import InvoicePreview from "./InvoicePreview";

const BLANK_INVOICE = {
  invoice_number: "",
  client_name: "",
  client_email: "",
  client_phone: "",
  client_address: "",
  created_date: new Date().toISOString().split('T')[0],
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: "USD",
  items: [],
  subtotal: 0,
  tax_rate: 0,
  tax_amount: 0,
  service_fee: 0,
  total_amount: 0,
  amount_paid: 0,
  balance_due: 0,
  notes: "",
  status: "draft"
};

const BLANK_AGENCY = {
  name: "Your Travel Agency",
  tagline: "Creating unforgettable travel experiences",
  logo_url: "",
  address: "",
  email: "",
  phone: "",
  website: "",
  bank_account: "",
  branding_theme: "default"
};

export default function InvoiceEditor({ invoice, agency, onSave, onClose }) {
  const [formData, setFormData] = useState(invoice || BLANK_INVOICE);
  const [agencyData, setAgencyData] = useState(agency || BLANK_AGENCY);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.tax_rate, formData.service_fee]);

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax_amount = (subtotal * formData.tax_rate) / 100;
    const total_amount = subtotal + tax_amount + formData.service_fee;
    const balance_due = total_amount - formData.amount_paid;

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_amount,
      total_amount,
      balance_due
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgencyChange = (field, value) => {
    setAgencyData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: "",
      quantity: 1,
      unit_price: 0,
      total: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate item total
    if (field === 'quantity' || field === 'unit_price') {
      const item = updatedItems[index];
      item.total = (item.quantity || 0) * (item.unit_price || 0);
    }
    
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const invoiceData = {
      ...formData,
      agency: agencyData
    };
    onSave(invoiceData);
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  if (previewMode) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            ← Back to Editor
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Invoice
            </Button>
          </div>
        </div>
        <InvoicePreview invoice={formData} agency={agencyData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoice Editor</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Invoice Details</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="agency">Agency Branding</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="invoice_number"
                      value={formData.invoice_number}
                      onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                      placeholder="INV-2024-001"
                    />
                    <Button variant="outline" onClick={() => handleInputChange('invoice_number', generateInvoiceNumber())}>
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="created_date">Issue Date</Label>
                  <Input
                    id="created_date"
                    type="date"
                    value={formData.created_date}
                    onChange={(e) => handleInputChange('created_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="client_email">Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => handleInputChange('client_email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_phone">Phone</Label>
                  <Input
                    id="client_phone"
                    value={formData.client_phone}
                    onChange={(e) => handleInputChange('client_phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="client_address">Address</Label>
                  <Input
                    id="client_address"
                    value={formData.client_address}
                    onChange={(e) => handleInputChange('client_address', e.target.value)}
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Invoice Items</CardTitle>
                <Button onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No items added yet. Click "Add Item" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            placeholder="Service description"
                          />
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label>Total</Label>
                          <Input
                            value={`${formData.currency} ${item.total?.toFixed(2) || '0.00'}`}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Totals & Fees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    value={formData.tax_rate}
                    onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="service_fee">Service Fee</Label>
                  <Input
                    id="service_fee"
                    type="number"
                    value={formData.service_fee}
                    onChange={(e) => handleInputChange('service_fee', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="amount_paid">Amount Paid</Label>
                  <Input
                    id="amount_paid"
                    type="number"
                    value={formData.amount_paid}
                    onChange={(e) => handleInputChange('amount_paid', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formData.currency} {formData.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({formData.tax_rate}%):</span>
                  <span className="font-medium">{formData.currency} {formData.tax_amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee:</span>
                  <span className="font-medium">{formData.currency} {formData.service_fee?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formData.currency} {formData.total_amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid:</span>
                  <span>{formData.currency} {formData.amount_paid?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-red-600">
                  <span>Balance Due:</span>
                  <span>{formData.currency} {formData.balance_due?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agency Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agency_name">Agency Name</Label>
                  <Input
                    id="agency_name"
                    value={agencyData.name}
                    onChange={(e) => handleAgencyChange('name', e.target.value)}
                    placeholder="Your Travel Agency"
                  />
                </div>
                <div>
                  <Label htmlFor="agency_tagline">Tagline</Label>
                  <Input
                    id="agency_tagline"
                    value={agencyData.tagline}
                    onChange={(e) => handleAgencyChange('tagline', e.target.value)}
                    placeholder="Creating unforgettable experiences"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="agency_logo">Logo URL</Label>
                <Input
                  id="agency_logo"
                  value={agencyData.logo_url}
                  onChange={(e) => handleAgencyChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <Label htmlFor="branding_theme">Branding Theme</Label>
                <Select value={agencyData.branding_theme} onValueChange={(value) => handleAgencyChange('branding_theme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default (Blue)</SelectItem>
                    <SelectItem value="premium">Premium (Purple)</SelectItem>
                    <SelectItem value="luxury">Luxury (Amber)</SelectItem>
                    <SelectItem value="business">Business (Slate)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agency_email">Email</Label>
                  <Input
                    id="agency_email"
                    type="email"
                    value={agencyData.email}
                    onChange={(e) => handleAgencyChange('email', e.target.value)}
                    placeholder="info@youragency.com"
                  />
                </div>
                <div>
                  <Label htmlFor="agency_phone">Phone</Label>
                  <Input
                    id="agency_phone"
                    value={agencyData.phone}
                    onChange={(e) => handleAgencyChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="agency_address">Address</Label>
                <Input
                  id="agency_address"
                  value={agencyData.address}
                  onChange={(e) => handleAgencyChange('address', e.target.value)}
                  placeholder="123 Business St, City, State 12345"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agency_website">Website</Label>
                  <Input
                    id="agency_website"
                    value={agencyData.website}
                    onChange={(e) => handleAgencyChange('website', e.target.value)}
                    placeholder="https://youragency.com"
                  />
                </div>
                <div>
                  <Label htmlFor="agency_bank">Bank Account</Label>
                  <Input
                    id="agency_bank"
                    value={agencyData.bank_account}
                    onChange={(e) => handleAgencyChange('bank_account', e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or terms..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="show_qr" defaultChecked />
                <Label htmlFor="show_qr">Show QR Code for Payment</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="show_logo" defaultChecked />
                <Label htmlFor="show_logo">Show Agency Logo</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 