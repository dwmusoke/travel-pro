import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, 
  Lock,
  Unlock,
  User,
  Users,
  Key,
  Smartphone,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Activity,
  AlertCircle,
  Bell,
  Database,
  Globe,
  Smartphone as Phone,
  CreditCard,
  Fingerprint,
  QrCode,
  Zap,
  Brain,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Calendar,
  MapPin,
  Plus
} from 'lucide-react';

export default function AdvancedSecurityManager({ 
  onSecurityUpdate,
  onUserAccessChange 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Security status
  const [securityStatus, setSecurityStatus] = useState({
    mfaEnabled: true,
    passwordPolicy: 'strong',
    sessionTimeout: 30,
    ipWhitelist: true,
    auditLogging: true,
    encryptionLevel: 'AES-256',
    lastSecurityScan: '2024-01-15T10:30:00Z',
    securityScore: 92
  });

  // User access management
  const [users, setUsers] = useState([
    {
      id: 'user_001',
      name: 'John Smith',
      email: 'john.smith@travelpro.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T09:30:00Z',
      mfaEnabled: true,
      loginAttempts: 0,
      permissions: ['read', 'write', 'admin', 'financial', 'reports']
    },
    {
      id: 'user_002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@travelpro.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-15T08:45:00Z',
      mfaEnabled: true,
      loginAttempts: 0,
      permissions: ['read', 'write', 'financial', 'reports']
    },
    {
      id: 'user_003',
      name: 'Mike Wilson',
      email: 'mike.wilson@travelpro.com',
      role: 'agent',
      status: 'active',
      lastLogin: '2024-01-15T07:15:00Z',
      mfaEnabled: false,
      loginAttempts: 2,
      permissions: ['read', 'write']
    }
  ]);

  // Security roles
  const [roles, setRoles] = useState([
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access and control',
      permissions: ['read', 'write', 'admin', 'financial', 'reports', 'security', 'users'],
      userCount: 1
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Department management and reporting access',
      permissions: ['read', 'write', 'financial', 'reports'],
      userCount: 2
    },
    {
      id: 'agent',
      name: 'Travel Agent',
      description: 'Basic booking and client management',
      permissions: ['read', 'write'],
      userCount: 5
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to assigned modules',
      permissions: ['read'],
      userCount: 3
    }
  ]);

  // Security events and alerts
  const [securityEvents, setSecurityEvents] = useState([
    {
      id: 'evt_001',
      type: 'login_attempt',
      severity: 'medium',
      description: 'Multiple failed login attempts detected',
      user: 'mike.wilson@travelpro.com',
      timestamp: '2024-01-15T10:15:00Z',
      ipAddress: '192.168.1.100',
      status: 'investigating'
    },
    {
      id: 'evt_002',
      type: 'permission_change',
      severity: 'low',
      description: 'User role updated from Agent to Manager',
      user: 'sarah.johnson@travelpro.com',
      timestamp: '2024-01-15T09:00:00Z',
      ipAddress: '192.168.1.50',
      status: 'resolved'
    },
    {
      id: 'evt_003',
      type: 'data_access',
      severity: 'high',
      description: 'Sensitive financial data accessed outside business hours',
      user: 'john.smith@travelpro.com',
      timestamp: '2024-01-15T02:30:00Z',
      ipAddress: '203.45.67.89',
      status: 'open'
    }
  ]);

  // MFA methods
  const [mfaMethods, setMfaMethods] = useState([
    {
      id: 'authenticator',
      name: 'Authenticator App',
      description: 'Google Authenticator, Microsoft Authenticator, etc.',
      enabled: true,
      users: 8
    },
    {
      id: 'sms',
      name: 'SMS Verification',
      description: 'Text message with verification code',
      enabled: true,
      users: 5
    },
    {
      id: 'email',
      name: 'Email Verification',
      description: 'Email with verification link',
      enabled: false,
      users: 0
    },
    {
      id: 'hardware',
      name: 'Hardware Token',
      description: 'Physical security key (YubiKey, etc.)',
      enabled: false,
      users: 0
    }
  ]);

  const enableMFA = async (userId) => {
    setIsProcessing(true);
    try {
      // Simulate MFA setup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, mfaEnabled: true }
          : user
      );
      
      setUsers(updatedUsers);
      
      if (onUserAccessChange) {
        onUserAccessChange(userId, { mfaEnabled: true });
      }
    } catch (error) {
      console.error('MFA setup failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-blue-100 text-blue-800',
      open: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={variants[status] || variants.inactive}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'agent': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-8 border-gray-200 flex items-center justify-center">
                <div className="text-2xl font-bold text-green-600">
                  {securityStatus.securityScore}
                </div>
              </div>
              <div className="absolute inset-0 w-24 h-24 rounded-full border-8 border-green-600 border-t-transparent transform rotate-45"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Excellent Security Posture</h3>
              <p className="text-gray-600 mb-4">
                Your system has a strong security configuration with {securityStatus.securityScore}/100 score.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Multi-factor authentication enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Strong password policy enforced</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Audit logging active</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.filter(u => u.status === 'active').length}</div>
            <p className="text-sm text-gray-600">Total registered users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              MFA Enabled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {users.filter(u => u.mfaEnabled).length}
            </div>
            <p className="text-sm text-gray-600">Users with MFA protection</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {securityEvents.filter(e => e.status === 'open').length}
            </div>
            <p className="text-sm text-gray-600">Open security alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    event.severity === 'high' ? 'bg-red-100 text-red-600' :
                    event.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">{event.description}</p>
                    <p className="text-sm text-gray-600">
                      {event.user} • {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityColor(event.severity)}
                  {getStatusBadge(event.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const UserManagementTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>User Access Management</span>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {user.mfaEnabled ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => enableMFA(user.id)}
                        disabled={isProcessing}
                      >
                        Enable MFA
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(user.lastLogin).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const MFATab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Multi-Factor Authentication Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mfaMethods.map((method) => (
              <Card key={method.id} className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {method.id === 'authenticator' && <Smartphone className="w-4 h-4" />}
                      {method.id === 'sms' && <Phone className="w-4 h-4" />}
                      {method.id === 'email' && <Mail className="w-4 h-4" />}
                      {method.id === 'hardware' && <Key className="w-4 h-4" />}
                      {method.name}
                    </span>
                    <Badge variant={method.enabled ? 'default' : 'outline'}>
                      {method.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {method.users} users using this method
                    </span>
                    <Button 
                      variant={method.enabled ? 'outline' : 'default'}
                      size="sm"
                    >
                      {method.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MFA Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>MFA Adoption Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {Math.round((users.filter(u => u.mfaEnabled).length / users.length) * 100)}%
            </div>
            <p className="text-sm text-gray-600">Users with MFA enabled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Preferred Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              Authenticator App
            </div>
            <p className="text-sm text-gray-600">Most used MFA method</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Security Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              99.9%
            </div>
            <p className="text-sm text-gray-600">Account compromise prevention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const SecurityEventsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Security Event Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {securityEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{event.description}</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {event.type.replace('_', ' ')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{event.user}</TableCell>
                  <TableCell className="font-mono text-sm">{event.ipAddress}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(event.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(event.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Security Management</h2>
          <p className="text-muted-foreground">
            Multi-factor authentication, role-based access control, and security monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSecurityModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Security Settings
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="mfa">MFA Settings</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>
        
        <TabsContent value="mfa">
          <MFATab />
        </TabsContent>
        
        <TabsContent value="events">
          <SecurityEventsTab />
        </TabsContent>
      </Tabs>

      {/* Security Settings Modal */}
      <Dialog open={showSecurityModal} onOpenChange={setShowSecurityModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Security Configuration</DialogTitle>
            <DialogDescription>
              Configure advanced security settings and policies
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Session Timeout (minutes)</Label>
              <Select value={securityStatus.sessionTimeout.toString()} onValueChange={(value) => setSecurityStatus(prev => ({ ...prev, sessionTimeout: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Password Policy</Label>
              <Select value={securityStatus.passwordPolicy} onValueChange={(value) => setSecurityStatus(prev => ({ ...prev, passwordPolicy: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (8 characters)</SelectItem>
                  <SelectItem value="strong">Strong (12 characters, special chars)</SelectItem>
                  <SelectItem value="very-strong">Very Strong (16 characters, complex)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>IP Whitelist</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ipWhitelist"
                  checked={securityStatus.ipWhitelist}
                  onChange={(e) => setSecurityStatus(prev => ({ ...prev, ipWhitelist: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="ipWhitelist">Restrict access to specific IP addresses</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSecurityModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSecurityModal(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 