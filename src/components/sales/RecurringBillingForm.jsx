import React, { useState, useEffect } from "react";
import { RecurringBilling } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Save, X, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function RecurringBillingForm({ initialData, onSave, onClose, agencyId }) {
  const [formData, setFormData] = useState({
    subscription_name: "",
    client_name: "",
    client_email: "",
    service_type: "travel_insurance",
    billing_frequency: "monthly",
    amount: 0,
    currency: "USD",
    status: "active",
    start_date: "",
    end_date: "",
    payment_method: "credit_card",
    auto_renewal: true,
    agency_id: agencyId
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
        agency_id: agencyId
      });
    }
  }, [initialData, agencyId]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id, checked) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };

  const calculateNextBillingDate = (startDate, frequency) => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const next = new Date(start);
    
    switch (frequency) {
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'semi_annual':
        next.setMonth(next.getMonth() + 6);
        break;
      case 'annual':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    return next.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nextBillingDate = calculateNextBillingDate(formData.start_date, formData.billing_frequency);
    
    const finalData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      next_billing_date: nextBillingDate,
      total_billed: initialData?.total_billed || 0,
      billing_history: initialData?.billing_history || []
    };

    try {
      if (initialData) {
        await RecurringBilling.update(initialData.id, finalData);
      } else {
        await RecurringBilling.create(finalData);
      }
      onSave();
    } catch (error) {
      console.error("Failed to save subscription", error);
      alert("Error saving subscription. See console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subscription_name">Subscription Name</Label>
        <Input 
          id="subscription_name" 
          value={formData.subscription_name} 
          onChange={handleInputChange} 
          placeholder="e.g., Corporate Travel Insurance"
          required 
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client_name">Client Name</Label>
          <Input 
            id="client_name" 
            value={formData.client_name} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client_email">Client Email</Label>
          <Input 
            id="client_email" 
            type="email" 
            value={formData.client_email} 
            onChange={handleInputChange} 
            required 
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service_type">Service Type</Label>
          <Select value={formData.service_type} onValueChange={(v) => handleSelectChange('service_type', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="travel_insurance">Travel Insurance</SelectItem>
              <SelectItem value="visa_monitoring">Visa Monitoring</SelectItem>
              <SelectItem value="loyalty_program">Loyalty Program</SelectItem>
              <SelectItem value="corporate_package">Corporate Package</SelectItem>
              <SelectItem value="maintenance_fee">Maintenance Fee</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing_frequency">Billing Frequency</Label>
          <Select value={formData.billing_frequency} onValueChange={(v) => handleSelectChange('billing_frequency', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="semi_annual">Semi-Annual</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              value={formData.amount} 
              onChange={handleInputChange} 
              className="pl-9"
              required 
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(v) => handleSelectChange('currency', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
              <SelectItem value="AUD">AUD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.start_date ? (
                  format(new Date(formData.start_date), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.start_date ? new Date(formData.start_date) : undefined}
                onSelect={(date) => setFormData(prev => ({
                    ...prev,
                    start_date: date ? format(date, "yyyy-MM-dd") : ""
                }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.end_date ? (
                  format(new Date(formData.end_date), "PPP")
                ) : (
                  <span>Pick a date (optional)</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.end_date ? new Date(formData.end_date) : undefined}
                onSelect={(date) => setFormData(prev => ({
                    ...prev,
                    end_date: date ? format(date, "yyyy-MM-dd") : ""
                }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_method">Payment Method</Label>
        <Select value={formData.payment_method} onValueChange={(v) => handleSelectChange('payment_method', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="auto_renewal"
          checked={formData.auto_renewal}
          onCheckedChange={(checked) => handleSwitchChange('auto_renewal', checked)}
        />
        <Label htmlFor="auto_renewal">Enable Auto-Renewal</Label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" className="bg-amber-800 hover:bg-amber-900">
          <Save className="w-4 h-4 mr-2" />
          {initialData ? "Update Subscription" : "Create Subscription"}
        </Button>
      </div>
    </form>
  );
}