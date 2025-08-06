import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function Base44Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Base44 Callback: Processing authentication...');
        
        // Get the authorization code from URL parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (!code) {
          throw new Error('No authorization code received');
        }

        console.log('🔄 Base44 Callback: Authorization code received');

        // Exchange code for access token
        const authResult = await base44.auth.handleCallback(code, state);
        
        if (authResult.success) {
          console.log('✅ Base44 Callback: Authentication successful');
          setStatus('success');
          setUserData(authResult.user);
          
          // Redirect to dashboard after successful authentication
          setTimeout(() => {
            navigate(createPageUrl('Dashboard'));
          }, 2000);
        } else {
          throw new Error(authResult.error || 'Authentication failed');
        }

      } catch (error) {
        console.error('❌ Base44 Callback Error:', error);
        setStatus('error');
        setError(error.message);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-8 h-8 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Processing authentication...';
      case 'success':
        return 'Authentication successful! Redirecting to dashboard...';
      case 'error':
        return `Authentication failed: ${error}`;
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            {getStatusIcon()}
            <span>Base44 Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
            <p className="text-center font-medium">{getStatusMessage()}</p>
          </div>

          {userData && (
            <div className="space-y-2">
              <h3 className="font-medium">User Information:</h3>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {userData.name}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Role:</strong> <Badge variant="outline">{userData.app_role}</Badge></p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <Button 
                onClick={() => navigate(createPageUrl('Home'))}
                className="w-full"
              >
                Return to Home
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            Domain: go-travelpro.com
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 