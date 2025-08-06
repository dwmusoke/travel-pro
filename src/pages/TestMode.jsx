import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '@/api/entities';
import { Agency } from '@/api/entities';
import { DEV_MODE } from '@/api/base44Client';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  RefreshCw,
  User as UserIcon,
  Building,
  Database,
  Settings,
  Activity
} from 'lucide-react';

export default function TestMode() {
  const [user, setUser] = useState(null);
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      const result = await testFunction();
      setTestResults(prev => [...prev, { name: testName, success: true, result }]);
      return result;
    } catch (error) {
      setTestResults(prev => [...prev, { name: testName, success: false, error: error.message }]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const testUserAuth = async () => {
    const userData = await User.me();
    setUser(userData);
    return userData;
  };

  const testAgencyData = async () => {
    if (user?.agency_id) {
      const agencyData = await Agency.get(user.agency_id);
      setAgency(agencyData);
      return agencyData;
    }
    return null;
  };

  const runAllTests = async () => {
    setTestResults([]);
    
    await runTest('DEV_MODE Check', () => {
      if (DEV_MODE) {
        return { status: 'DEV_MODE is ENABLED', value: DEV_MODE };
      } else {
        throw new Error('DEV_MODE is DISABLED');
      }
    });

    await runTest('User Authentication', testUserAuth);
    await runTest('Agency Data', testAgencyData);
  };

  const getStatusIcon = (success) => {
    return success ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">TravelPro Test Mode</h1>
        <p className="text-amber-700">Development and Testing Environment</p>
        <div className="mt-4">
          <Badge variant="outline" className="text-sm">
            <Activity className="w-3 h-3 mr-1" />
            {currentTime.toLocaleString()}
          </Badge>
        </div>
      </div>

      {/* DEV_MODE Status */}
      <Card className="border-2 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Development Mode Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">DEV_MODE:</span>
              <Badge variant={DEV_MODE ? "default" : "destructive"}>
                {DEV_MODE ? "ENABLED" : "DISABLED"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Environment:</span>
              <Badge variant="outline">
                {process.env.NODE_ENV || 'development'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Tests</span>
            <Button onClick={runAllTests} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                {getStatusIcon(test.success)}
                <div className="flex-1">
                  <div className="font-medium">{test.name}</div>
                  {test.success ? (
                    <div className="text-sm text-gray-600">
                      {typeof test.result === 'object' ? JSON.stringify(test.result, null, 2) : test.result}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">{test.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Current User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Name:</span> {user.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Role:</span> {user.app_role}
              </div>
              <div>
                <span className="font-medium">Agency ID:</span> {user.agency_id || 'None'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agency Information */}
      {agency && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Agency Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Name:</span> {agency.name}
              </div>
              <div>
                <span className="font-medium">IATA Number:</span> {agency.iata_number}
              </div>
              <div>
                <span className="font-medium">Status:</span> {agency.status}
              </div>
              <div>
                <span className="font-medium">Email:</span> {agency.email}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>User Agent:</strong> {navigator.userAgent}</div>
            <div><strong>Window Location:</strong> {window.location.href}</div>
            <div><strong>Local Storage:</strong> {localStorage.getItem('dev_mode_user') ? 'User data found' : 'No user data'}</div>
            <div><strong>Session Storage:</strong> {Object.keys(sessionStorage).length} items</div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/FinancialManagement'}>
              Financial Management
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 