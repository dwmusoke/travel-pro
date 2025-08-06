import React, { useState, useEffect } from "react";
import { User, Agency } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Key, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Globe,
  FileText,
  Users
} from "lucide-react";
import { createPageUrl } from "@/utils";

export default function GetStarted() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        office_id: "",
        iata_number: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
        website: "",
        contact_person: "",
        contact_email: "",
        contact_phone: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                
                // If user already has an agency, redirect to dashboard
                if (userData.agency_id) {
                    window.location.href = createPageUrl("Dashboard");
                    return;
                }
                
                // Pre-fill contact information from user data
                setFormData(prev => ({
                    ...prev,
                    contact_person: userData.name || "",
                    contact_email: userData.email || "",
                    contact_phone: userData.phone || ""
                }));
                
            } catch (err) {
                console.log('GetStarted: Authentication error:', err);
                // In production mode, let Base44 handle authentication
                // Don't redirect to Home as it might cause loops
                setError("Please log in to continue. If you're not redirected automatically, please refresh the page.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Agency name is required");
            return false;
        }
        if (!formData.office_id.trim()) {
            setError("Office ID is required");
            return false;
        }
        if (!formData.contact_email.trim()) {
            setError("Contact email is required");
            return false;
        }
        if (!formData.contact_phone.trim()) {
            setError("Contact phone is required");
            return false;
        }
        if (!formData.address.trim()) {
            setError("Agency address is required");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!validateForm()) {
            return;
        }
        
        setSubmitting(true);
        
        if (!user) {
            setError("User information not found. Please try logging in again.");
            setSubmitting(false);
            return;
        }

        try {
            // Create comprehensive agency data
            const agencyData = {
                name: formData.name.trim(),
                office_id: formData.office_id.trim(),
                iata_number: formData.iata_number.trim() || null,
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                country: formData.country.trim() || "United States",
                postal_code: formData.postal_code.trim(),
                website: formData.website.trim() || null,
                
                // Contact information
                contact_person: formData.contact_person.trim(),
                contact_email: formData.contact_email.trim(),
                contact_phone: formData.contact_phone.trim(),
                
                // Owner information (from logged-in user)
                owner_email: user.email,
                owner_name: user.name || formData.contact_person,
                
                // Agency status
                subscription_status: 'pending_approval',
                is_active: false,
                subscription_plan: 'basic',
                
                // Settings
                settings: {
                    timezone: 'UTC',
                    currency: 'USD',
                    date_format: 'MM/DD/YYYY',
                    logo_url: null,
                    branding_theme: 'default'
                },
                
                // Module access
                enabled_modules: [
                    'sales_pipeline',
                    'travel_services', 
                    'bsp_reconciliation',
                    'financial_management',
                    'ticket_tracker',
                    'client_crm',
                    'workflows',
                    'billing'
                ],
                
                // Created by
                created_by: user.id,
                created_date: new Date().toISOString()
            };

            // Create the Agency
            const newAgency = await Agency.create(agencyData);

            // Update the user with the new agency ID and role
            await User.updateMyUserData({
                agency_id: newAgency.id,
                app_role: 'agency_admin',
                agency_name: newAgency.name
            });

            setSuccess(true);
            
            // Redirect to dashboard after a brief delay
            setTimeout(() => {
                window.location.href = createPageUrl("Dashboard");
            }, 2000);

        } catch (err) {
            console.error("Failed to create agency:", err);
            setError(err.message || "There was an error creating your agency. Please check the details and try again.");
            setSubmitting(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800 dark:border-amber-400"></div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
                <Card className="w-full max-w-2xl bg-green-50 border-green-200">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-800 mb-4">Agency Created Successfully!</h2>
                        <p className="text-green-700 mb-6">
                            Your agency "{formData.name}" has been created and is pending approval. 
                            You'll be redirected to the dashboard shortly.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            <span>Redirecting to dashboard...</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
            <Card className="w-full max-w-4xl bg-amber-800/10 dark:bg-amber-400/10 backdrop-blur-md p-4 sm:p-8 rounded-xl border border-amber-700/20 dark:border-amber-400/20 shadow-xl">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-amber-800/20 dark:bg-amber-400/20 backdrop-blur-sm border border-amber-700/30 dark:border-amber-400/30">
                        <Plane className="w-8 h-8 text-amber-800 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-amber-900 dark:text-amber-100">Welcome to TravelPro!</CardTitle>
                    <CardDescription className="text-amber-800/80 dark:text-amber-200/80">
                        Let's get your travel agency set up. Fill out the details below to create your agency profile.
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Agency Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Building className="w-5 h-5 text-amber-600" />
                                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Agency Information</h3>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-amber-900 dark:text-amber-100">
                                        Agency Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        id="name" 
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        required 
                                        placeholder="Your Travel Agency Name"
                                        className="border-amber-300 focus:border-amber-500"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="office_id" className="text-amber-900 dark:text-amber-100">
                                        Office ID <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        id="office_id" 
                                        value={formData.office_id} 
                                        onChange={handleInputChange} 
                                        required 
                                        placeholder="e.g., OFFICE001"
                                        className="border-amber-300 focus:border-amber-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="iata_number" className="text-amber-900 dark:text-amber-100">
                                        IATA Number
                                    </Label>
                                    <Input 
                                        id="iata_number" 
                                        value={formData.iata_number} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g., 12345678"
                                        className="border-amber-300 focus:border-amber-500"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="website" className="text-amber-900 dark:text-amber-100">
                                        Website
                                    </Label>
                                    <Input 
                                        id="website" 
                                        value={formData.website} 
                                        onChange={handleInputChange} 
                                        placeholder="https://youragency.com"
                                        className="border-amber-300 focus:border-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-amber-600" />
                                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Contact Information</h3>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_person" className="text-amber-900 dark:text-amber-100">
                                        Contact Person <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        id="contact_person" 
                                        value={formData.contact_person} 
                                        onChange={handleInputChange} 
                                        required 
                                        placeholder="Full Name"
                                        className="border-amber-300 focus:border-amber-500"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="contact_email" className="text-amber-900 dark:text-amber-100">
                                        Contact Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        id="contact_email" 
                                        type="email"
                                        value={formData.contact_email} 
                                        onChange={handleInputChange} 
                                        required 
                                        placeholder="contact@youragency.com"
                                        className="border-amber-300 focus:border-amber-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone" className="text-amber-900 dark:text-amber-100">
                                        Contact Phone <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        id="contact_phone" 
                                        type="tel"
                                        value={formData.contact_phone} 
                                        onChange={handleInputChange} 
                                        required 
                                        placeholder="+1 (555) 123-4567"
                                        className="border-amber-300 focus:border-amber-500"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-amber-900 dark:text-amber-100">
                                        Agency Phone
                                    </Label>
                                    <Input 
                                        id="phone" 
                                        type="tel"
                                        value={formData.phone} 
                                        onChange={handleInputChange} 
                                        placeholder="+1 (555) 123-4567"
                                        className="border-amber-300 focus:border-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-amber-600" />
                                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Address Information</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-amber-900 dark:text-amber-100">
                                    Street Address <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                    id="address" 
                                    value={formData.address} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="123 Main Street"
                                    className="border-amber-300 focus:border-amber-500"
                                />
                            </div>
                            
                            <div className="grid md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city" className="text-amber-900 dark:text-amber-100">City</Label>
                                    <Input 
                                        id="city" 
                                        value={formData.city} 
                                        onChange={handleInputChange} 
                                        placeholder="City"
                                        className="border-amber-300 focus:border-amber-500"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="state" className="text-amber-900 dark:text-amber-100">State</Label>
                                    <Input 
                                        id="state" 
                                        value={formData.state} 
                                        onChange={handleInputChange} 
                                        placeholder="State"
                                        className="border-amber-300 focus:border-amber-500"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code" className="text-amber-900 dark:text-amber-100">Postal Code</Label>
                                    <Input 
                                        id="postal_code" 
                                        value={formData.postal_code} 
                                        onChange={handleInputChange} 
                                        placeholder="12345"
                                        className="border-amber-300 focus:border-amber-500"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="country" className="text-amber-900 dark:text-amber-100">Country</Label>
                                    <Input 
                                        id="country" 
                                        value={formData.country} 
                                        onChange={handleInputChange} 
                                        placeholder="United States"
                                        className="border-amber-300 focus:border-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Owner Information Display */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Shield className="w-5 h-5 text-amber-600" />
                                <h4 className="font-semibold text-amber-900 dark:text-amber-100">Account Owner</h4>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-amber-700 dark:text-amber-300">Owner Email</Label>
                                    <p className="text-amber-900 dark:text-amber-100 font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <Label className="text-amber-700 dark:text-amber-300">Owner Name</Label>
                                    <p className="text-amber-900 dark:text-amber-100 font-medium">{user.name || "Not specified"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            disabled={submitting} 
                            className="w-full bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-lg py-6"
                        >
                            {submitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Creating Agency...
                                </div>
                            ) : (
                                "Create My Agency"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}