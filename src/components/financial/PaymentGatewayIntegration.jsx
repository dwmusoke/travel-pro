import React, { useState, useEffect } from 'react';
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
  CreditCard, 
  DollarSign, 
  Settings, 
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Download,
  Eye,
  Plus,
  Trash2,
  Edit,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Monitor,
  Lock,
  Unlock,
  Activity
} from 'lucide-react';

// Supported payment gateways
const PAYMENT_GATEWAYS = [
  {
    id: 'stripe',
    name: 'Stripe',
    logo: '💳',
    description: 'Global payment processing platform',
    features: ['Credit Cards', 'Digital Wallets', 'International Payments', 'Subscription Billing'],
    status: 'active',
    transactionFee: '2.9% + 30¢',
    setupFee: '$0',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    supportedCountries: ['US', 'CA', 'UK', 'AU', 'EU']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: '🔵',
    description: 'Digital payment platform',
    features: ['PayPal Balance', 'Credit Cards', 'Bank Transfers', 'Buy Now Pay Later'],
    status: 'active',
    transactionFee: '2.9% + 30¢',
    setupFee: '$0',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    supportedCountries: ['US', 'CA', 'UK', 'AU', 'EU']
  },
  {
    id: 'square',
    name: 'Square',
    logo: '⬜',
    description: 'Point of sale and payment processing',
    features: ['Credit Cards', 'Contactless Payments', 'Invoicing', 'Inventory Management'],
    status: 'inactive',
    transactionFee: '2.6% + 10¢',
    setupFee: '$0',
    supportedCurrencies: ['USD', 'CAD', 'AUD', 'GBP', 'JPY'],
    supportedCountries: ['US', 'CA', 'AU', 'UK', 'JP']
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    logo: '🟢',
    description: 'African payment technology company',
    features: ['Local Payment Methods', 'Mobile Money', 'Bank Transfers', 'Card Payments'],
    status: 'active',
    transactionFee: '3.5%',
    setupFee: '$0',
    supportedCurrencies: ['NGN', 'USD', 'EUR', 'GBP', 'KES', 'GHS'],
    supportedCountries: ['NG', 'KE', 'GH', 'ZA', 'UG', 'TZ']
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    logo: '🔴',
    description: 'Indian payment gateway',
    features: ['UPI', 'Net Banking', 'Credit Cards', 'Digital Wallets'],
    status: 'inactive',
    transactionFee: '2%',
    setupFee: '$0',
    supportedCurrencies: ['INR', 'USD'],
    supportedCountries: ['IN']
  }
];

// Payment methods
const PAYMENT_METHODS = [
  { id: 'credit_card', name: 'Credit Card', icon: CreditCard, status: 'active' },
  { id: 'debit_card', name: 'Debit Card', icon: CreditCard, status: 'active' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: DollarSign, status: 'active' },
  { id: 'paypal', name: 'PayPal', icon: Globe, status: 'active' },
  { id: 'apple_pay', name: 'Apple Pay', icon: Smartphone, status: 'active' },
  { id: 'google_pay', name: 'Google Pay', icon: Smartphone, status: 'active' },
  { id: 'crypto', name: 'Cryptocurrency', icon: Zap, status: 'inactive' },
  { id: 'buy_now_pay_later', name: 'Buy Now Pay Later', icon: Clock, status: 'inactive' }
];

export default function PaymentGatewayIntegration({ 
  onGatewayUpdate,
  onPaymentMethodUpdate 
}) {
  const [activeTab, setActiveTab] = useState('gateways');
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Gateway configuration state
  const [gatewayConfig, setGatewayConfig] = useState({
    apiKey: '',
    secretKey: '',
    webhookUrl: '',
    testMode: true,
    autoCapture: true,
    currency: 'USD',
    supportedMethods: []
  });

  // Payment processing stats
  const [processingStats, setProcessingStats] = useState({
    totalTransactions: 1247,
    successfulTransactions: 1189,
    failedTransactions: 58,
    totalAmount: 125000,
    averageTransactionValue: 100.48,
    successRate: 95.3
  });

  // Recent transactions
  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 'txn_001',
      amount: 1250.00,
      currency: 'USD',
      status: 'completed',
      method: 'credit_card',
      gateway: 'stripe',
      customer: 'John Smith',
      date: '2024-01-15T10:30:00Z',
      fee: 36.25
    },
    {
      id: 'txn_002',
      amount: 850.00,
      currency: 'USD',
      status: 'pending',
      method: 'bank_transfer',
      gateway: 'paypal',
      customer: 'Sarah Johnson',
      date: '2024-01-15T09:15:00Z',
      fee: 24.65
    },
    {
      id: 'txn_003',
      amount: 2100.00,
      currency: 'USD',
      status: 'failed',
      method: 'credit_card',
      gateway: 'stripe',
      customer: 'Mike Wilson',
      date: '2024-01-15T08:45:00Z',
      fee: 0
    }
  ]);

  const handleGatewaySetup = async (gatewayId) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update gateway status
      const updatedGateways = PAYMENT_GATEWAYS.map(gateway => 
        gateway.id === gatewayId 
          ? { ...gateway, status: 'active' }
          : gateway
      );
      
      if (onGatewayUpdate) {
        onGatewayUpdate(updatedGateways);
      }
      
      setShowGatewayModal(false);
    } catch (error) {
      console.error('Failed to setup gateway:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status] || variants.inactive}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTransactionStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const GatewaysTab = () => (
    <div className="space-y-6">
      {/* Processing Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingStats.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Success rate: {processingStats.successRate}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(processingStats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(processingStats.averageTransactionValue)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{processingStats.successfulTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((processingStats.successfulTransactions / processingStats.totalTransactions) * 100).toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{processingStats.failedTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((processingStats.failedTransactions / processingStats.totalTransactions) * 100).toFixed(1)}% failure rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Gateways */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Gateways</span>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Gateway
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PAYMENT_GATEWAYS.map((gateway) => (
              <Card key={gateway.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{gateway.logo}</span>
                      <div>
                        <CardTitle className="text-lg">{gateway.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{gateway.description}</p>
                      </div>
                    </div>
                    {getStatusBadge(gateway.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Transaction Fee:</span>
                      <span className="font-medium">{gateway.transactionFee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Setup Fee:</span>
                      <span className="font-medium">{gateway.setupFee}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Supported Currencies:</p>
                    <div className="flex flex-wrap gap-1">
                      {gateway.supportedCurrencies.slice(0, 3).map(currency => (
                        <Badge key={currency} variant="outline" className="text-xs">
                          {currency}
                        </Badge>
                      ))}
                      {gateway.supportedCurrencies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{gateway.supportedCurrencies.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedGateway(gateway);
                        setShowGatewayModal(true);
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <Button 
                      variant={gateway.status === 'active' ? 'destructive' : 'default'} 
                      size="sm"
                      className="flex-1"
                    >
                      {gateway.status === 'active' ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const TransactionsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {transaction.method.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {transaction.gateway}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransactionStatusIcon(transaction.status)}
                      {getStatusBadge(transaction.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
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

  const SecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>PCI DSS Compliance</Label>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Compliant</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>SSL Encryption</Label>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-600" />
                <span className="text-sm">Enabled</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Fraud Detection</Label>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm">Active</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>3D Secure</Label>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Enabled</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>High-risk transaction detected:</strong> Transaction txn_003 failed due to suspected fraud. 
              Review and take appropriate action.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Gateway Integration</h2>
          <p className="text-muted-foreground">
            Manage payment gateways, process transactions, and monitor security
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gateways">
          <GatewaysTab />
        </TabsContent>
        
        <TabsContent value="transactions">
          <TransactionsTab />
        </TabsContent>
        
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>

      {/* Gateway Configuration Modal */}
      <Dialog open={showGatewayModal} onOpenChange={setShowGatewayModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure {selectedGateway?.name}</DialogTitle>
            <DialogDescription>
              Set up your {selectedGateway?.name} payment gateway integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input id="apiKey" placeholder="Enter API key" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key</Label>
                <Input id="secretKey" type="password" placeholder="Enter secret key" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input id="webhookUrl" placeholder="https://yourdomain.com/webhook" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Test Mode</Label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="testMode" defaultChecked />
                  <Label htmlFor="testMode">Enable test mode</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Auto Capture</Label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="autoCapture" defaultChecked />
                  <Label htmlFor="autoCapture">Auto-capture payments</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGatewayModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleGatewaySetup(selectedGateway?.id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 