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
  Wifi, 
  Signal,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart3,
  FileText,
  Calendar,
  MapPin,
  Zap,
  Brain,
  Lock,
  Unlock,
  Key,
  Database,
  Globe,
  Smartphone,
  CreditCard,
  Receipt,
  Calculator,
  Award,
  Star,
  Search,
  Filter,
  AlertCircle,
  CheckSquare,
  Square,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Thermometer,
  Droplets,
  Gauge,
  Smartphone as Phone,
  Monitor,
  Printer,
  Camera,
  Wifi as WifiIcon,
  Bluetooth,
  Satellite,
  Server,
  HardDrive,
  Cpu,
  Battery,
  Power,
  WifiOff,
  SignalHigh,
  SignalMedium,
  SignalLow
} from 'lucide-react';

export default function IoTDataManager({ 
  onDeviceConnected,
  onDataReceived 
}) {
  const [activeTab, setActiveTab] = useState('devices');
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // IoT Devices
  const [devices, setDevices] = useState([
    {
      id: 'device_001',
      name: 'Office Temperature Sensor',
      type: 'sensor',
      category: 'environmental',
      status: 'online',
      location: 'Main Office',
      ipAddress: '192.168.1.100',
      macAddress: '00:11:22:33:44:55',
      lastSeen: '2024-01-15T10:30:00Z',
      batteryLevel: 85,
      signalStrength: 'high',
      dataPoints: 1250,
      lastReading: {
        temperature: 22.5,
        humidity: 45.2,
        timestamp: '2024-01-15T10:30:00Z'
      }
    },
    {
      id: 'device_002',
      name: 'Smart Printer',
      type: 'printer',
      category: 'office',
      status: 'online',
      location: 'Print Room',
      ipAddress: '192.168.1.101',
      macAddress: '00:11:22:33:44:56',
      lastSeen: '2024-01-15T10:25:00Z',
      batteryLevel: null,
      signalStrength: 'high',
      dataPoints: 890,
      lastReading: {
        inkLevel: 75,
        paperLevel: 90,
        printJobs: 3,
        timestamp: '2024-01-15T10:25:00Z'
      }
    },
    {
      id: 'device_003',
      name: 'Security Camera',
      type: 'camera',
      category: 'security',
      status: 'offline',
      location: 'Front Entrance',
      ipAddress: '192.168.1.102',
      macAddress: '00:11:22:33:44:57',
      lastSeen: '2024-01-15T09:45:00Z',
      batteryLevel: 15,
      signalStrength: 'low',
      dataPoints: 2340,
      lastReading: {
        motionDetected: false,
        recording: true,
        storageUsed: 65,
        timestamp: '2024-01-15T09:45:00Z'
      }
    }
  ]);

  // Real-time data streams
  const [dataStreams, setDataStreams] = useState([
    {
      id: 'stream_001',
      deviceId: 'device_001',
      metric: 'temperature',
      value: 22.5,
      unit: '°C',
      timestamp: '2024-01-15T10:30:00Z',
      trend: 'stable',
      alert: false
    },
    {
      id: 'stream_002',
      deviceId: 'device_001',
      metric: 'humidity',
      value: 45.2,
      unit: '%',
      timestamp: '2024-01-15T10:30:00Z',
      trend: 'decreasing',
      alert: false
    },
    {
      id: 'stream_003',
      deviceId: 'device_002',
      metric: 'ink_level',
      value: 75,
      unit: '%',
      timestamp: '2024-01-15T10:25:00Z',
      trend: 'decreasing',
      alert: true
    }
  ]);

  // IoT Alerts
  const [alerts, setAlerts] = useState([
    {
      id: 'alert_001',
      deviceId: 'device_002',
      type: 'warning',
      severity: 'medium',
      title: 'Low Ink Level',
      description: 'Printer ink level is below 20%',
      timestamp: '2024-01-15T10:25:00Z',
      status: 'active',
      acknowledged: false
    },
    {
      id: 'alert_002',
      deviceId: 'device_003',
      type: 'error',
      severity: 'high',
      title: 'Device Offline',
      description: 'Security camera has been offline for 45 minutes',
      timestamp: '2024-01-15T09:45:00Z',
      status: 'active',
      acknowledged: true
    }
  ]);

  // Network statistics
  const [networkStats, setNetworkStats] = useState({
    totalDevices: 15,
    onlineDevices: 12,
    offlineDevices: 3,
    totalDataPoints: 45600,
    dataTransferred: 2.5, // GB
    averageLatency: 45, // ms
    networkHealth: 92
  });

  const connectDevice = async (deviceData) => {
    setIsProcessing(true);
    try {
      // Simulate device connection
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newDevice = {
        id: `device_${Date.now()}`,
        name: deviceData.name,
        type: deviceData.type,
        category: deviceData.category,
        status: 'online',
        location: deviceData.location,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 100) + 100}`,
        macAddress: `00:11:22:33:44:${Math.floor(Math.random() * 100)}`,
        lastSeen: new Date().toISOString(),
        batteryLevel: deviceData.type === 'sensor' ? Math.floor(Math.random() * 100) : null,
        signalStrength: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        dataPoints: 0,
        lastReading: {}
      };
      
      setDevices(prev => [...prev, newDevice]);
      
      if (onDeviceConnected) {
        onDeviceConnected(newDevice);
      }
    } catch (error) {
      console.error('Device connection failed:', error);
    } finally {
      setIsProcessing(false);
      setShowDeviceModal(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      online: 'bg-green-100 text-green-800',
      offline: 'bg-red-100 text-red-800',
      connecting: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status] || variants.offline}>
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

  const getSignalIcon = (strength) => {
    switch (strength) {
      case 'high': return <SignalHigh className="w-4 h-4 text-green-600" />;
      case 'medium': return <SignalMedium className="w-4 h-4 text-yellow-600" />;
      case 'low': return <SignalLow className="w-4 h-4 text-red-600" />;
      default: return <WifiOff className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'sensor': return <Thermometer className="w-4 h-4" />;
      case 'printer': return <Printer className="w-4 h-4" />;
      case 'camera': return <Camera className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'computer': return <Monitor className="w-4 h-4" />;
      default: return <Wifi className="w-4 h-4" />;
    }
  };

  const DevicesTab = () => (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.totalDevices}</div>
            <p className="text-xs text-muted-foreground">
              {networkStats.onlineDevices} online
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Health</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.networkHealth}%</div>
            <p className="text-xs text-muted-foreground">
              {networkStats.averageLatency}ms latency
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.totalDataPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {networkStats.dataTransferred}GB transferred
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter(a => a.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(a => !a.acknowledged).length} unacknowledged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Devices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Connected Devices</span>
            <Button onClick={() => setShowDeviceModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <Card key={device.id} className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.type)}
                      <span className="text-lg">{device.name}</span>
                    </div>
                    {getStatusBadge(device.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Type</Label>
                        <div className="font-medium capitalize">{device.type}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Category</Label>
                        <div className="font-medium capitalize">{device.category}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Location</span>
                        <span className="font-medium">{device.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">IP Address</span>
                        <span className="font-mono text-sm">{device.ipAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Signal</span>
                        <div className="flex items-center gap-1">
                          {getSignalIcon(device.signalStrength)}
                          <span className="text-sm capitalize">{device.signalStrength}</span>
                        </div>
                      </div>
                    </div>
                    
                    {device.batteryLevel !== null && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Battery</span>
                          <span className="font-medium">{device.batteryLevel}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              device.batteryLevel > 50 ? 'bg-green-600' :
                              device.batteryLevel > 20 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${device.batteryLevel}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DataStreamsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Data Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataStreams.map((stream) => {
                const device = devices.find(d => d.id === stream.deviceId);
                return (
                  <TableRow key={stream.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device?.type)}
                        <span className="font-medium">{device?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{stream.metric.replace('_', ' ')}</TableCell>
                    <TableCell>
                      <div className="font-bold">
                        {stream.value}{stream.unit}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {stream.trend === 'increasing' ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        ) : stream.trend === 'decreasing' ? (
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="text-sm capitalize">{stream.trend}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(stream.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {stream.alert ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const AlertsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>IoT Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => {
              const device = devices.find(d => d.id === alert.deviceId);
              return (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {!alert.acknowledged && (
                            <Badge variant="outline">Unacknowledged</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Device: {device?.name}</span>
                          <span>Location: {device?.location}</span>
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!alert.acknowledged && (
                        <Button variant="outline" size="sm">
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Acknowledge
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">IoT Data Manager</h2>
          <p className="text-muted-foreground">
            Real-time data collection from connected devices and sensors
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Activity className="w-4 h-4 mr-2" />
            Monitor
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="streams">Data Streams</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="devices">
          <DevicesTab />
        </TabsContent>
        
        <TabsContent value="streams">
          <DataStreamsTab />
        </TabsContent>
        
        <TabsContent value="alerts">
          <AlertsTab />
        </TabsContent>
      </Tabs>

      {/* Add Device Modal */}
      <Dialog open={showDeviceModal} onOpenChange={setShowDeviceModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add IoT Device</DialogTitle>
            <DialogDescription>
              Connect a new IoT device to the network
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name</Label>
              <Input id="deviceName" placeholder="Enter device name" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deviceType">Device Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sensor">Sensor</SelectItem>
                    <SelectItem value="printer">Printer</SelectItem>
                    <SelectItem value="camera">Camera</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="computer">Computer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceCategory">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="environmental">Environmental</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deviceLocation">Location</Label>
              <Input id="deviceLocation" placeholder="Enter device location" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deviceIP">IP Address</Label>
              <Input id="deviceIP" placeholder="192.168.1.100" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeviceModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => connectDevice({
                name: 'New Device',
                type: 'sensor',
                category: 'environmental',
                location: 'Office',
                ipAddress: '192.168.1.100'
              })}
              disabled={isProcessing}
            >
              {isProcessing ? 'Connecting...' : 'Connect Device'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 