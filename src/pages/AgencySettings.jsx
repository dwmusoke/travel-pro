
import React, { useState, useEffect } from "react";
import { User, Agency } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Palette,
  DollarSign,
  Power,
  Link2,
  Save,
  UserCog,
  Shield,
  AlertCircle,
  CreditCard,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const modules = [
    { id: "sales_pipeline", name: "Sales Pipeline" },
    { id: "travel_services", name: "Travel Services" }, // Added Travel Services module
    { id: "bsp_reconciliation", name: "BSP Reconciliation" },
    { id: "financial_management", name: "Financial Management" },
    { id: "ticket_tracker", name: "Ticket Tracker" },
    { id: "client_crm", name: "Client CRM" },
    { id: "workflows", name: "Workflows" },
    { id: "billing", name: "Billing" },
];

export default function AgencySettings() {
  const [user, setUser] = useState(null);
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // State for active tab

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        if (userData.agency_id) {
          const agencyData = await Agency.get(userData.agency_id);
          setAgency(agencyData);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Preserving the original robust handleInputChange
  const handleInputChange = (path, value) => {
    const keys = path.split('.');
    setAgency(prev => {
        let current = { ...prev };
        let pointer = current;
        for (let i = 0; i < keys.length - 1; i++) {
            // If any nested object in the path does not exist, initialize it
            if (!pointer[keys[i]]) {
                pointer[keys[i]] = {};
            }
            pointer = pointer[keys[i]];
        }
        pointer[keys[keys.length - 1]] = value;
        return current;
    });
  };

  // New handleCheckboxChange as a wrapper
  const handleCheckboxChange = (path, checked) => {
    handleInputChange(path, checked);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const { file_url } = await UploadFile({ file });
        handleInputChange("settings.logo_url", file_url);
    } catch (error) {
        console.error("Error uploading logo:", error);
        alert("Logo upload failed.");
    }
  };

  const handleSave = async () => {
    if (!agency) return;
    setSaving(true);
    try {
      // Initialize nested objects if they don't exist
      const updatedAgency = {
        ...agency,
        settings: {
          currency: agency.settings?.currency || 'USD',
          timezone: agency.settings?.timezone || 'UTC', // Ensure timezone is initialized if missing
          invoice_prefix: agency.settings?.invoice_prefix || 'INV',
          booking_prefix: agency.settings?.booking_prefix || 'BKG',
          brand_color: agency.settings?.brand_color || '#D4B382',
          modules: {
            sales_pipeline: agency.settings?.modules?.sales_pipeline ?? true,
            travel_services: agency.settings?.modules?.travel_services ?? true, // Initialized Travel Services
            bsp_reconciliation: agency.settings?.modules?.bsp_reconciliation ?? true,
            financial_management: agency.settings?.modules?.financial_management ?? true,
            ticket_tracker: agency.settings?.modules?.ticket_tracker ?? true,
            client_crm: agency.settings?.modules?.client_crm ?? true,
            workflows: agency.settings?.modules?.workflows ?? true,
            billing: agency.settings?.modules?.billing ?? true,
          },
          gds_connections: {
            amadeus: agency.settings?.gds_connections?.amadeus || {},
            sabre: agency.settings?.gds_connections?.sabre || {},
            galileo: agency.settings?.gds_connections?.galileo || {}
          },
          payment_gateways: {
            stripe: agency.settings?.payment_gateways?.stripe || { publishable_key: '', secret_key: '' },
            paypal: agency.settings?.payment_gateways?.paypal || { client_id: '', client_secret: '' },
            flutterwave: agency.settings?.payment_gateways?.flutterwave || { public_key: '', secret_key: '' }
          },
          financial_settings: {
            default_tax_rate: agency.settings?.financial_settings?.default_tax_rate ?? 0,
            enable_credit_control: agency.settings?.financial_settings?.enable_credit_control ?? false,
            default_service_charge_type: agency.settings?.financial_settings?.default_service_charge_type || 'fixed',
            default_service_charge_value: agency.settings?.financial_settings?.default_service_charge_value ?? 0
          },
        },
        tax_settings: {
          efris_enabled: agency.tax_settings?.efris_enabled ?? false,
          eu_vat_enabled: agency.tax_settings?.eu_vat_enabled ?? false,
          tin_number: agency.tax_settings?.tin_number || '',
          vat_number: agency.tax_settings?.vat_number || '',
        }
      };

      await Agency.update(agency.id, updatedAgency);
      setAgency(updatedAgency); // Update local state with the newly structured agency data
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}><Skeleton className="h-96 w-full bg-amber-200/50" /></div>
    );
  }

  if (!user || !agency) {
      return (
          <div className="p-8 text-center min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-amber-900">No Agency Found</h2>
              <p className="text-amber-800/80">You need to be associated with an agency to access these settings.</p>
          </div>
      );
  }

  const canEdit = user.app_role === 'agency_admin' || user.app_role === 'super_admin';

  return (
    <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-4xl mx-auto"> {/* Changed max-w-5xl to max-w-4xl */}
        <div className="flex items-center justify-between mb-8"> {/* Retained flex layout for title and save button */}
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Agency Settings</h1>
            <p className="text-amber-800/80">
              {canEdit ? "Manage your agency's modules, integrations, and branding." : "View your agency's configuration."}
            </p>
          </div>
          {canEdit && (
            <Button onClick={handleSave} disabled={saving} className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
              <Save className="w-4 h-4 mr-2"/>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>

        {/* User Management Notice */}
        <Card className="mb-6 bg-blue-100/50 backdrop-blur-md border border-blue-200/50 rounded-xl shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <UserCog className="w-8 h-8 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">User Management</h3>
                <p className="text-blue-800 mb-4">
                  Invite, edit, and manage your team members from the dedicated User Management page.
                </p>
                <Link to={createPageUrl("AgencyUserManagement")}>
                    <Button variant="outline" className="bg-white/50 backdrop-blur-sm text-blue-800 border-blue-300/50 hover:bg-white/70 rounded-xl shadow-sm">
                        <Users className="w-4 h-4 mr-2"/>
                        Go to User Management
                    </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for settings */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-amber-200/50 backdrop-blur-sm border border-amber-300/50 rounded-xl text-amber-800">
            <TabsTrigger value="general" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">General</TabsTrigger>
            <TabsTrigger value="gds" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">GDS Setup</TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Financial</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Payments</TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Modules</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900"><Building className="text-amber-800"/>Agency Information</CardTitle>
                <CardDescription className="text-amber-700/70">Update your agency's basic information and branding.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Profile */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-amber-900">Company Profile</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-amber-900">Agency Name</Label>
                        <Input
                          value={agency.name || ''}
                          onChange={e => handleInputChange('name', e.target.value)}
                          disabled={!canEdit}
                          className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-900">Contact Email</Label>
                        <Input
                          value={agency.email || ''}
                          onChange={e => handleInputChange('email', e.target.value)}
                          disabled={!canEdit}
                          className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                        />
                      </div>
                  </div>
                  <div>
                    <Label className="text-amber-900">Phone</Label>
                    <Input
                      value={agency.phone || ''}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      disabled={!canEdit}
                      className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                    />
                  </div>
                  <div>
                    <Label className="text-amber-900">Address</Label>
                    <Input
                      value={agency.address || ''}
                      onChange={e => handleInputChange('address', e.target.value)}
                      disabled={!canEdit}
                      className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                    />
                  </div>
                </div>

                {/* Branding */}
                <div className="space-y-4 pt-4 border-t border-amber-200/50">
                  <h3 className="font-semibold text-lg text-amber-900 flex items-center gap-2"><Palette className="text-amber-800"/>Branding</h3>
                  <div className="flex items-center gap-4">
                      <img
                        src={agency.settings?.logo_url || 'https://via.placeholder.com/150'}
                        alt="Agency Logo"
                        className="w-24 h-24 rounded-lg object-cover bg-amber-200/50 border border-amber-300/50"
                      />
                      {canEdit && (
                        <div>
                            <Label className="text-amber-900">Agency Logo</Label>
                            <Input type="file" accept="image/*" onChange={handleLogoUpload} className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70" />
                            <p className="text-sm text-amber-700/80 mt-1">Recommended size: 200x200px</p>
                        </div>
                      )}
                  </div>
                  <div>
                      <Label className="text-amber-900">Brand Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={agency.settings?.brand_color || '#D4B382'}
                          onChange={e => handleInputChange('settings.brand_color', e.target.value)}
                          className="w-24 p-1"
                          disabled={!canEdit}
                        />
                        <span className="text-sm text-amber-800 font-mono">{agency.settings?.brand_color || '#D4B382'}</span>
                      </div>
                  </div>
                  <div>
                    <Label className="text-amber-900">Default Timezone</Label>
                    <Input
                        value={agency.settings?.timezone || 'UTC'}
                        onChange={e => handleInputChange('settings.timezone', e.target.value)}
                        disabled={!canEdit}
                        className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                    />
                    <p className="text-sm text-amber-700/80 mt-1">e.g., Africa/Nairobi, America/New_York</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GDS Setup Tab */}
          <TabsContent value="gds">
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900"><Link2 className="text-amber-800"/>GDS Connections</CardTitle>
                <CardDescription className="text-amber-700/70">Connect your agency to various Global Distribution Systems (GDS).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-amber-900">Amadeus (1A)</h3>
                  <div className="grid md:grid-cols-3 gap-4 p-4 border rounded-lg bg-amber-100/40 border-amber-200/50 backdrop-blur-sm">
                    <div><Label className="text-amber-900">Office ID</Label><Input value={agency.settings?.gds_connections?.amadeus?.office_id || ''} onChange={e => handleInputChange('settings.gds_connections.amadeus.office_id', e.target.value)} disabled={!canEdit} className="bg-white/50 border-amber-300/50 focus:bg-white/70"/></div>
                    <div><Label className="text-amber-900">API Key</Label><Input type="password" value={agency.settings?.gds_connections?.amadeus?.api_key || ''} onChange={e => handleInputChange('settings.gds_connections.amadeus.api_key', e.target.value)} disabled={!canEdit} className="bg-white/50 border-amber-300/50 focus:bg-white/70"/></div>
                    <div><Label className="text-amber-900">API Secret</Label><Input type="password" value={agency.settings?.gds_connections?.amadeus?.api_secret || ''} onChange={e => handleInputChange('settings.gds_connections.amadeus.api_secret', e.target.value)} disabled={!canEdit} className="bg-white/50 border-amber-300/50 focus:bg-white/70"/></div>
                  </div>
                </div>
                 <div>
                  <h3 className="font-semibold text-lg mb-2 text-amber-900">Sabre (AA)</h3>
                  <div className="grid md:grid-cols-3 gap-4 p-4 border rounded-lg bg-amber-100/40 border-amber-200/50 backdrop-blur-sm">
                    <div><Label className="text-amber-900">Username</Label><Input value={agency.settings?.gds_connections?.sabre?.username || ''} onChange={e => handleInputChange('settings.gds_connections.sabre.username', e.target.value)} disabled={!canEdit} className="bg-white/50 border-amber-300/50 focus:bg-white/70"/></div>
                    <div><Label className="text-amber-900">Password</Label><Input type="password" value={agency.settings?.gds_connections?.sabre?.password || ''} onChange={e => handleInputChange('settings.gds_connections.sabre.password', e.target.value)} disabled={!canEdit} className="bg-white/50 border-amber-300/50 focus:bg-white/70"/></div>
                    <div><Label className="text-amber-900">PCC</Label><Input value={agency.settings?.gds_connections?.sabre?.pcc || ''} onChange={e => handleInputChange('settings.gds_connections.sabre.pcc', e.target.value)} disabled={!canEdit} className="bg-white/50 border-amber-300/50 focus:bg-white/70"/></div>
                  </div>
                </div>
                 <div>
                  <h3 className="font-semibold text-lg mb-2 text-amber-900">Galileo (1G)</h3>
                  <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-amber-100/40 border-amber-200/50 backdrop-blur-sm">
                    <div><Label className="text-amber-900">Profile ID</Label><Input value={agency.settings?.gds_connections?.galileo?.profile_id || ''} onChange={e => handleInputChange('settings.gds_connections.galileo.profile_id', e.target.value)} disabled={!canEdit} className="bg-white/50 border-amber-300/50 focus:bg-white/70"/></div>
                    <div><Label className="text-amber-900">API Key</Label><Input type="password" value={agency.settings?.gds_connections?.galileo?.api_key || ''} onChange={e => handleInputChange('settings.gds_connections.galileo.api_key', e.target.value)} disabled={!canEdit} className="bg-white/50 border-amber-300/50 focus:bg-white/70"/></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial">
            {/* Financial Defaults */}
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900"><DollarSign className="text-amber-800"/>Financial Defaults</CardTitle>
                <CardDescription className="text-amber-700/70">Set default currency and invoice numbering.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                 <div><Label className="text-amber-900">Default Currency</Label><Input value={agency.settings?.currency || 'USD'} onChange={e => handleInputChange('settings.currency', e.target.value)} disabled={!canEdit} className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70" /></div>
                 <div><Label className="text-amber-900">Invoice Prefix</Label><Input value={agency.settings?.invoice_prefix || 'INV-'} onChange={e => handleInputChange('settings.invoice_prefix', e.target.value)} disabled={!canEdit} className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70" /></div>
              </CardContent>
            </Card>

            {/* Financial Settings & Service Charge Rules */}
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900"><DollarSign className="w-5 h-5 text-amber-800"/>Financial & Service Charge Rules</CardTitle>
                    <CardDescription className="text-amber-700/70">Configure default tax rates and service charge application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="default_tax_rate" className="text-amber-900">Default Tax Rate (%)</Label>
                            <Input
                                id="default_tax_rate"
                                type="number"
                                value={agency.settings?.financial_settings?.default_tax_rate || 0}
                                onChange={(e) => handleInputChange('settings.financial_settings.default_tax_rate', Number(e.target.value))}
                                disabled={!canEdit}
                                className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                            />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-amber-200/50">
                        <h4 className="font-medium mb-2 text-amber-900">Default Service Charge</h4>
                        <p className="text-sm text-amber-700/80 mb-4">This rule is automatically applied to all new invoices generated from tickets.</p>
                        <div className="grid md:grid-cols-2 gap-4">
                             <div>
                                <Label htmlFor="service_charge_type" className="text-amber-900">Charge Type</Label>
                                 <Select
                                    value={agency.settings?.financial_settings?.default_service_charge_type || 'fixed'}
                                    onValueChange={(value) => handleInputChange('settings.financial_settings.default_service_charge_type', value)}
                                    disabled={!canEdit}
                                >
                                    <SelectTrigger className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70 text-amber-900"><SelectValue/></SelectTrigger>
                                    <SelectContent className="bg-amber-50 border-amber-200 text-amber-900">
                                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                                        <SelectItem value="percentage">Percentage of Fare</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="service_charge_value" className="text-amber-900">Value</Label>
                                <Input
                                    id="service_charge_value"
                                    type="number"
                                    value={agency.settings?.financial_settings?.default_service_charge_value || 0}
                                    onChange={(e) => handleInputChange('settings.financial_settings.default_service_charge_value', Number(e.target.value))}
                                    disabled={!canEdit}
                                    className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-4 border-t border-amber-200/50">
                        <Switch
                            id="enable_credit_control"
                            checked={agency.settings?.financial_settings?.enable_credit_control || false}
                            onCheckedChange={(checked) => handleInputChange('settings.financial_settings.enable_credit_control', checked)}
                            disabled={!canEdit}
                        />
                        <Label htmlFor="enable_credit_control" className="text-amber-900">Enable Credit Control for Clients</Label>
                    </div>
                </CardContent>
            </Card>

            {/* Tax Settings */}
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900"><Shield className="text-amber-800"/>Tax Settings</CardTitle>
                <CardDescription className="text-amber-700/70">Manage your agency's tax identification and regional tax settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-100/40 border-amber-200/50 backdrop-blur-sm">
                    <Label className="text-amber-900">Enable Uganda EFRIS</Label>
                    <Switch checked={agency.tax_settings?.efris_enabled ?? false} onCheckedChange={checked => handleCheckboxChange('tax_settings.efris_enabled', checked)} disabled={!canEdit}/>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-100/40 border-amber-200/50 backdrop-blur-sm">
                    <Label className="text-amber-900">Enable EU VAT</Label>
                    <Switch checked={agency.tax_settings?.eu_vat_enabled ?? false} onCheckedChange={checked => handleCheckboxChange('tax_settings.eu_vat_enabled', checked)} disabled={!canEdit}/>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div><Label className="text-amber-900">TIN Number</Label><Input value={agency.tax_settings?.tin_number || ''} onChange={e => handleInputChange('tax_settings.tin_number', e.target.value)} disabled={!canEdit} className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70" /></div>
                    <div><Label className="text-amber-900">VAT Number</Label><Input value={agency.tax_settings?.vat_number || ''} onChange={e => handleInputChange('tax_settings.vat_number', e.target.value)} disabled={!canEdit} className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70" /></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900"><CreditCard className="w-5 h-5 text-amber-800"/>Payment Gateways</CardTitle>
                    <CardDescription className="text-amber-700/70">Connect your payment providers to accept online payments on invoices.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Stripe */}
                    <div>
                        <h3 className="font-semibold mb-2 text-amber-900">Stripe</h3>
                        <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-amber-100/40 border-amber-200/50 backdrop-blur-sm">
                            <div>
                                <Label htmlFor="stripe_pk" className="text-amber-900">Publishable Key</Label>
                                <Input
                                    id="stripe_pk"
                                    value={agency.settings?.payment_gateways?.stripe?.publishable_key || ''}
                                    onChange={(e) => handleInputChange('settings.payment_gateways.stripe.publishable_key', e.target.value)}
                                    disabled={!canEdit}
                                    className="bg-white/50 border-amber-300/50 focus:bg-white/70"
                                />
                            </div>
                            <div>
                                <Label htmlFor="stripe_sk" className="text-amber-900">Secret Key</Label>
                                <Input
                                    id="stripe_sk"
                                    type="password"
                                    value={agency.settings?.payment_gateways?.stripe?.secret_key || ''}
                                    onChange={(e) => handleInputChange('settings.payment_gateways.stripe.secret_key', e.target.value)}
                                    disabled={!canEdit}
                                    className="bg-white/50 border-amber-300/50 focus:bg-white/70"
                                />
                            </div>
                        </div>
                    </div>
                    {/* PayPal */}
                    <div>
                        <h3 className="font-semibold mb-2 text-amber-900">PayPal</h3>
                        <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-amber-100/40 border-amber-200/50 backdrop-blur-sm">
                            <div>
                                <Label htmlFor="paypal_client_id" className="text-amber-900">Client ID</Label>
                                <Input
                                    id="paypal_client_id"
                                    value={agency.settings?.payment_gateways?.paypal?.client_id || ''}
                                    onChange={(e) => handleInputChange('settings.payment_gateways.paypal.client_id', e.target.value)}
                                    disabled={!canEdit}
                                    className="bg-white/50 border-amber-300/50 focus:bg-white/70"
                                />
                            </div>
                            <div>
                                <Label htmlFor="paypal_secret" className="text-amber-900">Client Secret</Label>
                                <Input
                                    id="paypal_secret"
                                    type="password"
                                    value={agency.settings?.payment_gateways?.paypal?.client_secret || ''}
                                    onChange={(e) => handleInputChange('settings.payment_gateways.paypal.client_secret', e.target.value)}
                                    disabled={!canEdit}
                                    className="bg-white/50 border-amber-300/50 focus:bg-white/70"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Flutterwave */}
                    <div>
                        <h3 className="font-semibold mb-2 text-amber-900">Flutterwave</h3>
                        <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-amber-100/40 border-amber-200/50 backdrop-blur-sm">
                            <div>
                                <Label htmlFor="flutterwave_pk" className="text-amber-900">Public Key</Label>
                                <Input
                                    id="flutterwave_pk"
                                    value={agency.settings?.payment_gateways?.flutterwave?.public_key || ''}
                                    onChange={(e) => handleInputChange('settings.payment_gateways.flutterwave.public_key', e.target.value)}
                                    disabled={!canEdit}
                                    className="bg-white/50 border-amber-300/50 focus:bg-white/70"
                                />
                            </div>
                            <div>
                                <Label htmlFor="flutterwave_sk" className="text-amber-900">Secret Key</Label>
                                <Input
                                    id="flutterwave_sk"
                                    type="password"
                                    value={agency.settings?.payment_gateways?.flutterwave?.secret_key || ''}
                                    onChange={(e) => handleInputChange('settings.payment_gateways.flutterwave.secret_key', e.target.value)}
                                    disabled={!canEdit}
                                    className="bg-white/50 border-amber-300/50 focus:bg-white/70"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules">
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900"><Power className="text-amber-800"/>Module Management</CardTitle>
                <CardDescription className="text-amber-700/70">Enable or disable specific modules for your agency.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {modules.map(module => (
                    <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg bg-amber-100/40 border-amber-200/50 backdrop-blur-sm">
                        <Label htmlFor={module.id} className="text-amber-900">{module.name}</Label>
                        <Switch
                          id={module.id}
                          checked={agency.settings?.modules?.[module.id] ?? true}
                          onCheckedChange={checked => handleInputChange(`settings.modules.${module.id}`, checked)}
                          disabled={!canEdit}
                        />
                    </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
