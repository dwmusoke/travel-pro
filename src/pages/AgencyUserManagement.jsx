
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { inviteUser } from "@/api/functions";
import { getAgencyUsers } from "@/api/functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Users,
  UserPlus,
  Edit,
  Mail,
  AlertCircle,
  Trash2,
  Info
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

export default function AgencyUserManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteData, setInviteData] = useState({ email: "", role: "agent" });
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      if (user?.agency_id) {
        // Call the backend function to get agency users
        try {
          const response = await getAgencyUsers();
          
          // Handle different response formats
          if (response && Array.isArray(response)) {
            setUsers(response);
          } else if (response && response.data && Array.isArray(response.data)) {
            setUsers(response.data);
          } else if (response && response.error) {
            // If the response object itself indicates an error
            throw new Error(response.error);
          } else {
            // Fallback - if response is unexpected or empty for non-super_admin, just show current user
            setUsers([{
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              app_role: user.app_role || user.role || 'user',
              agency_id: user.agency_id,
              created_date: user.created_date,
              last_login: user.last_login
            }]);
            // Set a friendly error message for this specific case (limited view)
            setError("Limited user view: Due to privacy restrictions, only your own profile is shown. Super admin access is required to view all agency users.");
          }
        } catch (fetchError) {
          console.error("Error calling getAgencyUsers function:", fetchError);
          
          // Fallback: show just the current user when function fails (e.g., permission denied)
          setUsers([{
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            app_role: user.app_role || user.role || 'user',
            agency_id: user.agency_id,
            created_date: user.created_date,
            last_login: user.last_login
          }]);
          
          // Set a friendly error message for the user
          setError("Limited user view: Due to privacy restrictions, only your own profile is shown. Super admin access is required to view all agency users.");
        }
      } else {
        // If user is not part of an agency, show no users
        setUsers([]);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setError(error.message || "Failed to load user data. Please try again.");
    }
    setLoading(false);
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteData.email || !currentUser?.agency_id) {
      alert("Please enter a valid email address and ensure you are part of an agency.");
      return;
    }

    // Check if current user has permission to invite
    const userRole = currentUser.app_role || currentUser.role || 'user';
    const allowedRoles = ['agency_admin', 'super_admin'];
    
    if (!allowedRoles.includes(userRole)) {
      alert("You don't have permission to invite users. Only agency admins can invite new team members.");
      return;
    }

    setInviting(true);
    try {
      const response = await inviteUser({
        email: inviteData.email,
        role: inviteData.role,
      });
      
      // Handle successful invitation
      if (response.data?.message || response.message) {
        alert(`User ${inviteData.email} has been successfully created and added to your agency.`);
        setShowInviteDialog(false);
        setInviteData({ email: "", role: "agent" });
        await loadData(); // Reload data after successful invite
      } else {
        throw new Error('Unexpected response format from server.');
      }
      
    } catch (error) {
      console.error("Error inviting user:", error);
      
      let alertMessage = "An unknown error occurred. Please try again.";
      if (error.message && error.message.includes("Network Error")) {
        alertMessage = "Network Error: Could not connect to the server. Please check your internet connection and try again.";
      } else if (error?.response?.data?.error) {
         if (error.response.status === 409) {
            alertMessage = "A user with this email already exists.";
        } else {
            alertMessage = `Failed to invite user: ${error.response.data.details || error.response.data.error}`;
        }
      } else if (error?.message) {
        alertMessage = error.message;
      }

      alert(alertMessage);
    } finally {
      setInviting(false);
    }
  };

  const handleEditUser = (user) => {
    console.log("Edit user:", user);
    alert(`Editing user: ${user.full_name} - This feature will be implemented in a future update.`);
  };

  const handleRemoveUser = (user) => {
    console.log("Remove user:", user);
    alert(`Removing user: ${user.full_name} - This feature will be implemented in a future update.`);
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-64 mb-8" />
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentUser?.agency_id && !loading) { // Only show this if not loading and no agency_id
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <Alert className="bg-amber-100/50 text-amber-900 border-amber-300 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-800" />
            <AlertDescription className="text-amber-900">
              You must be associated with an agency to manage users.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">User Management</h1>
            <p className="text-amber-800/80 dark:text-amber-200/80">Manage your agency's team members and their permissions.</p>
          </div>
          <Button onClick={() => setShowInviteDialog(true)} className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-100/50 text-red-900 border-red-300 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-800" />
            <AlertDescription className="text-red-900">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Info Alert for Limited Permissions */}
        {currentUser?.app_role !== 'super_admin' && currentUser?.email !== 'dwmusoke@gmail.com' && (
          <Alert className="mb-6 bg-blue-100/50 text-blue-900 border-blue-300 rounded-lg">
            <Info className="h-4 w-4 text-blue-800" />
            <AlertDescription className="text-blue-900">
              Due to privacy restrictions, you can only see your own user profile. To view all agency users, super admin permissions are required.
            </AlertDescription>
          </Alert>
        )}

        {/* Info Alert for Invitation Limitations */}
        <Alert className="mb-6 bg-blue-100/50 text-blue-900 border-blue-300 rounded-lg">
          <Info className="h-4 w-4 text-blue-800" />
          <AlertDescription className="text-blue-900">
            <strong>Note about User Invitations:</strong> New users are created and added to your agency directly. They will receive an email to set up their account if they are new to the platform.
          </AlertDescription>
        </Alert>

        {/* Users List */}
        <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl dark:bg-gray-800/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <Users className="w-5 h-5" />
              Team Members ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <Alert className="bg-amber-100/50 text-amber-900 border-amber-300 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-800" />
                <AlertDescription className="text-amber-900">
                  No team members found. Due to privacy restrictions, you can only see your own profile unless you have super admin permissions.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="p-4 bg-amber-100/30 dark:bg-gray-700/30 border border-amber-200/50 dark:border-gray-600/50 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-amber-200 dark:bg-amber-700 text-amber-900 dark:text-amber-100">
                            {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-amber-900 dark:text-amber-100">{user.full_name}</h4>
                          <p className="text-sm text-amber-700/80 dark:text-amber-300/80">{user.email}</p>
                          <Badge variant="outline" className="mt-1 capitalize bg-amber-100 dark:bg-gray-600 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-gray-500">
                            {(user.app_role || user.role || 'user').replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                          className="bg-amber-100/50 dark:bg-gray-600/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-gray-500 hover:bg-amber-100/70 dark:hover:bg-gray-600/70 rounded-lg"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        {/* Only show remove button for other users, not for current user */}
                        {user.id !== currentUser?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveUser(user)}
                            className="text-red-700 dark:text-red-400 border-red-300 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invite User Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl dark:bg-gray-800/80 dark:border-gray-700/50">
            <DialogHeader>
              <DialogTitle className="text-amber-900 dark:text-amber-100">Invite New User</DialogTitle>
              <DialogDescription className="text-amber-700/80 dark:text-amber-300/80">
                Send an invitation to a new team member to join your agency.
                {currentUser?.app_role !== 'agency_admin' && currentUser?.app_role !== 'super_admin' && (
                  <div className="mt-2 p-2 bg-yellow-100/50 border border-yellow-200 rounded text-yellow-800 text-sm">
                    Note: Only agency admins can invite users. Contact your agency administrator if you need to invite someone.
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteUser}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-amber-900 dark:text-amber-100">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    required
                    className="bg-amber-100/50 border-amber-300/50 text-amber-900 placeholder:text-amber-600 focus:border-amber-500 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-amber-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-amber-900 dark:text-amber-100">Role</Label>
                  <Select value={inviteData.role} onValueChange={(value) => setInviteData({ ...inviteData, role: value })}>
                    <SelectTrigger id="role" className="bg-amber-100/50 border-amber-300/50 text-amber-900 focus:border-amber-500 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-amber-100">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-amber-50 border-amber-200 text-amber-900 dark:bg-gray-900 dark:border-gray-700 dark:text-amber-100">
                      <SelectItem value="agent" className="focus:bg-amber-100 focus:text-amber-900 dark:focus:bg-gray-700">Agent - Full access to manage bookings and clients</SelectItem>
                      <SelectItem value="viewer" className="focus:bg-amber-100 focus:text-amber-900 dark:focus:bg-gray-700">Viewer - Read-only access to reports and data</SelectItem>
                      <SelectItem value="agency_admin" className="focus:bg-amber-100 focus:text-amber-900 dark:focus:bg-gray-700">Agency Admin - Manage users and agency settings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowInviteDialog(false)} className="bg-amber-100/50 text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl dark:bg-gray-700 dark:text-amber-100 dark:border-gray-600 dark:hover:bg-gray-600">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={inviting || (currentUser?.app_role !== 'agency_admin' && currentUser?.app_role !== 'super_admin')} 
                  className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviting ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
