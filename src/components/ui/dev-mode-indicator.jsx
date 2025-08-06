import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DEV_MODE } from '@/api/base44Client';

export function DevModeIndicator() {
  if (!DEV_MODE) return null;

  return (
    <Alert className="fixed top-4 right-4 w-80 z-50 bg-yellow-50 border-yellow-200 text-yellow-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="text-sm">
        <strong>Development Mode Active</strong><br />
        Using mock data - no base44 authentication required
      </AlertDescription>
    </Alert>
  );
} 