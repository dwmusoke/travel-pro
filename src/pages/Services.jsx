
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { TravelService } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package, MapPin, Clock, DollarSign, Image, AlertCircle, Loader } from "lucide-react";
import ServiceForm from "../components/services/ServiceForm";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        if (currentUser.agency_id) {
          const serviceList = await TravelService.filter({ agency_id: currentUser.agency_id });
          setServices(serviceList);
        }
      } catch (error) {
        console.error("Failed to load services:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async (serviceData) => {
    try {
      if (selectedService?.id) {
        // Update existing service
        await TravelService.update(selectedService.id, serviceData);
      } else {
        // Create new service, ensuring agency_id is set
        await TravelService.create({ ...serviceData, agency_id: user.agency_id });
      }
      setShowForm(false);
      setSelectedService(null);
      // Reload data
      const serviceList = await TravelService.filter({ agency_id: user.agency_id });
      setServices(serviceList);
    } catch (error) {
      console.error("Failed to save service:", error);
      alert("Error saving service. Please check the console for details.");
    }
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setShowForm(true);
  };
  
  const handleDelete = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
        try {
            await TravelService.delete(serviceId);
            setServices(prev => prev.filter(s => s.id !== serviceId));
        } catch (error) {
            console.error("Failed to delete service:", error);
            alert("Error deleting service.");
        }
    }
  };

  return (
    <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Travel Services</h1>
            <p className="text-amber-800/80">Manage your agency's custom tours, packages, and safaris.</p>
          </div>
          <Button onClick={() => { setSelectedService(null); setShowForm(true); }} className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Service
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-8 h-8 animate-spin text-amber-700" />
          </div>
        ) : services.length === 0 ? (
          <Card className="text-center py-20 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent>
              <Package className="w-16 h-16 mx-auto text-amber-500 mb-4" />
              <h3 className="text-xl font-semibold text-amber-900">No Services Yet</h3>
              <p className="text-amber-700/80 mt-2 mb-4">Get started by creating your first travel package or tour.</p>
              <Button onClick={() => { setSelectedService(null); setShowForm(true); }}>Create Your First Service</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <Card key={service.id} className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl overflow-hidden flex flex-col">
                <CardHeader className="p-0">
                  {service.cover_image_url ? (
                    <img src={service.cover_image_url} alt={service.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-amber-100 flex items-center justify-center">
                      <Image className="w-12 h-12 text-amber-400" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <Badge className="capitalize mb-2 w-min" variant="outline">{service.service_type}</Badge>
                  <CardTitle className="text-xl text-amber-900 mb-2">{service.name}</CardTitle>
                  <p className="text-amber-700/90 text-sm mb-4 line-clamp-3 flex-1">{service.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-center text-sm my-4">
                    <div className="space-y-1"><MapPin className="mx-auto w-4 h-4 text-amber-700"/><span className="text-xs text-amber-800">{service.destination || 'N/A'}</span></div>
                    <div className="space-y-1"><Clock className="mx-auto w-4 h-4 text-amber-700"/><span className="text-xs text-amber-800">{service.duration_days || 'N/A'} Days</span></div>
                    <div className="space-y-1"><DollarSign className="mx-auto w-4 h-4 text-amber-700"/><span className="text-xs text-amber-800">${service.price?.toLocaleString()}</span></div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(service)}><Edit className="w-3 h-3 mr-1"/> Edit</Button>
                    <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDelete(service.id)}><Trash2 className="w-3 h-3 mr-1"/> Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-4xl bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl text-amber-900 dark:bg-gray-800/80 dark:border-gray-700/50 dark:text-amber-100">
            <DialogHeader>
              <DialogTitle>{selectedService ? "Edit Service" : "Create New Service"}</DialogTitle>
              <DialogDescription>
                Fill in the details for your travel service. Use markdown for lists in inclusions/exclusions.
              </DialogDescription>
            </DialogHeader>
            <ServiceForm 
              service={selectedService} 
              onSave={handleSave} 
              onClose={() => setShowForm(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
