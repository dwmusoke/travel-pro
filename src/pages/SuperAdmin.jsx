
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link
import { Agency, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Added DialogDescription
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import {
  Alert, // Added Alert
  AlertDescription, // Added AlertDescription
} from "@/components/ui/alert";
import {
  Building,
  Users,
  TrendingUp,
  DollarSign,
  Search,
  Settings,
  Eye,
  Pause,
  Play,
  UserPlus,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Save,
  Copy, // Import Copy icon
  BarChart, // Import BarChart icon
  AlertCircle as AlertCircleIcon, // Renamed to avoid conflict
  Trash2, // Add Trash2 icon
  UserX // Add UserX icon for user removal
} from "lucide-react";
import { createPageUrl } from "@/utils"; // Assuming createPageUrl is in a utility file

export default function SuperAdmin() {
  const [agencies, setAgencies] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalAgencies: 0,
    activeAgencies: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    pendingAgencies: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [isAddAgencyDialogOpen, setIsAddAgencyDialogOpen] = useState(false);
  const [newAgencyData, setNewAgencyData] = useState({
    name: "",
    email: "",
    country: "",
    subscription_plan: "basic"
  });
  const [approvalInfo, setApprovalInfo] = useState(null); // New state for modal
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingAgency, setDeletingAgency] = useState(null);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false); // New state for user deletion dialog
  const [deletingUser, setDeletingUser] = useState(null); // New state for user being deleted
  const [loading, setLoading] = useState(true); // Added loading state as per outline
  const [error, setError] = useState(null); // State to hold loading errors

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true); // Set loading true at the start
    setError(null); // Reset error on every load
    try {
      // Verify super admin access
      const user = await User.me();
      
      // CRITICAL: Enhanced super admin verification
      if (user.app_role !== 'super_admin' && user.email !== 'dwmusoke@gmail.com') {
        console.log("Unauthorized access to SuperAdmin page");
        window.location.href = createPageUrl("Dashboard");
        return;
      }
      
      setCurrentUser(user);

      // Load ALL agencies and users (super admin can see everything)
      const [agencyList, userList] = await Promise.all([
        Agency.list('-created_date', 500),
        User.list('-created_date', 500)
      ]);

      console.log(`Super admin loaded ${agencyList.length} agencies and ${userList.length} users`);

      setAgencies(agencyList);
      setUsers(userList);

      // Calculate stats
      const activeAgencies = agencyList.filter(a => a.is_active && a.subscription_status === 'active');
      const monthlyRevenue = activeAgencies.reduce((sum, agency) => {
        const planPrices = { basic: 49, pro: 99, enterprise: 299 };
        return sum + (planPrices[agency.subscription_plan] || 0);
      }, 0);
      const pendingAgenciesCount = agencyList.filter(a => a.subscription_status === 'pending_approval').length;

      setStats({
        totalAgencies: agencyList.length,
        activeAgencies: activeAgencies.length,
        totalUsers: userList.length,
        monthlyRevenue,
        pendingAgencies: pendingAgenciesCount
      });
    } catch (err) {
      console.error("Error loading super admin data:", err);
      setError("Could not load Super Admin dashboard. There might be an issue with fetching agencies or users. Please try again later or contact support.");
    } finally {
        setLoading(false); // Set loading false after data is loaded or on error
    }
  };

  // handleToggleAgencyStatus has been replaced by handleSuspendAgency
  // const handleToggleAgencyStatus = async (agencyId, isActive) => { ... };

  const handleApproveAgency = async (agencyId) => {
    if(window.confirm('Are you sure you want to approve this agency? They will be granted full access.')) {
        try {
            await Agency.update(agencyId, { 
                subscription_status: 'active',
                is_active: true
            });
            await loadData();
        } catch(e) {
            console.error("Failed to approve agency:", e);
            alert("Approval failed. Please try again.");
        }
    }
  };

  const handleRejectAgency = async (agencyId) => {
    try {
        if (window.confirm("Are you sure you want to reject this agency? This cannot be undone.")) {
            await Agency.update(agencyId, {
                is_active: false,
                subscription_status: 'rejected'
            });
            await loadData();
        }
    } catch (error) {
        console.error("Error rejecting agency:", error);
    }
  };

  const handleSuspendAgency = async (agencyId, currentStatus) => {
      const isSuspending = currentStatus !== 'suspended';
      const action = isSuspending ? 'suspend' : 'reactivate';
      if(window.confirm(`Are you sure you want to ${action} this agency?`)) {
        try {
            await Agency.update(agencyId, { 
                subscription_status: isSuspending ? 'suspended' : 'active',
                is_active: !isSuspending
            });
            await loadData();
        } catch(e) {
            console.error(`Failed to ${action} agency:`, e);
            alert(`Failed to ${action} agency. Please try again.`);
        }
    }
  }

  const handleDeleteClick = (agency) => {
    setDeletingAgency(agency);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAgency = async () => {
    if (!deletingAgency) return;
    try {
      await Agency.delete(deletingAgency.id);
      alert(`Agency "${deletingAgency.name}" has been deleted successfully.`);
      setIsDeleteDialogOpen(false);
      setDeletingAgency(null);
      await loadData();
    } catch (error) {
      console.error("Error deleting agency:", error);
      alert("Failed to delete agency. This could be due to network issues or server errors.");
    }
  };

  const handleEditUserClick = (user) => {
    setEditingUser(user);
    setSelectedRole(user.app_role);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUserRole = async () => {
    if (!editingUser || !selectedRole) return;
    try {
      await User.update(editingUser.id, { app_role: selectedRole });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      await loadData();
      alert("User role updated successfully!");
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role. Please try again.");
    }
  };

  const handleDeleteUserClick = (user) => {
    // Prevent super admin from deleting themselves or other super admins
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

  const handleAddAgency = async (e) => {
    e.preventDefault();
    if (!newAgencyData.name || !newAgencyData.email) {
      alert("Agency name and email are required.");
      return;
    }
    try {
      await Agency.create({
        ...newAgencyData,
        is_active: true,
        subscription_status: 'active',
        created_by: currentUser?.email
      });
      alert("Agency created successfully!");
      setIsAddAgencyDialogOpen(false);
      setNewAgencyData({ name: "", email: "", country: "", subscription_plan: "basic" });
      await loadData();
    } catch (error) {
      console.error("Error creating agency:", error);
      alert("Failed to create agency.");
    }
  };

  const handleCopyWelcomeMessage = () => {
    if (!approvalInfo) return; // Should not happen if button is only active when approvalInfo is set
    const welcomeMessage = `Subject: Welcome to TravelPro - Your Agency is Approved!

Dear Agency Admin,

Congratulations! Your agency, "${approvalInfo.name}", has been approved and is now active on the TravelPro platform.

You can now log in to your dashboard and start managing your travel operations.

**How to Log In:**
1. Go to the TravelPro home page: ${window.location.origin}${createPageUrl("Home")}
2. Click the "Sign In" button.
3. **Important:** Use the "Sign in with Google" option with this email address: ${approvalInfo.email}

There is no password to manage. Your Google account is your key to the platform.

We're excited to have you on board!

Best regards,
The TravelPro Team`;
    navigator.clipboard.writeText(welcomeMessage);
    alert("Welcome message copied to clipboard!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'basic': return 'bg-slate-100 text-slate-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Modified filteredAgencies to not exclude pending_approval, as main agencies tab now handles all statuses
  const filteredAgencies = agencies.filter(agency =>
    (agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agency.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agency.country || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingAgencies = agencies.filter(agency => agency.subscription_status === 'pending_approval');

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-amber-900 text-xl">
        <p>Loading Super Admin Dashboard...</p>
      </div>
    );
  }

  // New: Render error message if an error occurred during loading
  if (error) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 100%)' }}>
          <Card className="max-w-lg bg-red-50/50 backdrop-blur-md border border-red-200/50 rounded-xl shadow-xl">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                      <AlertCircleIcon className="w-6 h-6" />
                      Dashboard Error
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-red-700">{error}</p>
              </CardContent>
          </Card>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Super Admin Dashboard</h1>
            <p className="text-amber-800/80">Manage all agencies and monitor platform performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-red-200/50 text-red-800 border-red-300/50 backdrop-blur-sm">
              <Shield className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
            <Link to={createPageUrl("PlatformSettings")}>
              <Button variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
                <Settings className="w-4 h-4 mr-2" />
                Platform Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700/80">Total Agencies</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.totalAgencies}</p>
                </div>
                <Building className="w-8 h-8 text-amber-800" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center text-sm text-green-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% this month
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700/80">Active Agencies</p>
                  <p className="text-2xl font-bold text-green-700">{stats.activeAgencies}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="text-sm text-amber-700/80">
                  {((stats.activeAgencies / stats.totalAgencies) * 100).toFixed(1)}% active rate
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700/80">Total Users</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="text-sm text-amber-700/80">
                  Avg {(stats.totalUsers / Math.max(stats.totalAgencies, 1)).toFixed(1)} per agency
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700/80">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-700">${stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center text-sm text-green-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% from last month
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="agencies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-amber-200/50 backdrop-blur-sm border border-amber-300/50 rounded-xl text-amber-800">
            <TabsTrigger value="agencies" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Agencies</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">
              Pending Approvals
              {stats.pendingAgencies > 0 &&
                <Badge className="ml-2 bg-yellow-500 text-white">{stats.pendingAgencies}</Badge>
              }
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Users</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Analytics</TabsTrigger>
          </TabsList>

          {/* Agencies Tab */}
          <TabsContent value="agencies" className="space-y-6">
            <Card className="bg-amber-50/50 dark:bg-gray-800/50 backdrop-blur-md border border-amber-200/50 dark:border-gray-700/50 rounded-xl shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-900">Agency Management</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/80" />
                      <Input
                        placeholder="Search agencies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 pl-10 bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                      />
                    </div>
                    <Button onClick={() => setIsAddAgencyDialogOpen(true)} className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Agency
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAgencies.map(agency => ( 
                    <div key={agency.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-amber-200/50 dark:border-gray-700/50 rounded-lg bg-amber-50/50 dark:bg-gray-800/50">
                      <div className="flex-1 mb-4 md:mb-0">
                        <p className="font-bold text-lg text-amber-900 dark:text-amber-100">{agency.name}</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">{agency.email}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">Office ID: {agency.office_id || 'N/A'}</p> {/* Added N/A fallback */}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`capitalize ${
                            agency.subscription_status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                            agency.subscription_status === 'suspended' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {agency.subscription_status?.replace('_', ' ')}
                        </Badge>
                        {agency.subscription_status === 'pending_approval' && (
                            <Button size="sm" onClick={() => handleApproveAgency(agency.id)} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                            </Button>
                        )}
                        <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleSuspendAgency(agency.id, agency.subscription_status)}
                            className={`${agency.subscription_status === 'suspended' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                        >
                            {agency.subscription_status === 'suspended' ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                            {agency.subscription_status === 'suspended' ? 'Reactivate' : 'Suspend'}
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClick(agency)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Approvals Tab */}
          <TabsContent value="pending" className="space-y-6">
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                  <CardTitle className="text-amber-900">Agencies Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingAgencies.length > 0 ? pendingAgencies.map((agency) => (
                    <div key={agency.id} className="p-4 bg-yellow-100/40 border border-yellow-300/50 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                            {agency.name}
                          </h4>
                          <p className="text-sm text-amber-800/80">{agency.email} • {agency.country}</p>
                          <p className="text-sm text-amber-700/80 mt-1">Signed up on: {new Date(agency.created_date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={`${getPlanColor(agency.subscription_plan)} border-opacity-50 border`}>
                                {agency.subscription_plan}
                            </Badge>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-lg" onClick={() => handleRejectAgency(agency.id)}>
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-lg" onClick={() => handleApproveAgency(agency.id)}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                            </Button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-amber-800/80 py-8">No agencies are currently pending approval.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-900">User Management</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/80" />
                    <Input
                      placeholder="Search users..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-64 pl-10 bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => {
                    const agency = agencies.find(a => a.id === user.agency_id);
                    const isProtectedUser = user.app_role === 'super_admin' || user.email === 'dwmusoke@gmail.com';
                    return (
                      <div key={user.id} className="p-4 bg-amber-100/30 border border-amber-200/50 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-amber-900">{user.full_name}</h4>
                            <p className="text-sm text-amber-800/80">
                              {user.email} • {agency?.name || 'No Agency Assigned'}
                            </p>
                            <div className="text-xs text-amber-700/70 mt-1">
                              Created: {new Date(user.created_date).toLocaleDateString()}
                              {user.last_login && ` • Last login: ${new Date(user.last_login).toLocaleDateString()}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="capitalize text-amber-800 border-amber-300/50 bg-amber-100/50">
                              {user.app_role?.replace('_', ' ') || user.role}
                            </Badge>
                             <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditUserClick(user)} 
                              className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-lg shadow-sm"
                            >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit Role
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-amber-900">Revenue by Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['basic', 'pro', 'enterprise'].map(plan => {
                      const count = agencies.filter(a => a.subscription_plan === plan && a.subscription_status === 'active').length;
                      const planPrices = { basic: 49, pro: 99, enterprise: 299 };
                      const revenue = count * planPrices[plan];
                      return (
                        <div key={plan} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded" />
                            <span className="capitalize font-medium">{plan}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${revenue.toLocaleString()}</div>
                            <div className="text-sm text-slate-500">{count} agencies</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-amber-900">Agency Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['active', 'trial', 'pending_approval', 'suspended', 'cancelled', 'rejected'].map(status => {
                      const count = agencies.filter(a => a.subscription_status === status).length;
                      const totalAgenciesForPercentage = agencies.length > 0 ? agencies.length : 1;
                      const percentage = ((count / totalAgenciesForPercentage) * 100).toFixed(1);
                      let colorClass = '';
                      switch (status) {
                        case 'active': colorClass = 'bg-green-500'; break;
                        case 'trial': colorClass = 'bg-blue-500'; break;
                        case 'pending_approval': colorClass = 'bg-yellow-500'; break;
                        case 'suspended': colorClass = 'bg-orange-500'; break;
                        case 'cancelled': colorClass = 'bg-red-500'; break;
                        case 'rejected': colorClass = 'bg-gray-500'; break;
                        default: colorClass = 'bg-gray-500'; break;
                      }

                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${colorClass}`} />
                            <span className="capitalize font-medium">{status.replace('_', ' ')}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{count}</div>
                            <div className="text-sm text-slate-500">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit User Role Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-amber-900">Edit User Role</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4 text-amber-800">
                <p>Editing role for: <span className="font-semibold text-amber-900">{editingUser?.full_name}</span> ({editingUser?.email})</p>
                <div className="space-y-2">
                    <Label htmlFor="role-select" className="text-amber-900">Application Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger id="role-select" className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="agency_admin">Agency Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-amber-700/80">Built-in role is: <span className="font-mono">{editingUser?.role}</span>. This cannot be changed.</p>
                </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)} className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">Cancel</Button>
              <Button onClick={handleUpdateUserRole} className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Agency Dialog */}
        <Dialog open={isAddAgencyDialogOpen} onOpenChange={setIsAddAgencyDialogOpen}>
          <DialogContent className="bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-amber-900">Add New Agency</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAgency}>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agency-name" className="text-amber-900">Agency Name</Label>
                  <Input
                    id="agency-name"
                    value={newAgencyData.name}
                    onChange={(e) => setNewAgencyData({...newAgencyData, name: e.target.value})}
                    required
                    className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency-email" className="text-amber-900">Admin Email</Label>
                  <Input
                    id="agency-email"
                    type="email"
                    value={newAgencyData.email}
                    onChange={(e) => setNewAgencyData({...newAgencyData, email: e.target.value})}
                    required
                    className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="agency-country" className="text-amber-900">Country</Label>
                  <Input
                    id="agency-country"
                    value={newAgencyData.country}
                    onChange={(e) => setNewAgencyData({...newAgencyData, country: e.target.value})}
                    className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency-plan" className="text-amber-900">Subscription Plan</Label>
                  <Select
                    value={newAgencyData.subscription_plan}
                    onValueChange={(value) => setNewAgencyData({...newAgencyData, subscription_plan: value})}
                  >
                    <SelectTrigger id="agency-plan" className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70">
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddAgencyDialogOpen(false)} className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">Cancel</Button>
                <Button type="submit" className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
                  <Save className="w-4 h-4 mr-2" />
                  Create Agency
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Approval Confirmation Dialog */}
        <Dialog open={!!approvalInfo} onOpenChange={() => setApprovalInfo(null)}>
          <DialogContent className="bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-amber-900 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Agency Approved Successfully!
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4 text-amber-800">
                <p>
                  The agency "<span className="font-semibold text-amber-900">{approvalInfo?.name}</span>" is now active.
                </p>
                <p>
                  Please send the following welcome message to the agency admin at <span className="font-semibold text-amber-900">{approvalInfo?.email}</span> to guide them on how to log in.
                </p>
                <div className="space-y-2">
                    <Label htmlFor="welcome-message" className="text-amber-900">Welcome & Login Instructions (Copy this)</Label>
                    <Textarea
                        id="welcome-message"
                        readOnly
                        rows={10}
                        className="bg-amber-100/50 border-amber-300/50 focus:bg-amber-100/70"
                        value={
`Subject: Welcome to TravelPro - Your Agency is Approved!

Dear Agency Admin,

Congratulations! Your agency, "${approvalInfo?.name}", has been approved and is now active on the TravelPro platform.

You can now log in to your dashboard and start managing your travel operations.

**How to Log In:**
1. Go to the TravelPro home page: ${approvalInfo ? window.location.origin + createPageUrl("Home") : ''}
2. Click the "Sign In" button.
3. **Important:** Use the "Sign in with Google" option with this email address: ${approvalInfo?.email}

There is no password to manage. Your Google account is your key to the platform.

We're excited to have you on board!

Best regards,
The TravelPro Team`}
                    />
                </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setApprovalInfo(null)} className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">Close</Button>
              <Button onClick={handleCopyWelcomeMessage} className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
                <Copy className="w-4 h-4 mr-2" />
                Copy Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-red-50/80 backdrop-blur-md border-red-200/50 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  Confirm Agency Deletion
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4 text-red-800">
                <p>
                    Are you sure you want to permanently delete the agency: <br />
                    <strong className="text-lg font-bold text-red-900">{deletingAgency?.name}</strong>?
                </p>
                <p className="font-semibold text-red-900">
                  This action cannot be undone.
                </p>
                <p>
                  Deleting the agency will remove all its associated data, including users, tickets, and invoices. This data will be unrecoverable.
                </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" type="button" onClick={() => setIsDeleteDialogOpen(false)} className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
                Cancel
              </Button>
              <Button onClick={confirmDeleteAgency} variant="destructive">
                Yes, Delete Agency
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                    <p><strong>Agency:</strong> {agencies.find(a => a.id === deletingUser.agency_id)?.name || 'No Agency'}</p>
                  </div>
                  <Alert className="bg-red-100/50 border-red-200/50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Warning:</strong> Deleting this user will:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Remove their access to the system immediately</li>
                        <li>Delete their user account and profile data</li>
                        <li>Preserve their historical data (invoices, bookings, etc.) for audit purposes</li>
                      </ul>
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
