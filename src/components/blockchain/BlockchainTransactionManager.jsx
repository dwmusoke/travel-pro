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
  Link, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Hash,
  Copy,
  Eye,
  Download,
  Upload,
  Settings,
  RefreshCw,
  Activity,
  TrendingUp,
  TrendingDown,
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
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye as EyeIcon,
  AlertCircle,
  CheckSquare,
  Square,
  ExternalLink
} from 'lucide-react';

export default function BlockchainTransactionManager({ 
  onTransactionComplete,
  onSmartContractDeploy 
}) {
  const [activeTab, setActiveTab] = useState('transactions');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [gasPrice, setGasPrice] = useState('medium');

  // Blockchain networks
  const [networks, setNetworks] = useState([
    {
      id: 'ethereum',
      name: 'Ethereum Mainnet',
      symbol: 'ETH',
      status: 'active',
      gasPrice: 25,
      transactionCount: 1250,
      totalValue: 2500000,
      smartContracts: 45
    },
    {
      id: 'polygon',
      name: 'Polygon Network',
      symbol: 'MATIC',
      status: 'active',
      gasPrice: 5,
      transactionCount: 890,
      totalValue: 1200000,
      smartContracts: 28
    },
    {
      id: 'binance',
      name: 'Binance Smart Chain',
      symbol: 'BNB',
      status: 'active',
      gasPrice: 8,
      transactionCount: 650,
      totalValue: 980000,
      smartContracts: 32
    }
  ]);

  // Smart contracts
  const [smartContracts, setSmartContracts] = useState([
    {
      id: 'sc_001',
      name: 'TravelPaymentContract',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      network: 'ethereum',
      type: 'payment',
      status: 'active',
      balance: 125000,
      transactions: 156,
      lastUsed: '2024-01-15T10:30:00Z',
      gasUsed: 45000
    },
    {
      id: 'sc_002',
      name: 'CommissionDistribution',
      address: '0x8f2a55949038a9610f50fb23b5883af3b90ec546',
      network: 'polygon',
      type: 'commission',
      status: 'active',
      balance: 89000,
      transactions: 89,
      lastUsed: '2024-01-15T09:15:00Z',
      gasUsed: 32000
    },
    {
      id: 'sc_003',
      name: 'EscrowService',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      network: 'binance',
      type: 'escrow',
      status: 'pending',
      balance: 0,
      transactions: 0,
      lastUsed: null,
      gasUsed: 0
    }
  ]);

  // Blockchain transactions
  const [transactions, setTransactions] = useState([
    {
      id: 'tx_001',
      hash: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      to: '0x8f2a55949038a9610f50fb23b5883af3b90ec546',
      amount: 2500,
      currency: 'ETH',
      network: 'ethereum',
      status: 'confirmed',
      gasUsed: 45000,
      gasPrice: 25,
      timestamp: '2024-01-15T10:30:00Z',
      blockNumber: 18543210,
      confirmations: 12
    },
    {
      id: 'tx_002',
      hash: '0x8f2a55949038a9610f50fb23b5883af3b90ec546',
      from: '0x8f2a55949038a9610f50fb23b5883af3b90ec546',
      to: '0x1234567890abcdef1234567890abcdef12345678',
      amount: 1250,
      currency: 'MATIC',
      network: 'polygon',
      status: 'pending',
      gasUsed: 32000,
      gasPrice: 5,
      timestamp: '2024-01-15T09:15:00Z',
      blockNumber: 45678901,
      confirmations: 2
    },
    {
      id: 'tx_003',
      hash: '0x1234567890abcdef1234567890abcdef12345678',
      from: '0x1234567890abcdef1234567890abcdef12345678',
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      amount: 890,
      currency: 'BNB',
      network: 'binance',
      status: 'failed',
      gasUsed: 28000,
      gasPrice: 8,
      timestamp: '2024-01-15T08:45:00Z',
      blockNumber: 34567890,
      confirmations: 0
    }
  ]);

  // Wallet information
  const [wallets, setWallets] = useState([
    {
      id: 'wallet_001',
      name: 'TravelPro Main Wallet',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      network: 'ethereum',
      balance: 125000,
      currency: 'ETH',
      status: 'active',
      lastSync: '2024-01-15T10:30:00Z'
    },
    {
      id: 'wallet_002',
      name: 'Commission Wallet',
      address: '0x8f2a55949038a9610f50fb23b5883af3b90ec546',
      network: 'polygon',
      balance: 89000,
      currency: 'MATIC',
      status: 'active',
      lastSync: '2024-01-15T09:15:00Z'
    }
  ]);

  const deploySmartContract = async (contractData) => {
    setIsProcessing(true);
    try {
      // Simulate blockchain deployment
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const newContract = {
        id: `sc_${Date.now()}`,
        name: contractData.name,
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        network: contractData.network,
        type: contractData.type,
        status: 'active',
        balance: 0,
        transactions: 0,
        lastUsed: new Date().toISOString(),
        gasUsed: 0
      };
      
      setSmartContracts(prev => [...prev, newContract]);
      
      if (onSmartContractDeploy) {
        onSmartContractDeploy(newContract);
      }
    } catch (error) {
      console.error('Smart contract deployment failed:', error);
    } finally {
      setIsProcessing(false);
      setShowDeployModal(false);
    }
  };

  const sendTransaction = async (transactionData) => {
    setIsProcessing(true);
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newTransaction = {
        id: `tx_${Date.now()}`,
        hash: `0x${Math.random().toString(16).substr(2, 40)}`,
        from: transactionData.from,
        to: transactionData.to,
        amount: transactionData.amount,
        currency: transactionData.currency,
        network: transactionData.network,
        status: 'pending',
        gasUsed: Math.floor(Math.random() * 50000) + 20000,
        gasPrice: transactionData.gasPrice,
        timestamp: new Date().toISOString(),
        blockNumber: Math.floor(Math.random() * 100000000),
        confirmations: 0
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      if (onTransactionComplete) {
        onTransactionComplete(newTransaction);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setIsProcessing(false);
      setShowTransactionModal(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const variants = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status] || variants.inactive}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const TransactionsTab = () => (
    <div className="space-y-6">
      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all networks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(transactions.reduce((sum, tx) => sum + tx.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Transferred value
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gas Used</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.reduce((sum, tx) => sum + tx.gasUsed, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total gas consumed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((transactions.filter(tx => tx.status === 'confirmed').length / transactions.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Confirmed transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Blockchain Transactions</span>
            <Button onClick={() => setShowTransactionModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Transaction
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hash</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{shortenAddress(transaction.hash)}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transaction.hash)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{shortenAddress(transaction.from)}</TableCell>
                  <TableCell className="font-mono text-sm">{shortenAddress(transaction.to)}</TableCell>
                  <TableCell>
                    <div className="font-bold">{formatCurrency(transaction.amount, transaction.currency)}</div>
                    <div className="text-xs text-gray-600">Gas: {transaction.gasUsed.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.network.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(transaction.status)}
                      {transaction.status === 'pending' && (
                        <div className="text-xs text-gray-600">
                          {transaction.confirmations} confirmations
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
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

  const SmartContractsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Smart Contracts</span>
            <Button onClick={() => setShowDeployModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Deploy Contract
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {smartContracts.map((contract) => (
              <Card key={contract.id} className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{contract.name}</span>
                    {getStatusBadge(contract.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-600">Contract Address</Label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{shortenAddress(contract.address)}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(contract.address)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Network</Label>
                        <div className="font-medium">{contract.network.toUpperCase()}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Type</Label>
                        <div className="font-medium capitalize">{contract.type}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Balance</Label>
                        <div className="font-bold">{formatCurrency(contract.balance)}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Transactions</Label>
                        <div className="font-medium">{contract.transactions}</div>
                      </div>
                    </div>
                    
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

  const NetworksTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {networks.map((network) => (
          <Card key={network.id} className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{network.name}</span>
                {getStatusBadge(network.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Symbol</Label>
                    <div className="font-bold">{network.symbol}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Gas Price</Label>
                    <div className="font-medium">{network.gasPrice} Gwei</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Transactions</span>
                    <span className="font-medium">{network.transactionCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Value</span>
                    <span className="font-medium">{formatCurrency(network.totalValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Smart Contracts</span>
                    <span className="font-medium">{network.smartContracts}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Activity className="w-4 h-4 mr-2" />
                    Monitor
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
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blockchain Transaction Manager</h2>
          <p className="text-muted-foreground">
            Secure, transparent blockchain transactions with smart contracts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
          <TabsTrigger value="networks">Networks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <TransactionsTab />
        </TabsContent>
        
        <TabsContent value="contracts">
          <SmartContractsTab />
        </TabsContent>
        
        <TabsContent value="networks">
          <NetworksTab />
        </TabsContent>
      </Tabs>

      {/* Deploy Smart Contract Modal */}
      <Dialog open={showDeployModal} onOpenChange={setShowDeployModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deploy Smart Contract</DialogTitle>
            <DialogDescription>
              Deploy a new smart contract to the blockchain
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contractName">Contract Name</Label>
              <Input id="contractName" placeholder="Enter contract name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contractType">Contract Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment Contract</SelectItem>
                  <SelectItem value="commission">Commission Distribution</SelectItem>
                  <SelectItem value="escrow">Escrow Service</SelectItem>
                  <SelectItem value="loyalty">Loyalty Program</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="network">Blockchain Network</Label>
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                  <SelectItem value="polygon">Polygon Network</SelectItem>
                  <SelectItem value="binance">Binance Smart Chain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gasPrice">Gas Price</Label>
              <Select value={gasPrice} onValueChange={setGasPrice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Slow)</SelectItem>
                  <SelectItem value="medium">Medium (Standard)</SelectItem>
                  <SelectItem value="high">High (Fast)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeployModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => deploySmartContract({
                name: 'NewContract',
                type: 'payment',
                network: selectedNetwork,
                gasPrice: gasPrice
              })}
              disabled={isProcessing}
            >
              {isProcessing ? 'Deploying...' : 'Deploy Contract'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Transaction Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Transaction</DialogTitle>
            <DialogDescription>
              Send a new blockchain transaction
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fromAddress">From Address</Label>
              <Input id="fromAddress" placeholder="Enter sender address" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toAddress">To Address</Label>
              <Input id="toAddress" placeholder="Enter recipient address" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="0.00" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="MATIC">MATIC</SelectItem>
                    <SelectItem value="BNB">BNB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                  <SelectItem value="polygon">Polygon Network</SelectItem>
                  <SelectItem value="binance">Binance Smart Chain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransactionModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => sendTransaction({
                from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                to: '0x8f2a55949038a9610f50fb23b5883af3b90ec546',
                amount: 1000,
                currency: 'ETH',
                network: 'ethereum',
                gasPrice: 25
              })}
              disabled={isProcessing}
            >
              {isProcessing ? 'Sending...' : 'Send Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 