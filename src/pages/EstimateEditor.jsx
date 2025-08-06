
import React, { useState, useEffect } from "react";
import { Estimate, User } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link, useLocation, useNavigate } from 'react-router-dom';

const BLANK_ESTIMATE = {
  estimate_number: `EST-${Date.now().toString().slice(-6)}`,
  client_name: "",
  client_email: "",
  title: "",
  valid_until: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // Valid for 30 days
  status: 'draft',
  items: [{ name: "", description: "", quantity: 1, unit_price: 0, total: 0 }],
  terms: "This estimate is valid for 30 days. Prices are subject to change.",
  subtotal: 0,
  tax_rate: 0, // Added tax_rate to blank estimate
  tax_amount: 0,
  discount_amount: 0,
  total_amount: 0,
  currency: 'USD',
};

export default function EstimateEditor() {
  const [estimate, setEstimate] = useState(BLANK_ESTIMATE);
  const [user, setUser] = useState(null); // Added user state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const estimateId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        if (estimateId) {
          const fetchedEstimate = await Estimate.get(estimateId);
          if (fetchedEstimate.valid_until) {
            fetchedEstimate.valid_until = new Date(fetchedEstimate.valid_until).toISOString().split('T')[0];
          }
          setEstimate(fetchedEstimate);
        }
      } catch (error) {
        console.error("Failed to initialize estimate editor:", error);
        // Optionally redirect if user is not logged in or data fails to load
        navigate(createPageUrl("Sales"));
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [estimateId, navigate]); // Added navigate to dependency array

  useEffect(() => {
    const subtotal = estimate.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
    const discount = Number(estimate.discount_amount) || 0;
    const tax = (subtotal - discount) * (Number(estimate.tax_rate) || 0) / 100;
    const total = subtotal - discount + tax;

    setEstimate(prev => ({
      ...prev,
      subtotal,
      tax_amount: tax,
      total_amount: total,
    }));
  }, [estimate.items, estimate.discount_amount, estimate.tax_rate]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...estimate.items];
    updatedItems[index][field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total = (updatedItems[index].quantity || 0) * (updatedItems[index].unit_price || 0);
    }
    setEstimate({ ...estimate, items: updatedItems });
  };

  const handleAddItem = () => {
    setEstimate({
      ...estimate,
      items: [...estimate.items, { name: "", description: "", quantity: 1, unit_price: 0, total: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = estimate.items.filter((_, i) => i !== index);
    setEstimate({ ...estimate, items: updatedItems });
  };

  const handleInputChange = (field, value) => {
    setEstimate({ ...estimate, [field]: value });
  };

  const handleSave = async () => {
    if (!user || !user.agency_id) {
      alert("Error: Could not determine your agency. Please log in again.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...estimate,
        agency_id: user.agency_id,
        agent_email: user.email
      };

      if (estimateId) {
        await Estimate.update(estimateId, payload);
        alert("Estimate updated successfully!");
      } else {
        await Estimate.create(payload);
        alert("Estimate created successfully!");
      }
      navigate(createPageUrl("Sales"));
    } catch (error) {
      console.error("Failed to save estimate:", error);
      alert("Error: Could not save estimate.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading Estimate Editor...</div>;
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <Link to={createPageUrl("Sales")} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4" />
                Back to Sales
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">
                {estimateId ? `Edit Estimate #${estimate.estimate_number}` : "Create New Estimate"}
            </h1>
            <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : (estimateId ? "Save Changes" : "Create Estimate")}
            </Button>
        </div>

        <Card className="bg-white shadow-sm">
            <CardContent className="p-8 space-y-8">
                {/* Client & Dates */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold mb-4">Client Details:</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="client_name">Client Name</Label>
                                <Input id="client_name" value={estimate.client_name} onChange={(e) => handleInputChange('client_name', e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="client_email">Client Email</Label>
                                <Input id="client_email" type="email" value={estimate.client_email} onChange={(e) => handleInputChange('client_email', e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                         <div>
                            <Label htmlFor="title">Estimate Title</Label>
                            <Input id="title" value={estimate.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="e.g., Dubai Vacation Package" />
                        </div>
                         <div>
                            <Label htmlFor="valid_until">Valid Until</Label>
                            <Input id="valid_until" type="date" value={estimate.valid_until} onChange={(e) => handleInputChange('valid_until', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                    <h3 className="font-semibold">Particulars</h3>
                    <div className="space-y-2">
                        {estimate.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                <Input placeholder="Service or Product" className="flex-1" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} />
                                <Input type="number" placeholder="Qty" className="w-20" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                                <Input type="number" placeholder="Price" className="w-24" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} />
                                <span className="w-24 text-right font-medium">${(item.quantity * item.unit_price).toFixed(2)}</span>
                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleRemoveItem(index)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" onClick={handleAddItem}><Plus className="w-4 h-4 mr-2" />Add Item</Button>
                </div>

                {/* Terms & Totals */}
                <div className="grid md:grid-cols-2 gap-8 pt-4 border-t">
                    <div>
                        <Label htmlFor="terms">Terms & Conditions</Label>
                        <Textarea id="terms" value={estimate.terms} onChange={(e) => handleInputChange('terms', e.target.value)} />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>${estimate.subtotal.toFixed(2)}</span></div>
                        <div className="flex items-center justify-between">
                           <Label htmlFor="discount_amount" className="text-slate-600">Discount</Label>
                           <Input id="discount_amount" type="number" className="w-32" value={estimate.discount_amount} onChange={(e) => handleInputChange('discount_amount', e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between">
                           <Label htmlFor="tax_rate" className="text-slate-600">Tax (%)</Label>
                           <Input id="tax_rate" type="number" className="w-32" value={estimate.tax_rate} onChange={(e) => handleInputChange('tax_rate', e.target.value)} />
                        </div>
                        <div className="flex justify-between"><span className="text-slate-600">Tax Amount</span><span>${estimate.tax_amount.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-lg border-t pt-3"><span className="text-slate-900">Total</span><span className="text-slate-900">${estimate.total_amount.toFixed(2)}</span></div>
                    </div>
                </div>

            </CardContent>
        </Card>
      </div>
    </div>
  );
}
