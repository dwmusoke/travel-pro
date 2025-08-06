import React, { useState, useEffect } from "react";
import { Agency, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, CheckCircle, Clock, AlertTriangle, Eye, Edit, Trash2, X, Play, Search, Save, Users } from "lucide-react";

export default function AgencyManagement() {
  const [agencies, setAgencies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [viewAgency, setViewAgency] = useState(null);
  const [editAgency, setEditAgency] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAgencies();
    loadUsers();
  }, []);

  const loadAgencies = async () => {
    setLoading(true);
    try {
      const agencyList = await Agency.list('-created_date');
      setAgencies(agencyList);
    } catch (error) {
      console.error("Error loading agencies:", error);
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    const userList = await User.list();
    setUsers(userList);
  };

  const getAgencyUserCount = (agencyId) => {
    return users.filter(user => user.agency_id === agencyId).length;
  };

  const handleStatusChange = async (agencyId, newStatus) => {
    try {
      await Agency.update(agencyId, { subscription_status: newStatus });
      loadAgencies();
    } catch (error) {
      console.error(`Error updating agency status:`, error);
    }
  };

  const handleViewAgency = (agency) => {
    setViewAgency(agency);
    setIsViewModalOpen(true);
  };

  const handleEditAgency = (agency) => {
    setEditAgency({
      ...agency,
      settings: {
        currency: agency.settings?.currency || 'USD',
        timezone: agency.settings?.timezone || 'UTC',
        invoice_prefix: agency.settings?.invoice_prefix || 'INV',
        booking_prefix: agency.settings?.booking_prefix || 'BKG',
        brand_color: agency.settings?.brand_color || '#D4B382',
        ...agency.settings
      },
      tax_settings: {
        efris_enabled: agency.tax_settings?.efris_enabled || false,
        eu_vat_enabled: agency.tax_settings?.eu_vat_enabled || false,
        tin_number: agency.tax_settings?.tin_number || '',
        vat_number: agency.tax_settings?.vat_number || '',
        ...agency.tax_settings
      }
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAgency = async () => {
    if (!editAgency) return;
    setSaving(true);
    try {
      await Agency.update(editAgency.id, editAgency);
      setIsEditModalOpen(false);
      setEditAgency(null);
      loadAgencies();
      alert("Agency updated successfully!");
    } catch (error) {
      console.error("Error updating agency:", error);
      alert("Failed to update agency.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (path, value) => {
    const keys = path.split('.');
    setEditAgency(prev => {
      let current = { ...prev };
      let pointer = current;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!pointer[keys[i]]) {
          pointer[keys[i]] = {};
        }
        pointer = pointer[keys[i]];
      }
      pointer[keys[keys.length - 1]] = value;
      return current;
    });
  };

  const filteredAgencies = agencies.filter(agency => {
    const searchMatch = searchTerm === "" || 
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.email.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === "all" || agency.subscription_status === statusFilter;
    const planMatch = planFilter === "all" || agency.subscription_plan === planFilter;
    return searchMatch && statusMatch && planMatch;
  });

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
      case 'trial':
        return { color: 'bg-emerald-100/50 text-emerald-800 border-emerald-300' };
      case 'pending_approval':
        return { color: 'bg-yellow-100/50 text-yellow-800 border-yellow-300' };
      case 'suspended':
      case 'rejected':
      case 'cancelled':
        return { color: 'bg-red-100/50 text-red-800 border-red-300' };
      default:
        return { color: 'bg-stone-100/50 text-stone-800 border-stone-300' };
    }
  };

  const stats = {
    total: agencies.length,
    active: agencies.filter(a => a.subscription_status === 'active').length,
    pending: agencies.filter(a => a.subscription_status === 'pending_approval').length,
    trial: agencies.filter(a => a.subscription_status === 'trial').length,
  };

  return (
    <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Agency Management</h1>
          <p className="text-amber-800/80">Manage and monitor all travel agencies on the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700/80">Total Agencies</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.total}</p>
                </div>
                <Building className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700/80">Active Agencies</p>
                  <p className="text-2xl font-bold text-green-700">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700/80">Pending Approval</p>
                  <p className="text-2xl font-bold text-orange-700">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700/80">Trial Agencies</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.trial}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <Card className="mb-8 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-amber-600" />
                <Input
                  placeholder="Search agencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-amber-100/50 border-amber-300/50 text-amber-900 placeholder:text-amber-700/70"
                />
              </div>
              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 bg-amber-100/50 border-amber-300/50 text-amber-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-50 border-amber-200">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="pending_approval">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-40 bg-amber-100/50 border-amber-300/50 text-amber-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-50 border-amber-200">
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agencies List */}
        <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-amber-900">
              <span className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                All Agencies
              </span>
              <Badge variant="outline" className="bg-amber-100/50 text-amber-800 border-amber-300/50">{filteredAgencies.length} agencies</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAgencies.map((agency) => (
                <div key={agency.id} className="p-4 bg-amber-100/40 border border-amber-300/50 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-200/70">
                        <Building className="w-5 h-5 text-amber-800" />
                      </div>
                      <div>
                        <p className="font-semibold text-amber-900">{agency.name}</p>
                        <p className="text-sm text-amber-700/80">{agency.email}</p>
                        <p className="text-xs text-amber-600/70">Office ID: {agency.office_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-amber-700/80">
                      <span>{agency.country || 'N/A'}</span>
                      <span>{getAgencyUserCount(agency.id)} users</span>
                      <span>Created: {new Date(agency.created_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusInfo(agency.subscription_status).color} capitalize`}>{agency.subscription_status.replace('_', ' ')}</Badge>
                      <Badge variant="outline" className="capitalize bg-amber-100/50 text-amber-800 border-amber-300/50">{agency.subscription_plan}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewAgency(agency)}
                        className="bg-amber-100/50 text-amber-800 border-amber-300 hover:bg-amber-100/70 rounded-lg"
                      >
                        <Eye className="w-4 h-4 mr-1" />View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditAgency(agency)}
                        className="bg-blue-100/50 text-blue-800 border-blue-300 hover:bg-blue-100/70 rounded-lg"
                      >
                        <Edit className="w-4 h-4 mr-1" />Edit
                      </Button>
                      {agency.subscription_status === 'pending_approval' && (
                        <Button size="sm" onClick={() => handleStatusChange(agency.id, 'active')} className="bg-green-600 hover:bg-green-700 text-white rounded-lg"><Play className="w-4 h-4 mr-1" />Activate</Button>
                      )}
                      {agency.subscription_status === 'active' && (
                        <Button size="sm" onClick={() => handleStatusChange(agency.id, 'suspended')} className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg"><X className="w-4 h-4 mr-1" />Suspend</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* View Agency Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-900">Agency Details - {viewAgency?.name}</DialogTitle>
            </DialogHeader>
            {viewAgency && (
              <div className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-amber-200/50 backdrop-blur-sm border border-amber-300/50 rounded-xl text-amber-800">
                    <TabsTrigger value="basic" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 rounded-lg">Basic Info</TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 rounded-lg">Settings</TabsTrigger>
                    <TabsTrigger value="financial" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 rounded-lg">Financial</TabsTrigger>
                    <TabsTrigger value="users" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 rounded-lg">Users</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-amber-900">Agency Name</Label>
                        <p className="p-2 bg-amber-100/50 rounded border">{viewAgency.name}</p>
                      </div>
                      <div>
                        <Label className="text-amber-900">Email</Label>
                        <p className="p-2 bg-amber-100/50 rounded border">{viewAgency.email}</p>
                      </div>
                      <div>
                        <Label className="text-amber-900">Office ID</Label>
                        <p className="p-2 bg-amber-100/50 rounded border">{viewAgency.office_id}</p>
                      </div>
                      <div>
                        <Label className="text-amber-900">Phone</Label>
                        <p className="p-2 bg-amber-100/50 rounded border">{viewAgency.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-amber-900">Country</Label>
                        <p className="p-2 bg-amber-100/50 rounded border">{viewAgency.country || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-amber-900">Subscription Plan</Label>
                        <p className="p-2 bg-amber-100/50 rounded border capitalize">{viewAgency.subscription_plan}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-amber-900">Currency</Label>
                        <p className="p-2 bg-amber-100/50 rounded border">{viewAgency.settings?.currency || 'USD'}</p>
                      </div>
                      <div>
                        <Label className="text-amber-900">Timezone</Label>
                        <p className="p-2 bg-amber-100/50 rounded border">{viewAgency.settings?.timezone || 'UTC'}</p>
                      </div>
                      <div>
                        <Label className="text-amber-900">Invoice Prefix</Label>
                        <p className="p-2 bg-amber-100/50 rounded border">{viewAgency.settings?.invoice_prefix || 'INV'}</p>
                      </div>
                      <div>
                        <Label className="text-amber-900">Brand Color</Label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: viewAgency.settings?.brand_color || '#D4B382' }}
                          ></div>
                          <p className="p-2 bg-amber-100/50 rounded border">{viewAgency.settings?.brand_color || '#D4B382'}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="financial" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-amber-900">TIN Number</Label>
                        <p className="p-2 bg-amber-100/50 rounded border">{viewAgency.tax_settings?.tin_number || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-amber-900">VAT Number</Label>
                        <p className="p-2 bg-amber-100/50 rounded border">{viewAgency.tax_settings?.vat_number || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-amber-900">EFRIS Enabled</Label>
                        <p className="p-2 bg-amber-100/50 rounded border">{viewAgency.tax_settings?.efris_enabled ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <Label className="text-amber-900">EU VAT Enabled</Label>
                        <p className="p-2 bg-amber-100/50 rounded border">{viewAgency.tax_settings?.eu_vat_enabled ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="users" className="space-y-4">
                    <div>
                      <Label className="text-amber-900">Agency Users ({getAgencyUserCount(viewAgency.id)})</Label>
                      <div className="space-y-2 mt-2">
                        {users.filter(u => u.agency_id === viewAgency.id).map(user => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-amber-100/50 rounded border">
                            <div>
                              <p className="font-medium text-amber-900">{user.full_name}</p>
                              <p className="text-sm text-amber-700">{user.email}</p>
                            </div>
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                              {user.app_role || user.role}
                            </Badge>
                          </div>
                        ))}
                        {getAgencyUserCount(viewAgency.id) === 0 && (
                          <p className="text-amber-700/70 italic">No users found for this agency</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Agency Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-900">Edit Agency - {editAgency?.name}</DialogTitle>
            </DialogHeader>
            {editAgency && (
              <div className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-amber-200/50 backdrop-blur-sm border border-amber-300/50 rounded-xl text-amber-800">
                    <TabsTrigger value="basic" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 rounded-lg">Basic Info</TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 rounded-lg">Settings</TabsTrigger>
                    <TabsTrigger value="financial" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 rounded-lg">Financial</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-amber-900">Agency Name</Label>
                        <Input
                          value={editAgency.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-900">Email</Label>
                        <Input
                          value={editAgency.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-900">Office ID</Label>
                        <Input
                          value={editAgency.office_id || ''}
                          onChange={(e) => handleInputChange('office_id', e.target.value)}
                          className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-900">Phone</Label>
                        <Input
                          value={editAgency.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-900">Country</Label>
                        <Input
                          value={editAgency.country || ''}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-900">Subscription Plan</Label>
                        <Select
                          value={editAgency.subscription_plan}
                          onValueChange={(value) => handleInputChange('subscription_plan', value)}
                        >
                          <SelectTrigger className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-amber-900">Address</Label>
                      <Textarea
                        value={editAgency.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-amber-900">Currency</Label>
                        <Input
                          value={editAgency.settings?.currency || 'USD'}
                          onChange={(e) => handleInputChange('settings.currency', e.target.value)}
                          className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-900">Timezone</Label>
                        <Input
                          value={editAgency.settings?.timezone || 'UTC'}
                          onChange={(e) => handleInputChange('settings.timezone', e.target.value)}
                          className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-900">Invoice Prefix</Label>
                        <Input
                          value={editAgency.settings?.invoice_prefix || 'INV'}
                          onChange={(e) => handleInputChange('settings.invoice_prefix', e.target.value)}
                          className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-900">Brand Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={editAgency.settings?.brand_color || '#D4B382'}
                            onChange={(e) => handleInputChange('settings.brand_color', e.target.value)}
                            className="w-16 p-1"
                          />
                          <Input
                            value={editAgency.settings?.brand_color || '#D4B382'}
                            onChange={(e) => handleInputChange('settings.brand_color', e.target.value)}
                            className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="financial" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-amber-900">TIN Number</Label>
                        <Input
                          value={editAgency.tax_settings?.tin_number || ''}
                          onChange={(e) => handleInputChange('tax_settings.tin_number', e.target.value)}
                          className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-900">VAT Number</Label>
                        <Input
                          value={editAgency.tax_settings?.vat_number || ''}
                          onChange={(e) => handleInputChange('tax_settings.vat_number', e.target.value)}
                          className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
                className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAgency} 
                disabled={saving}
                className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}