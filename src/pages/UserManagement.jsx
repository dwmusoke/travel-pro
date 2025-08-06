
import React, { useState, useEffect } from "react";
import { User, Agency } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  UserPlus, 
  Shield, 
  UserCog, 
  Edit, 
  Search, 
  UserX, 
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Activity,
  Key,
  Eye,
  EyeOff,
  Save,
  X,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Lock,
  Unlock,
  Send,
  Copy,
  Download
} from "lucide-react";
import { format } from "date-fns";

// Enhanced User Detail Modal
const UserDetailModal = ({ user, agencies, onClose, onSave, onInvite }) => {
  const [formData, setFormData] = useState(user || {});
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    try {
      await onInvite(formData);
      onClose();
    } catch (error) {
      console.error("Error inviting user:", error);
    }
  };

  const getRolePermissions = (role) => {
    const permissions = {
      super_admin: {
        description: "Full platform access and control",
        permissions: [
          "Manage all agencies and users",
          "Access system settings",
          "View all data and reports",
          "Manage platform configuration",
          "Override any restrictions"
        ]
      },
      agency_admin: {
        description: "Full agency management and control",
        permissions: [
          "Manage agency users",
          "Access agency data and reports",
          "Manage agency settings",
          "Create and manage bookings",
          "Access financial data"
        ]
      },
      agent: {
        description: "Standard agent with booking capabilities",
        permissions: [
          "Create and manage bookings",
          "Access client data",
          "Generate invoices",
          "View agency reports",
          "Manage assigned clients"
        ]
      },
      viewer: {
        description: "Read-only access to assigned data",
        permissions: [
          "View assigned bookings",
          "View client information",
          "View reports (read-only)",
          "No editing capabilities"
        ]
      }
    };
    return permissions[role] || permissions.viewer;
  };

  const roleInfo = getRolePermissions(formData.app_role);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            {user ? `Edit User: ${user.full_name}` : "Invite New User"}
          </DialogTitle>
          <DialogDescription>
            {user ? "Update user information and permissions." : "Invite a new user to join the platform."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input 
                    id="full_name" 
                    value={formData.full_name || ''} 
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email || ''} 
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone || ''} 
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position/Title</Label>
                  <Input 
                    id="position" 
                    value={formData.position || ''} 
                    onChange={handleInputChange}
                    placeholder="Enter position or title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department" 
                    value={formData.department || ''} 
                    onChange={handleInputChange}
                    placeholder="Enter department"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_id">Agency</Label>
                  <Select 
                    value={formData.agency_id || ''} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, agency_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agency" />
                    </SelectTrigger>
                    <SelectContent>
                      {agencies.map(agency => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {!user && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Account Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="app_role">Role</Label>
                    <Select 
                      value={formData.app_role || 'agent'} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, app_role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agency_admin">Agency Admin</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invitation_message">Invitation Message (Optional)</Label>
                    <Textarea 
                      id="invitation_message" 
                      value={formData.invitation_message || ''} 
                      onChange={handleInputChange}
                      placeholder="Add a personal message to the invitation email..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Role & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Current Role</Label>
                  <div className="p-4 bg-amber-100/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">
                        {formData.app_role?.replace('_', ' ') || 'No Role'}
                      </Badge>
                    </div>
                    <p className="text-sm text-amber-700 mb-3">{roleInfo.description}</p>
                    <div className="space-y-1">
                      {roleInfo.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {user && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_active">Account Active</Label>
                      <Switch
                        id="is_active"
                        checked={formData.is_active !== false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email_verified">Email Verified</Label>
                      <Switch
                        id="email_verified"
                        checked={formData.email_verified === true}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_verified: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="two_factor_enabled">Two-Factor Authentication</Label>
                      <Switch
                        id="two_factor_enabled"
                        checked={formData.two_factor_enabled === true}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, two_factor_enabled: checked }))}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  User Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-amber-100/50 rounded-lg">
                        <p className="text-sm text-amber-700">Last Login</p>
                        <p className="font-semibold">
                          {user.last_login ? format(new Date(user.last_login), 'MMM dd, yyyy HH:mm') : 'Never'}
                        </p>
                      </div>
                      <div className="p-4 bg-amber-100/50 rounded-lg">
                        <p className="text-sm text-amber-700">Account Created</p>
                        <p className="font-semibold">
                          {user.created_date ? format(new Date(user.created_date), 'MMM dd, yyyy') : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-100/50 rounded-lg">
                      <p className="text-sm text-amber-700 mb-2">Recent Activity</p>
                      <p className="text-sm text-amber-600">Activity tracking will be implemented in future updates.</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-amber-700">
                    <User className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                    <p>User activity will be available after the user is created and starts using the platform.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  User Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Key className="w-4 h-4 mr-2" />
                      Reset Password
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Activity className="w-4 h-4 mr-2" />
                      View Activity
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-amber-700 mb-4">Ready to invite this user to the platform?</p>
                    <Button onClick={handleInvite} className="bg-green-600 hover:bg-green-700">
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          {user ? (
            <Button onClick={handleSave} disabled={saving} className="bg-amber-800 hover:bg-amber-900">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          ) : (
            <Button onClick={handleInvite} className="bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUserData = await User.me();
      setCurrentUser(currentUserData);
      
      const [userList, agencyList] = await Promise.all([
        User.list('-created_date'),
        Agency.list()
      ]);
      setUsers(userList);
      setAgencies(agencyList);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleDeleteUserClick = (user) => {
    if (user.app_role === 'super_admin' || user.email === 'dwmusoke@gmail.com') {
      alert("Super Admin users cannot be deleted from this interface for security reasons.");
      return;
    }
    setDeletingUser(user);
    setIsDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await User.delete(deletingUser.id);
      alert(`User "${deletingUser.full_name}" has been deleted successfully.`);
      setIsDeleteUserDialogOpen(false);
      setDeletingUser(null);
      await loadData();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. This could be due to network issues or server errors.");
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (userData.id) {
        await User.update(userData.id, userData);
        alert("User updated successfully!");
      } else {
        await User.create(userData);
        alert("User created successfully!");
      }
      await loadData();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user. Please try again.");
    }
  };

  const handleInviteUser = async (userData) => {
    try {
      // Here you would integrate with your invitation system
      console.log("Inviting user:", userData);
      alert(`Invitation sent to ${userData.email}!`);
      await loadData();
    } catch (error) {
      console.error("Error inviting user:", error);
      alert("Failed to send invitation. Please try again.");
    }
  };

  const getAgencyName = (agencyId) => {
    const agency = agencies.find(a => a.id === agencyId);
    return agency ? agency.name : 'No Agency';
  };

  const filteredUsers = users.filter(user => {
    const searchMatch = searchTerm === "" || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const agencyMatch = agencyFilter === "all" || user.agency_id === agencyFilter;
    const roleMatch = roleFilter === "all" || user.app_role === roleFilter;
    const statusMatch = statusFilter === "all" || 
      (statusFilter === "active" && user.is_active !== false) ||
      (statusFilter === "inactive" && user.is_active === false);
    return searchMatch && agencyMatch && roleMatch && statusMatch;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-red-200/80 text-red-900 border-red-300';
      case 'agency_admin': return 'bg-purple-200/80 text-purple-900 border-purple-300';
      case 'agent': return 'bg-blue-200/80 text-blue-900 border-blue-300';
      case 'viewer': return 'bg-stone-200/80 text-stone-900 border-stone-300';
      default: return 'bg-stone-200/80 text-stone-900 border-stone-300';
    }
  };
  
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active !== false).length,
    inactive: users.filter(u => u.is_active === false).length,
    superAdmins: users.filter(u => u.app_role === 'super_admin').length,
    agencyAdmins: users.filter(u => u.app_role === 'agency_admin').length,
    agents: users.filter(u => u.app_role === 'agent').length,
    viewers: users.filter(u => u.app_role === 'viewer').length,
  };

  return (
    <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Platform User Management</h1>
            <p className="text-amber-800/80">Manage all users across the platform with comprehensive role and permission controls.</p>
          </div>
          <Button 
            onClick={() => {
              setSelectedUser({});
              setIsUserModalOpen(true);
            }}
            className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>

        {/* Enhanced Stats */}
        <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-xs text-amber-700/80">Total Users</p>
              <p className="text-xl font-bold text-amber-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50/50 backdrop-blur-md border border-green-200/50 rounded-xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-xs text-green-700/80">Active</p>
              <p className="text-xl font-bold text-green-900">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50/50 backdrop-blur-md border border-red-200/50 rounded-xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-xs text-red-700/80">Inactive</p>
              <p className="text-xl font-bold text-red-900">{stats.inactive}</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50/50 backdrop-blur-md border border-purple-200/50 rounded-xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-xs text-purple-700/80">Agency Admins</p>
              <p className="text-xl font-bold text-purple-900">{stats.agencyAdmins}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50/50 backdrop-blur-md border border-blue-200/50 rounded-xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-xs text-blue-700/80">Agents</p>
              <p className="text-xl font-bold text-blue-900">{stats.agents}</p>
            </CardContent>
          </Card>
          <Card className="bg-stone-50/50 backdrop-blur-md border border-stone-200/50 rounded-xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-xs text-stone-700/80">Viewers</p>
              <p className="text-xl font-bold text-stone-900">{stats.viewers}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50/50 backdrop-blur-md border border-red-200/50 rounded-xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-xs text-red-700/80">Super Admins</p>
              <p className="text-xl font-bold text-red-900">{stats.superAdmins}</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="mb-8 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-amber-600" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-amber-100/50 border-amber-300/50 text-amber-900 placeholder:text-amber-700/70"
                />
              </div>
              <div className="flex items-center gap-4">
                <Select value={agencyFilter} onValueChange={setAgencyFilter}>
                  <SelectTrigger className="w-48 bg-amber-100/50 border-amber-300/50 text-amber-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-50 border-amber-200">
                    <SelectItem value="all">All Agencies</SelectItem>
                    {agencies.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40 bg-amber-100/50 border-amber-300/50 text-amber-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-50 border-amber-200">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="agency_admin">Agency Admin</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-amber-100/50 border-amber-300/50 text-amber-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-50 border-amber-200">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced User List */}
        <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-amber-900">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Platform Users
              </span>
              <Badge variant="outline" className="bg-amber-100/50 text-amber-800 border-amber-300/50">
                {filteredUsers.length} users
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 bg-amber-100/40 border border-amber-300/50 rounded-xl animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-amber-200 rounded w-1/3"></div>
                        <div className="h-3 bg-amber-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const isProtectedUser = user.app_role === 'super_admin' || user.email === 'dwmusoke@gmail.com';
                  return (
                    <div key={user.id} className="p-4 bg-amber-100/40 border border-amber-300/50 rounded-xl hover:shadow-lg transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-amber-200 text-amber-900 text-sm">
                              {user.full_name?.split(' ').map(n=>n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-amber-900">{user.full_name || 'N/A'}</p>
                              {user.email_verified && (
                                <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-amber-700/80 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                            <p className="text-xs text-amber-600/70 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Joined: {new Date(user.created_date).toLocaleDateString()}
                              {user.last_login && (
                                <>
                                  • <Clock className="w-3 h-3" />
                                  Last: {new Date(user.last_login).toLocaleDateString()}
                                </>
                              )}
                            </p>
                            <p className="text-xs text-amber-600/70">
                              Agency: {getAgencyName(user.agency_id)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${getRoleBadgeColor(user.app_role)} capitalize`}>
                            {user.app_role?.replace('_', ' ') || 'User'}
                          </Badge>
                          <Badge variant={user.is_active !== false ? "default" : "secondary"}>
                            {user.is_active !== false ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setSelectedUser(user);
                              setIsUserModalOpen(true);
                            }}
                            className="bg-amber-100/50 text-amber-800 border-amber-300 hover:bg-amber-100/70 rounded-lg"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {!isProtectedUser && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUserClick(user)}
                              className="text-red-700 border-red-300 hover:bg-red-50 rounded-lg"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          )}
                          {isProtectedUser && (
                            <Badge className="bg-red-200/50 text-red-800 border-red-300/50">
                              <Shield className="w-3 h-3 mr-1" />
                              Protected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                    <p className="text-amber-700">No users found matching your criteria.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        {isUserModalOpen && (
          <UserDetailModal
            user={selectedUser}
            agencies={agencies}
            onClose={() => {
              setIsUserModalOpen(false);
              setSelectedUser(null);
            }}
            onSave={handleSaveUser}
            onInvite={handleInviteUser}
          />
        )}

        {/* Delete User Confirmation Dialog */}
        <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
          <DialogContent className="bg-red-50/80 backdrop-blur-md border-red-200/50 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Confirm User Deletion
              </DialogTitle>
              <DialogDescription className="text-red-800">
                This action cannot be undone and will permanently remove the user from the system.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 text-red-800">
              {deletingUser && (
                <>
                  <div className="p-4 bg-red-100/50 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 mb-2">User Details:</p>
                    <p><strong>Name:</strong> {deletingUser.full_name}</p>
                    <p><strong>Email:</strong> {deletingUser.email}</p>
                    <p><strong>Role:</strong> {deletingUser.app_role?.replace('_', ' ') || deletingUser.role}</p>
                    <p><strong>Agency:</strong> {getAgencyName(deletingUser.agency_id)}</p>
                  </div>
                  <Alert className="bg-red-100/50 border-red-200/50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Warning:</strong> This will permanently remove the user and revoke their access to the system.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setIsDeleteUserDialogOpen(false)}
                className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDeleteUser} 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <UserX className="w-4 h-4 mr-2" />
                Yes, Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
