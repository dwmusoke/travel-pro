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
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
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
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Headphones,
  Speaker,
  Wifi,
  Bluetooth,
  Smartphone as Phone,
  Monitor,
  Printer,
  Camera,
  Wifi as WifiIcon,
  Satellite,
  Server,
  HardDrive,
  Cpu,
  Battery,
  Power,
  WifiOff,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Command,
  Keyboard,
  Mouse
} from 'lucide-react';

export default function VoiceCommandInterface({ 
  onCommandExecuted,
  onVoiceInput 
}) {
  const [activeTab, setActiveTab] = useState('commands');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [microphoneLevel, setMicrophoneLevel] = useState(0);
  const [currentCommand, setCurrentCommand] = useState('');

  // Voice commands
  const [commands, setCommands] = useState([
    {
      id: 'cmd_001',
      phrase: 'Show dashboard',
      action: 'navigate',
      target: 'dashboard',
      category: 'navigation',
      status: 'active',
      usage: 45,
      accuracy: 98.5,
      lastUsed: '2024-01-15T10:30:00Z'
    },
    {
      id: 'cmd_002',
      phrase: 'Create new booking',
      action: 'create',
      target: 'booking',
      category: 'sales',
      status: 'active',
      usage: 23,
      accuracy: 95.2,
      lastUsed: '2024-01-15T09:15:00Z'
    },
    {
      id: 'cmd_003',
      phrase: 'Generate invoice',
      action: 'generate',
      target: 'invoice',
      category: 'financial',
      status: 'active',
      usage: 18,
      accuracy: 97.8,
      lastUsed: '2024-01-15T08:45:00Z'
    },
    {
      id: 'cmd_004',
      phrase: 'Check financial reports',
      action: 'view',
      target: 'reports',
      category: 'reports',
      status: 'active',
      usage: 12,
      accuracy: 96.1,
      lastUsed: '2024-01-15T07:30:00Z'
    }
  ]);

  // Voice history
  const [voiceHistory, setVoiceHistory] = useState([
    {
      id: 'hist_001',
      input: 'Show dashboard',
      recognized: 'Show dashboard',
      confidence: 0.985,
      executed: true,
      timestamp: '2024-01-15T10:30:00Z',
      response: 'Navigating to dashboard'
    },
    {
      id: 'hist_002',
      input: 'Create new booking',
      recognized: 'Create new booking',
      confidence: 0.952,
      executed: true,
      timestamp: '2024-01-15T09:15:00Z',
      response: 'Opening booking form'
    },
    {
      id: 'hist_003',
      input: 'Generate invoice',
      recognized: 'Generate invoice',
      confidence: 0.978,
      executed: true,
      timestamp: '2024-01-15T08:45:00Z',
      response: 'Creating new invoice'
    }
  ]);

  // Voice settings
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en-US',
    voice: 'en-US-Neural2-F',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    wakeWord: 'TravelPro',
    sensitivity: 0.7,
    autoListen: true
  });

  // Voice statistics
  const [voiceStats, setVoiceStats] = useState({
    totalCommands: 156,
    successfulCommands: 148,
    accuracy: 94.9,
    averageResponseTime: 1.2,
    mostUsedCommand: 'Show dashboard',
    totalUsageTime: 45.5
  });

  const startListening = async () => {
    setIsListening(true);
    setMicrophoneLevel(0);
    
    // Simulate microphone level changes
    const interval = setInterval(() => {
      setMicrophoneLevel(Math.random() * 100);
    }, 100);
    
    // Simulate voice input after 3 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsListening(false);
      setMicrophoneLevel(0);
      
      const newInput = 'Show financial reports';
      setCurrentCommand(newInput);
      
      processVoiceInput(newInput);
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
    setMicrophoneLevel(0);
  };

  const processVoiceInput = async (input) => {
    setIsProcessing(true);
    try {
      // Simulate voice processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const recognized = input; // In real implementation, this would be the recognized text
      const confidence = 0.95 + Math.random() * 0.05;
      
      const newHistory = {
        id: `hist_${Date.now()}`,
        input: input,
        recognized: recognized,
        confidence: confidence,
        executed: confidence > 0.8,
        timestamp: new Date().toISOString(),
        response: `Executed: ${recognized}`
      };
      
      setVoiceHistory(prev => [newHistory, ...prev]);
      
      if (onVoiceInput) {
        onVoiceInput(newHistory);
      }
      
      setCurrentCommand('');
    } catch (error) {
      console.error('Voice processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const addCommand = async (commandData) => {
    setIsProcessing(true);
    try {
      // Simulate command creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCommand = {
        id: `cmd_${Date.now()}`,
        phrase: commandData.phrase,
        action: commandData.action,
        target: commandData.target,
        category: commandData.category,
        status: 'active',
        usage: 0,
        accuracy: 0,
        lastUsed: null
      };
      
      setCommands(prev => [...prev, newCommand]);
      
      if (onCommandExecuted) {
        onCommandExecuted(newCommand);
      }
    } catch (error) {
      console.error('Command creation failed:', error);
    } finally {
      setIsProcessing(false);
      setShowCommandModal(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      processing: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={variants[status] || variants.inactive}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'navigation': return 'bg-blue-100 text-blue-800';
      case 'sales': return 'bg-green-100 text-green-800';
      case 'financial': return 'bg-purple-100 text-purple-800';
      case 'reports': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const CommandsTab = () => (
    <div className="space-y-6">
      {/* Voice Control Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Voice Control</span>
            <div className="flex gap-2">
              <Button 
                variant={voiceEnabled ? "default" : "outline"}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
                {voiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}
              </Button>
              <Button variant="outline" onClick={() => setShowSettingsModal(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            {/* Microphone Visualization */}
            <div className="flex justify-center">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center ${
                  isListening ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}>
                  {isListening ? (
                    <Mic className="w-12 h-12 text-blue-600 animate-pulse" />
                  ) : (
                    <Mic className="w-12 h-12 text-gray-600" />
                  )}
                </div>
                
                {/* Microphone level indicator */}
                {isListening && (
                  <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-blue-300 animate-ping"></div>
                )}
              </div>
            </div>
            
            {/* Microphone Level Bar */}
            {isListening && (
              <div className="w-64 mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${microphoneLevel}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Microphone Level: {Math.round(microphoneLevel)}%
                </div>
              </div>
            )}
            
            {/* Current Command Display */}
            {currentCommand && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-2">Recognized Command:</div>
                <div className="text-lg font-medium text-blue-800">{currentCommand}</div>
              </div>
            )}
            
            {/* Control Buttons */}
            <div className="flex justify-center gap-4">
              {!isListening ? (
                <Button 
                  onClick={startListening}
                  disabled={!voiceEnabled || isProcessing}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Listening
                </Button>
              ) : (
                <Button 
                  onClick={stopListening}
                  variant="destructive"
                  size="lg"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop Listening
                </Button>
              )}
            </div>
            
            {/* Status Message */}
            <div className="text-sm text-gray-600">
              {isListening ? 'Listening... Speak your command' : 
               isProcessing ? 'Processing your command...' : 
               'Click "Start Listening" to begin'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commands</CardTitle>
            <Command className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voiceStats.totalCommands}</div>
            <p className="text-xs text-muted-foreground">
              {voiceStats.successfulCommands} successful
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voiceStats.accuracy}%</div>
            <p className="text-xs text-muted-foreground">
              Voice recognition
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voiceStats.averageResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              Average response
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voiceStats.totalUsageTime}h</div>
            <p className="text-xs text-muted-foreground">
              Total voice usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Available Commands</span>
            <Button onClick={() => setShowCommandModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Command
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commands.map((command) => (
              <div key={command.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">"{command.phrase}"</h3>
                    <p className="text-sm text-gray-600">
                      {command.action} {command.target}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getCategoryColor(command.category)}>
                      {command.category}
                    </Badge>
                    {getStatusBadge(command.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Usage:</span>
                    <div className="font-medium">{command.usage} times</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Accuracy:</span>
                    <div className="font-medium">{command.accuracy}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Used:</span>
                    <div className="font-medium">
                      {command.lastUsed ? new Date(command.lastUsed).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const HistoryTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Voice Command History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Input</TableHead>
                <TableHead>Recognized</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voiceHistory.map((history) => (
                <TableRow key={history.id}>
                  <TableCell className="font-medium">{history.input}</TableCell>
                  <TableCell>{history.recognized}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {(history.confidence * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {history.executed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{history.response}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(history.timestamp).toLocaleString()}
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
          <h2 className="text-2xl font-bold">Voice Command Interface</h2>
          <p className="text-muted-foreground">
            AI-powered voice recognition for hands-free operation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Activity className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="commands">Voice Commands</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="commands">
          <CommandsTab />
        </TabsContent>
        
        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>
      </Tabs>

      {/* Voice Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Voice Settings</DialogTitle>
            <DialogDescription>
              Configure voice recognition and speech synthesis settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={voiceSettings.language} onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="voice">Voice</Label>
                <Select value={voiceSettings.voice} onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, voice: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US-Neural2-F">Female (Neural)</SelectItem>
                    <SelectItem value="en-US-Neural2-M">Male (Neural)</SelectItem>
                    <SelectItem value="en-US-Standard-F">Female (Standard)</SelectItem>
                    <SelectItem value="en-US-Standard-M">Male (Standard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="speed">Speed</Label>
                <Input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1" 
                  value={voiceSettings.speed}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                />
                <div className="text-sm text-gray-600">{voiceSettings.speed}x</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pitch">Pitch</Label>
                <Input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1" 
                  value={voiceSettings.pitch}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                />
                <div className="text-sm text-gray-600">{voiceSettings.pitch}x</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="volume">Volume</Label>
                <Input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={voiceSettings.volume}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                />
                <div className="text-sm text-gray-600">{Math.round(voiceSettings.volume * 100)}%</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wakeWord">Wake Word</Label>
              <Input 
                value={voiceSettings.wakeWord}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, wakeWord: e.target.value }))}
                placeholder="Enter wake word"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sensitivity">Sensitivity</Label>
              <Input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={voiceSettings.sensitivity}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, sensitivity: parseFloat(e.target.value) }))}
              />
              <div className="text-sm text-gray-600">{Math.round(voiceSettings.sensitivity * 100)}%</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoListen"
                checked={voiceSettings.autoListen}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, autoListen: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="autoListen">Auto-listen mode</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettingsModal(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Command Modal */}
      <Dialog open={showCommandModal} onOpenChange={setShowCommandModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Voice Command</DialogTitle>
            <DialogDescription>
              Create a new voice command for hands-free operation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phrase">Command Phrase</Label>
              <Input id="phrase" placeholder="Enter the voice command phrase" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="navigate">Navigate</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="generate">Generate</SelectItem>
                    <SelectItem value="search">Search</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target">Target</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="booking">Booking</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="reports">Reports</SelectItem>
                    <SelectItem value="clients">Clients</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="navigation">Navigation</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="reports">Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommandModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => addCommand({
                phrase: 'New Command',
                action: 'navigate',
                target: 'dashboard',
                category: 'navigation'
              })}
              disabled={isProcessing}
            >
              {isProcessing ? 'Creating...' : 'Create Command'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 