
import React, { useState, useEffect } from "react";
import { Booking, Lead, Client } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Save, X, Trash2, Plus, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function BookingForm({ initialData, selectedLead, onSave, onClose, agencyId }) {
  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    booking_type: "flight",
    status: "pending",
    travel_dates: { departure_date: "", return_date: "" },
    destinations: [],
    passengers: [{ name: "" }],
    services: [{ name: "", quantity: 1, unit_price: 0, total_price: 0 }],
    total_amount: 0,
    currency: "USD",
    payment_status: "pending",
    special_requirements: "",
    agency_id: agencyId
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        destinations: initialData.destinations || [],
        passengers: initialData.passengers?.length ? initialData.passengers : [{ name: "" }],
        services: initialData.services?.length ? initialData.services : [{ name: "", quantity: 1, unit_price: 0, total_price: 0 }],
        agency_id: agencyId
      });
    } else if (selectedLead) {
      setFormData(prev => ({
        ...prev,
        client_name: selectedLead.name,
        client_email: selectedLead.email,
        client_phone: selectedLead.phone,
        special_requirements: selectedLead.requirements,
        agency_id: agencyId
      }));
    }
  }, [initialData, selectedLead, agencyId]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleDynamicListChange = (listName, index, field, value) => {
    setFormData(prev => {
      const newList = [...prev[listName]];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [listName]: newList };
    });
  };

  const addDynamicListItem = (listName, newItem) => {
    setFormData(prev => ({ ...prev, [listName]: [...prev[listName], newItem] }));
  };

  const removeDynamicListItem = (listName, index) => {
    setFormData(prev => ({ ...prev, [listName]: prev[listName].filter((_, i) => i !== index) }));
  };

  useEffect(() => {
    const subtotal = formData.services.reduce((sum, service) => sum + (service.quantity * service.unit_price), 0);
    setFormData(prev => ({...prev, total_amount: subtotal }));
  }, [formData.services]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      booking_reference: formData.booking_reference || `BKG-${Date.now()}`
    };

    try {
      if (initialData) {
        await Booking.update(initialData.id, finalData);
      } else {
        await Booking.create(finalData);
        if (selectedLead) {
            await Lead.update(selectedLead.id, { converted_to_booking: true, status: 'won' });
        }
        
        // Auto-create or update client
        const existingClients = await Client.filter({ email: formData.client_email, agency_id: agencyId });
        if (existingClients.length > 0) {
            const client = existingClients[0];
            await Client.update(client.id, {
                total_bookings: (client.total_bookings || 0) + 1,
                last_booking_date: new Date().toISOString().split('T')[0]
            });
        } else {
            await Client.create({
                name: formData.client_name,
                email: formData.client_email,
                phone: formData.client_phone,
                agency_id: agencyId,
                total_bookings: 1,
                last_booking_date: new Date().toISOString().split('T')[0]
            });
        }
      }
      onSave();
    } catch (error) {
      console.error("Failed to save booking", error);
      alert("Error saving booking. See console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client_name">Client Name</Label>
          <Input id="client_name" value={formData.client_name} onChange={handleInputChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client_email">Client Email</Label>
          <Input id="client_email" type="email" value={formData.client_email} onChange={handleInputChange} required />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
         <div className="space-y-2">
          <Label htmlFor="booking_type">Booking Type</Label>
          <Select value={formData.booking_type} onValueChange={(v) => handleSelectChange('booking_type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="flight">Flight</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="package">Package</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Booking Status</Label>
           <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Client Contact Details */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client_phone">Client Phone</Label>
          <Input id="client_phone" type="tel" value={formData.client_phone} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="booking_reference">Booking Reference</Label>
            <Input id="booking_reference" value={formData.booking_reference} onChange={handleInputChange} placeholder="Auto-generated if left empty" />
        </div>
      </div>

      {/* Travel Dates */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="departure_date">Departure Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.travel_dates.departure_date ? (
                  format(new Date(formData.travel_dates.departure_date), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.travel_dates.departure_date ? new Date(formData.travel_dates.departure_date) : undefined}
                onSelect={(date) => setFormData(prev => ({
                    ...prev,
                    travel_dates: { ...prev.travel_dates, departure_date: date ? format(date, "yyyy-MM-dd") : "" }
                }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="return_date">Return Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.travel_dates.return_date ? (
                  format(new Date(formData.travel_dates.return_date), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.travel_dates.return_date ? new Date(formData.travel_dates.return_date) : undefined}
                onSelect={(date) => setFormData(prev => ({
                    ...prev,
                    travel_dates: { ...prev.travel_dates, return_date: date ? format(date, "yyyy-MM-dd") : "" }
                }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Destinations */}
      <div className="space-y-2">
        <Label>Destinations</Label>
        {formData.destinations.map((destination, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="e.g., Paris, Tokyo"
              value={destination.name}
              onChange={(e) => handleDynamicListChange("destinations", index, "name", e.target.value)}
              className="flex-grow"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => removeDynamicListItem("destinations", index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => addDynamicListItem("destinations", { name: "" })}>
          <Plus className="w-4 h-4 mr-2" /> Add Destination
        </Button>
      </div>

      {/* Passengers */}
      <div className="space-y-2">
        <Label>Passengers</Label>
        {formData.passengers.map((passenger, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Passenger Name"
              value={passenger.name}
              onChange={(e) => handleDynamicListChange("passengers", index, "name", e.target.value)}
              className="flex-grow"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => removeDynamicListItem("passengers", index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => addDynamicListItem("passengers", { name: "" })}>
          <Plus className="w-4 h-4 mr-2" /> Add Passenger
        </Button>
      </div>

      {/* Services */}
      <div className="space-y-2">
        <Label>Services & Pricing</Label>
        {formData.services.map((service, index) => (
          <div key={index} className="grid grid-cols-4 gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor={`service-name-${index}`}>Service Name</Label>
              <Input
                id={`service-name-${index}`}
                placeholder="e.g., Flight Ticket, Hotel Booking"
                value={service.name}
                onChange={(e) => handleDynamicListChange("services", index, "name", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`service-quantity-${index}`}>Quantity</Label>
              <Input
                id={`service-quantity-${index}`}
                type="number"
                value={service.quantity}
                onChange={(e) => handleDynamicListChange("services", index, "quantity", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`service-unit-price-${index}`}>Unit Price ({formData.currency})</Label>
              <Input
                id={`service-unit-price-${index}`}
                type="number"
                step="0.01"
                value={service.unit_price}
                onChange={(e) => handleDynamicListChange("services", index, "unit_price", parseFloat(e.target.value) || 0)}
              />
            </div>
            <Button type="button" variant="destructive" size="icon" onClick={() => removeDynamicListItem("services", index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => addDynamicListItem("services", { name: "", quantity: 1, unit_price: 0, total_price: 0 })}>
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </div>

      {/* Total Amount & Currency */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(v) => handleSelectChange('currency', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="ILS">ILS</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
              <SelectItem value="AUD">AUD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_amount">Total Amount</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input id="total_amount" type="number" step="0.01" value={formData.total_amount.toFixed(2)} readOnly className="pl-9 bg-gray-50 dark:bg-gray-800" />
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="space-y-2">
        <Label htmlFor="payment_status">Payment Status</Label>
        <Select value={formData.payment_status} onValueChange={(v) => handleSelectChange('payment_status', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Special Requirements */}
      <div className="space-y-2">
        <Label htmlFor="special_requirements">Special Requirements</Label>
        <Textarea
          id="special_requirements"
          value={formData.special_requirements}
          onChange={handleInputChange}
          placeholder="Any specific notes or requirements for this booking..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <Button type="submit" className="bg-amber-800 hover:bg-amber-900">
            <Save className="w-4 h-4 mr-2" /> {initialData ? "Save Changes" : "Create Booking"}
        </Button>
      </div>
    </form>
  );
}
