import React, { useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";

const BLANK_SERVICE = {
    name: "",
    service_type: "package",
    description: "",
    destination: "",
    duration_days: 7,
    price: 1000,
    currency: "USD",
    inclusions: "",
    exclusions: "",
    itinerary: "",
    cover_image_url: "",
    is_active: true
};

export default function ServiceForm({ service, onSave, onClose }) {
    const [formData, setFormData] = useState(service || BLANK_SERVICE);

    const handleInputChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
    };

    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleQuillChange = (id, value) => {
        setFormData(prev => ({...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-2">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input id="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="service_type">Service Type</Label>
                    <Select id="service_type" value={formData.service_type} onValueChange={(v) => handleSelectChange('service_type', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="package">Package</SelectItem>
                            <SelectItem value="tour">Tour</SelectItem>
                            <SelectItem value="safari">Safari</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={handleInputChange} />
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input id="destination" value={formData.destination} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duration_days">Duration (Days)</Label>
                    <Input id="duration_days" type="number" value={formData.duration_days} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Price (per person)</Label>
                    <Input id="price" type="number" value={formData.price} onChange={handleInputChange} required />
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                <Input id="cover_image_url" value={formData.cover_image_url} onChange={handleInputChange} placeholder="https://example.com/image.jpg" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="inclusions">Inclusions</Label>
                    <ReactQuill theme="snow" value={formData.inclusions} onChange={(v) => handleQuillChange('inclusions', v)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="exclusions">Exclusions</Label>
                    <ReactQuill theme="snow" value={formData.exclusions} onChange={(v) => handleQuillChange('exclusions', v)} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="itinerary">Detailed Itinerary</Label>
                <ReactQuill theme="snow" value={formData.itinerary} onChange={(v) => handleQuillChange('itinerary', v)} />
            </div>
            
            <div className="flex items-center space-x-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"/>
                <Label htmlFor="is_active">Service is Active</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}><X className="w-4 h-4 mr-2" />Cancel</Button>
                <Button type="submit"><Save className="w-4 h-4 mr-2" />Save Service</Button>
            </div>
        </form>
    );
}