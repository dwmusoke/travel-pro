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
  RefreshCw, 
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Banknote,
  CreditCard,
  Building,
  Users,
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Zap,
  Brain,
  Shield,
  Lock,
  Unlock,
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  FileText,
  Receipt,
  Calculator,
  X
} from 'lucide-react';

export default function AutomatedReconciliation({ 
  onReconciliationComplete,
  onDiscrepancyFound 
}) {
  const [activeTab, setActiveTab] = useState('bank');
  const [isReconciling, setIsReconciling] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [autoReconcile, setAutoReconcile] = useState(true);

  // Reconciliation data
  const [reconciliationData, setReconciliationData] = useState({
    bank: {
      totalTransactions: 156,
      matched: 142,
      unmatched: 14,
      accuracy: 91.0,
      lastReconciled: '2024-01-15T10:30:00Z',
      status: 'completed'
    },
    gds: {
      totalTransactions: 89,
      matched: 85,
      unmatched: 4,
      accuracy: 95.5,
      lastReconciled: '2024-01-15T09:15:00Z',
      status: 'completed'
    },
    vendors: {
      totalTransactions: 67,
      matched: 62,
      unmatched: 5,
      accuracy: 92.5,
      lastReconciled: '2024-01-15T08:45:00Z',
      status: 'completed'
    }
  });

  // Unmatched transactions
  const [unmatchedTransactions, setUnmatchedTransactions] = useState([
    {
      id: 'unm_001',
      type: 'bank',
      date: '2024-01-15',
      description: 'ATM Withdrawal',
      amount: -500.00,
      reference: 'ATM123456',
      status: 'unmatched',
      confidence: 0.45
    },
    {
      id: 'unm_002',
      type: 'gds',
      date: '2024-01-14',
      description: 'Commission Payment',
      amount: 1250.00,
      reference: 'GDS789012',
      status: 'unmatched',
      confidence: 0.78
    },
    {
      id: 'unm_003',
      type: 'vendor',
      date: '2024-01-13',
      description: 'Office Supplies',
      amount: -89.99,
      reference: 'VND345678',
      status: 'unmatched',
      confidence: 0.92
    }
  ]);

  // Discrepancies
  const [discrepancies, setDiscrepancies] = useState([
    {
      id: 'disc_001',
      type: 'amount_mismatch',
      severity: 'high',
      description: 'Bank statement shows $1,250 but GDS shows $1,200',
      amount: 50.00,
      date: '2024-01-15',
      status: 'open',
      suggestedAction: 'Contact GDS provider for clarification'
    },
    {
      id: 'disc_002',
      type: 'missing_transaction',
      severity: 'medium',
      description: 'Vendor payment not reflected in bank statement',
      amount: 89.99,
      date: '2024-01-13',
      status: 'investigating',
      suggestedAction: 'Check payment processing status'
    }
  ]);

  // AI matching suggestions
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      transactionId: 'unm_001',
      suggestedMatch: 'Bank transaction #12345',
      confidence: 0.85,
      reason: 'Amount and date match, description similar',
      action: 'auto_match'
    },
    {
      transactionId: 'unm_002',
      suggestedMatch: 'GDS commission #GDS789',
      confidence: 0.92,
      reason: 'Exact amount match, reference number correlation',
      action: 'review'
    }
  ]);

  const startReconciliation = async (type) => {
    setIsReconciling(true);
    try {
      // Simulate reconciliation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update reconciliation data
      const updatedData = { ...reconciliationData };
      updatedData[type] = {
        ...updatedData[type],
        lastReconciled: new Date().toISOString(),
        status: 'completed'
      };
      
      setReconciliationData(updatedData);
      
      if (onReconciliationComplete) {
        onReconciliationComplete(type, updatedData[type]);
      }
    } catch (error) {
      console.error('Reconciliation failed:', error);
    } finally {
      setIsReconciling(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      open: 'bg-blue-100 text-blue-800',
      investigating: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={variants[status] || variants.open}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
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

  const BankReconciliationTab = () => (
    <div className="space-y-6">
      {/* Bank Reconciliation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Bank Account Reconciliation
            </span>
            <div className="flex gap-2">
              <Button 
                onClick={() => startReconciliation('bank')}
                disabled={isReconciling}
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isReconciling ? 'animate-spin' : ''}`} />
                {isReconciling ? 'Reconciling...' : 'Start Reconciliation'}
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import Statement
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Total Transactions</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {reconciliationData.bank.totalTransactions}
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Matched</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {reconciliationData.bank.matched}
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Unmatched</span>
              </div>
              <div className="text-2xl font-bold text-red-900">
                {reconciliationData.bank.unmatched}
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {reconciliationData.bank.accuracy}%
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Reconciled:</span>
              <span className="font-medium">
                {new Date(reconciliationData.bank.lastReconciled).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unmatched Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Unmatched Bank Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>AI Confidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unmatchedTransactions.filter(t => t.type === 'bank').map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{transaction.reference}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${transaction.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{(transaction.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
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

  const GDSReconciliationTab = () => (
    <div className="space-y-6">
      {/* GDS Reconciliation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              GDS System Reconciliation
            </span>
            <div className="flex gap-2">
              <Button 
                onClick={() => startReconciliation('gds')}
                disabled={isReconciling}
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isReconciling ? 'animate-spin' : ''}`} />
                {isReconciling ? 'Reconciling...' : 'Start Reconciliation'}
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Total Transactions</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {reconciliationData.gds.totalTransactions}
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Matched</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {reconciliationData.gds.matched}
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Unmatched</span>
              </div>
              <div className="text-2xl font-bold text-red-900">
                {reconciliationData.gds.unmatched}
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {reconciliationData.gds.accuracy}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Reconciliation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Expected Commissions</span>
                </div>
                <div className="text-2xl font-bold text-green-900">$12,450.00</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Received Commissions</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">$12,200.00</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium">Outstanding</span>
                </div>
                <div className="text-2xl font-bold text-red-900">$250.00</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DiscrepanciesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Reconciliation Discrepancies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discrepancies.map((discrepancy) => (
                <TableRow key={discrepancy.id}>
                  <TableCell className="font-medium capitalize">
                    {discrepancy.type.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(discrepancy.severity)}>
                      {discrepancy.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{discrepancy.description}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(discrepancy.amount)}
                  </TableCell>
                  <TableCell>{new Date(discrepancy.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(discrepancy.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Matching Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">Transaction #{suggestion.transactionId}</h4>
                      <Badge variant="outline">
                        {(suggestion.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Suggested Match:</strong> {suggestion.suggestedMatch}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Reason:</strong> {suggestion.reason}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Match
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Review Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automated Reconciliation System</h2>
          <p className="text-muted-foreground">
            AI-powered reconciliation for bank accounts, GDS systems, and vendor payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettingsModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bank">Bank Reconciliation</TabsTrigger>
          <TabsTrigger value="gds">GDS Reconciliation</TabsTrigger>
          <TabsTrigger value="discrepancies">Discrepancies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bank">
          <BankReconciliationTab />
        </TabsContent>
        
        <TabsContent value="gds">
          <GDSReconciliationTab />
        </TabsContent>
        
        <TabsContent value="discrepancies">
          <DiscrepanciesTab />
        </TabsContent>
      </Tabs>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reconciliation Settings</DialogTitle>
            <DialogDescription>
              Configure automated reconciliation parameters and AI matching rules
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Auto-Reconciliation</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoReconcile"
                  checked={autoReconcile}
                  onChange={(e) => setAutoReconcile(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="autoReconcile">Enable automatic reconciliation</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Reconciliation Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="previous-month">Previous Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>AI Matching Threshold</Label>
              <div className="text-sm text-gray-600">
                Minimum confidence level for automatic transaction matching (85%)
              </div>
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
    </div>
  );
} 