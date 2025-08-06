
import React, { useState, useEffect } from "react";
import { GoogleDriveIntegration, SyncedFile, User, GDSTicket } from "@/api/entities"; // Added GDSTicket
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added AlertTitle
import {
  Cloud,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  FolderOpen,
  Zap,
  Clock,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { executeWorkflow } from "@/api/functions"; // Import executeWorkflow

export default function GoogleDriveSetup({ onIntegrationUpdate }) {
  const [integration, setIntegration] = useState(null);
  const [syncedFiles, setSyncedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [user, setUser] = useState(null);
  const [setupData, setSetupData] = useState({
    folder_name: "",
    sync_frequency: "hourly",
    auto_sync_enabled: true
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserAndIntegration();
  }, []);

  const loadUserAndIntegration = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await User.me();
      setUser(userData);

      if (userData && userData.agency_id) {
        const integrations = await GoogleDriveIntegration.filter({ agency_id: userData.agency_id });
        if (integrations.length > 0) {
          setIntegration(integrations[0]);
          const files = await SyncedFile.filter({ integration_id: integrations[0].id }, '-sync_date', 20);
          setSyncedFiles(files);
        } else {
          setIntegration(null);
          setSyncedFiles([]);
        }
      } else {
        setError("User or agency information is missing. Cannot set up Google Drive sync.");
        setIntegration(null);
        setSyncedFiles([]);
      }
    } catch (e) {
      console.error("Error loading Google Drive integration:", e);
      setError("Failed to load integration status.");
      setIntegration(null);
      setSyncedFiles([]);
    }
    setLoading(false);
  };

  const handleGoogleDriveConnect = async () => {
    if (!user || !user.agency_id) {
      setError("Cannot connect: User or agency information is missing.");
      return;
    }

    setConnecting(true);
    setError(null);
    try {
      // In a real implementation, this would redirect to Google OAuth
      // Here, we simulate a successful connection
      const mockIntegrationData = {
        agency_id: user.agency_id, // CRITICAL: Use the user's actual agency_id
        folder_id: "mock-folder-id-" + user.agency_id,
        folder_name: setupData.folder_name || `GDS Files - ${user.agency_id}`,
        sync_frequency: setupData.sync_frequency,
        auto_sync_enabled: setupData.auto_sync_enabled,
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        status: "connected",
        last_sync_date: new Date().toISOString()
      };

      const newIntegration = await GoogleDriveIntegration.create(mockIntegrationData);
      setIntegration(newIntegration);
      // Don't call onIntegrationUpdate here, as no new tickets are created yet.
    } catch (e) {
      console.error("Error connecting Google Drive:", e);
      setError("Failed to establish Google Drive connection.");
    }
    setConnecting(false);
  };

  const handleManualSync = async () => {
    if (!integration || !user || !user.agency_id) {
        setError("Cannot sync: Integration is not set up or user info is missing.");
        return;
    }
    
    setSyncing(true);
    setError(null);
    try {
      // Check for existing synced files to avoid duplicates
      const existingSyncedFiles = await SyncedFile.filter({ integration_id: integration.id });
      const existingFileIds = new Set(existingSyncedFiles.map(f => f.google_drive_file_id));

      // Mock finding new files in Google Drive (in production, this would be actual Google Drive API calls)
      const mockFiles = [
        {
          google_drive_file_id: `file-${Date.now()}-amadeus-${Math.random()}`,
          file_name: `amadeus-export-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.txt`,
          file_size: 15420,
          gds_source: "amadeus",
          mockTicketData: { 
            passenger_name: `John Doe ${Math.random().toString().slice(-4)}`, 
            passenger_email: `john.doe${Math.random().toString().slice(-4)}@email.com`,
            passenger_phone: '+1-555-0123',
            pnr: `ABC${Math.random().toString().slice(-3)}`, 
            booking_reference: `BKG${Date.now()}`,
            ticket_number: `157-${Date.now()}`, 
            total_amount: Math.round((Math.random() * 2000 + 500) * 100) / 100,
            base_fare: Math.round((Math.random() * 1500 + 400) * 100) / 100,
            taxes: Math.round((Math.random() * 300 + 50) * 100) / 100,
            currency: 'USD',
            flight_segments: [{
              airline: 'AA',
              flight_number: 'AA' + Math.floor(Math.random() * 9999),
              origin: 'LAX',
              destination: 'JFK',
              departure_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              arrival_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
              class: 'Y'
            }]
          }
        },
        {
          google_drive_file_id: `file-${Date.now()}-sabre-${Math.random()}`,
          file_name: `sabre-export-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.csv`,
          file_size: 22800,
          gds_source: "sabre",
          mockTicketData: { 
            passenger_name: `Jane Smith ${Math.random().toString().slice(-4)}`, 
            passenger_email: `jane.smith${Math.random().toString().slice(-4)}@email.com`,
            passenger_phone: '+1-555-0456',
            pnr: `XYZ${Math.random().toString().slice(-3)}`, 
            booking_reference: `BKG${Date.now() + 1}`,
            ticket_number: `001-${Date.now() + 1}`, 
            total_amount: Math.round((Math.random() * 1500 + 400) * 100) / 100,
            base_fare: Math.round((Math.random() * 1200 + 300) * 100) / 100,
            taxes: Math.round((Math.random() * 250 + 40) * 100) / 100,
            currency: 'USD',
            flight_segments: [{
              airline: 'DL',
              flight_number: 'DL' + Math.floor(Math.random() * 9999),
              origin: 'ATL',
              destination: 'ORD',
              departure_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              arrival_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
              class: 'J'
            }]
          }
        }
      ];

      // Filter out files that have already been synced (duplicate prevention)
      const newFiles = mockFiles.filter(file => !existingFileIds.has(file.google_drive_file_id));

      if (newFiles.length === 0) {
        alert("No new files found. All files from the folder have already been synced.");
        setSyncing(false);
        return;
      }

      let newTicketsCount = 0;
      let newClientsCount = 0;
      let newBookingsCount = 0;
      let newInvoicesCount = 0;

      for (const fileData of newFiles) {
        // Log the file sync
        const syncedFile = await SyncedFile.create({
          integration_id: integration.id,
          google_drive_file_id: fileData.google_drive_file_id,
          file_name: fileData.file_name,
          file_size: fileData.file_size,
          gds_source: fileData.gds_source,
          sync_date: new Date().toISOString(),
          processing_status: 'processing'
        });

        // Create a GDS ticket from the file
        const newTicket = await GDSTicket.create({
            ...fileData.mockTicketData,
            gds_source: fileData.gds_source,
            agency_id: user.agency_id, // CRITICAL: Ensure agency isolation
            agent_email: user.email,
            status: 'active',
            processing_status: 'pending'
        });
        newTicketsCount++;
        
        // Trigger comprehensive workflow for the new ticket
        const workflowResult = await executeWorkflow({
            workflow_type: 'auto_process_ticket',
            trigger_data: newTicket
        });
        
        if (workflowResult?.data?.created_records) {
          const records = workflowResult.data.created_records;
          if (records.client_id) newClientsCount++;
          if (records.booking_id) newBookingsCount++;
          if (records.invoice_id) newInvoicesCount++;
        }
        
        // Update the synced file log
        await SyncedFile.update(syncedFile.id, {
            processing_status: 'completed',
            tickets_created: 1
        });
      }

      await GoogleDriveIntegration.update(integration.id, {
        last_sync_date: new Date().toISOString()
      });

      await loadUserAndIntegration(); // Reload integration data and synced files
      onIntegrationUpdate?.(); // CRITICAL: Call parent callback to reload tickets list
      
      // Show detailed success message
      const successMessage = [
        `✅ Successfully synced ${newFiles.length} new file(s)`,
        `📋 ${newTicketsCount} tickets created`,
        `👥 ${newClientsCount} new clients added`,
        `🎫 ${newBookingsCount} bookings generated`, 
        `📄 ${newInvoicesCount} invoices created`
      ].join('\n');
      
      alert(successMessage);

    } catch (e) {
      console.error("Error syncing files:", e);
      setError("A failure occurred during the manual sync process.");
    }
    setSyncing(false);
  };

  const handleToggleAutoSync = async (enabled) => {
    if (!integration) return;

    try {
      const updatedIntegration = await GoogleDriveIntegration.update(integration.id, {
        auto_sync_enabled: enabled
      });
      setIntegration(updatedIntegration);
    } catch (e) {
      console.error("Error updating auto-sync:", e);
      setError("Failed to update auto-sync setting.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProcessingStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="bg-amber-100/30 border-amber-200/50 shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-amber-200/50 rounded w-3/4"></div>
            <div className="h-10 bg-amber-200/50 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Connection Setup */}
      <Card className={`shadow-xl rounded-xl ${integration ? 'bg-green-50/50 border-green-200/50' : 'bg-amber-50/50 border-amber-200/50'} backdrop-blur-md`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Cloud className="w-5 h-5 text-amber-800" />
              Google Drive Integration
            </CardTitle>
            {integration && (
              <Badge className={integration.status === 'connected' ? 'bg-green-100/50 text-green-800 border-green-200/50' : 'bg-gray-100 text-gray-800'}>
                {integration.status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                {integration.status?.charAt(0).toUpperCase() + integration.status?.slice(1)}
              </Badge>
            )}
          </div>
           <CardDescription className="text-amber-700/80">
            {!integration
              ? "Connect your Google Drive to automatically sync GDS files from a specific folder."
              : "Manage your active Google Drive connection."}
           </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!integration ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="folder_name" className="text-amber-800 font-medium">Folder Name</Label>
                <Input
                  id="folder_name"
                  placeholder="e.g., GDS Backoffice Files"
                  value={setupData.folder_name}
                  onChange={(e) => setSetupData(prev => ({ ...prev, folder_name: e.target.value }))}
                  className="bg-amber-100/50 border-amber-300/50"
                />
                <p className="text-sm text-amber-600/80">The name of the Google Drive folder to monitor.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sync_frequency" className="text-amber-800 font-medium">Sync Frequency</Label>
                <Select
                  value={setupData.sync_frequency}
                  onValueChange={(value) => setSetupData(prev => ({ ...prev, sync_frequency: value }))}
                >
                  <SelectTrigger className="bg-amber-100/50 border-amber-300/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time (coming soon)</SelectItem>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGoogleDriveConnect}
                disabled={connecting || !user || !user.agency_id}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                {connecting ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Connecting...</>
                ) : (
                  <><Cloud className="w-4 h-4 mr-2" />Connect Google Drive</>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-100/30 rounded-lg border border-amber-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-amber-700" />
                    <span className="font-medium text-amber-900">{integration.folder_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-amber-800">Auto-sync</span>
                    <Switch
                      checked={integration.auto_sync_enabled}
                      onCheckedChange={handleToggleAutoSync}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-amber-600/80">Frequency:</span>
                    <p className="font-medium capitalize text-amber-900">{integration.sync_frequency}</p>
                  </div>
                  <div>
                    <span className="text-amber-600/80">Last Sync:</span>
                    <p className="font-medium text-amber-900">
                      {integration.last_sync_date
                        ? format(new Date(integration.last_sync_date), 'MMM d, HH:mm')
                        : 'Never'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-amber-600/80">Files Synced:</span>
                    <p className="font-medium text-amber-900">{syncedFiles.length}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleManualSync}
                  disabled={syncing}
                  variant="outline"
                  className="flex-1 bg-white/50 border-amber-300/50 hover:bg-white/70 text-amber-800"
                >
                  {syncing ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Syncing...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4 mr-2" />Sync Now</>
                  )}
                </Button>
                <Button variant="outline" className="bg-white/50 border-amber-300/50 hover:bg-white/70 text-amber-800">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Synced Files */}
      {syncedFiles.length > 0 && (
        <Card className="bg-amber-50/50 backdrop-blur-md border-amber-200/50 rounded-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Clock className="w-5 h-5 text-amber-800" />
              Recently Synced Files
            </CardTitle>
            <CardDescription className="text-amber-700/80">
                This log shows files detected in your Google Drive folder and their processing status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-amber-100/40 rounded-lg border border-amber-200/50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-900">{file.file_name}</p>
                      <p className="text-sm text-amber-600/80">
                        {(file.file_size / 1024).toFixed(1)} KB • {format(new Date(file.sync_date), 'MMM d, HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100/50 text-blue-800 border-blue-200/50">
                      {file.gds_source?.toUpperCase()}
                    </Badge>
                    <Badge className={
                      file.processing_status === 'completed' ? 'bg-green-100/50 text-green-800 border-green-200/50' :
                      file.processing_status === 'processing' ? 'bg-blue-100/50 text-blue-800 border-blue-200/50' :
                      'bg-red-100/50 text-red-800 border-red-200/50'
                    }>
                      {file.processing_status}
                    </Badge>
                    {file.tickets_created > 0 && (
                      <Badge variant="outline" className="border-amber-300/50 text-amber-800">
                        {file.tickets_created} tickets
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
