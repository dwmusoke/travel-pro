import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Camera, 
  Upload, 
  DollarSign, 
  Receipt,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Plus,
  Trash2,
  Edit,
  Smartphone,
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  Image,
  FileText,
  Calendar,
  MapPin,
  Tag,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

// Expense categories
const EXPENSE_CATEGORIES = [
  { id: 'travel', name: 'Travel', icon: '✈️', color: 'bg-blue-100 text-blue-800' },
  { id: 'meals', name: 'Meals & Dining', icon: '🍽️', color: 'bg-green-100 text-green-800' },
  { id: 'transportation', name: 'Transportation', icon: '🚗', color: 'bg-purple-100 text-purple-800' },
  { id: 'accommodation', name: 'Accommodation', icon: '🏨', color: 'bg-orange-100 text-orange-800' },
  { id: 'office', name: 'Office Supplies', icon: '📁', color: 'bg-gray-100 text-gray-800' },
  { id: 'marketing', name: 'Marketing', icon: '📢', color: 'bg-pink-100 text-pink-800' },
  { id: 'utilities', name: 'Utilities', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'other', name: 'Other', icon: '📋', color: 'bg-slate-100 text-slate-800' }
];

// Mock expense data
const MOCK_EXPENSES = [
  {
    id: 'exp_001',
    amount: 125.50,
    currency: 'USD',
    category: 'meals',
    description: 'Client lunch meeting',
    date: '2024-01-15',
    location: 'Downtown Restaurant',
    receipt: 'receipt_001.jpg',
    status: 'approved',
    tags: ['client', 'business'],
    notes: 'Meeting with potential client'
  },
  {
    id: 'exp_002',
    amount: 45.00,
    currency: 'USD',
    category: 'transportation',
    description: 'Uber ride to airport',
    date: '2024-01-14',
    location: 'Airport',
    receipt: 'receipt_002.jpg',
    status: 'pending',
    tags: ['travel', 'transport'],
    notes: 'Business trip to conference'
  },
  {
    id: 'exp_003',
    amount: 89.99,
    currency: 'USD',
    category: 'office',
    description: 'Office supplies',
    date: '2024-01-13',
    location: 'Office Depot',
    receipt: 'receipt_003.jpg',
    status: 'rejected',
    tags: ['supplies'],
    notes: 'Printer paper and ink'
  }
];

export default function MobileExpenseTracker({ 
  onExpenseSubmit,
  onExpenseUpdate,
  onExpenseDelete 
}) {
  const [activeTab, setActiveTab] = useState('capture');
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Camera/upload state
  const [capturedImage, setCapturedImage] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const fileInputRef = useRef(null);

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    currency: 'USD',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    tags: [],
    notes: ''
  });

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || expense.status === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort expenses
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [expenses, searchTerm, filterCategory, filterStatus, sortBy, sortOrder]);

  const handleImageCapture = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        processOCR(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const processOCR = async (file) => {
    setIsProcessing(true);
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock OCR result
      setOcrResult({
        amount: '125.50',
        date: '2024-01-15',
        merchant: 'Downtown Restaurant',
        confidence: 0.95
      });
    } catch (error) {
      console.error('OCR processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExpenseSubmit = async () => {
    if (!expenseForm.amount || !expenseForm.category || !expenseForm.description) {
      alert('Please fill in all required fields');
      return;
    }

    const newExpense = {
      id: `exp_${Date.now()}`,
      ...expenseForm,
      receipt: capturedImage ? `receipt_${Date.now()}.jpg` : null,
      status: 'pending',
      tags: expenseForm.tags
    };

    setExpenses(prev => [newExpense, ...prev]);
    setShowCaptureModal(false);
    resetForm();

    if (onExpenseSubmit) {
      onExpenseSubmit(newExpense);
    }
  };

  const resetForm = () => {
    setExpenseForm({
      amount: '',
      currency: 'USD',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      tags: [],
      notes: ''
    });
    setCapturedImage(null);
    setOcrResult(null);
  };

  const getCategoryInfo = (categoryId) => {
    return EXPENSE_CATEGORIES.find(cat => cat.id === categoryId) || EXPENSE_CATEGORIES[7];
  };

  const getStatusBadge = (status) => {
    const variants = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status] || variants.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const CaptureTab = () => (
    <div className="space-y-6">
      {/* Camera/Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Capture Receipt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!capturedImage ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Take a photo or upload a receipt</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageCapture}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="Captured receipt" 
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setCapturedImage(null)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              {isProcessing && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Processing receipt...</p>
                </div>
              )}
              
              {ocrResult && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>OCR Results:</strong> Amount: {formatCurrency(ocrResult.amount)}, 
                    Date: {ocrResult.date}, Merchant: {ocrResult.merchant}
                    <br />
                    <span className="text-xs text-gray-600">
                      Confidence: {(ocrResult.confidence * 100).toFixed(1)}%
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Form */}
      {capturedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={expenseForm.currency} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter expense description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={expenseForm.location}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Reset
              </Button>
              <Button onClick={handleExpenseSubmit} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const ExpensesTab = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Expenses ({filteredExpenses.length})</span>
            <div className="flex items-center gap-2">
              {!isOnline && (
                <Badge variant="outline" className="text-orange-600">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              )}
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExpenses.map((expense) => {
              const category = getCategoryInfo(expense.category);
              return (
                <div key={expense.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${category.color}`}>
                        <span className="text-lg">{category.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{expense.description}</h4>
                          {getStatusBadge(expense.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{expense.location}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                          {expense.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {formatCurrency(expense.amount, expense.currency)}
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
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
          <h2 className="text-2xl font-bold">Mobile Expense Tracker</h2>
          <p className="text-muted-foreground">
            Capture receipts, track expenses, and manage reimbursements on the go
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCaptureModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Expense
          </Button>
          <Button>
            <Camera className="w-4 h-4 mr-2" />
            Capture
          </Button>
        </div>
      </div>

      {/* Online/Offline Status */}
      {!isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're currently offline. Expenses will be synced when you're back online.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="capture">Capture Receipt</TabsTrigger>
          <TabsTrigger value="expenses">My Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="capture">
          <CaptureTab />
        </TabsContent>
        
        <TabsContent value="expenses">
          <ExpensesTab />
        </TabsContent>
      </Tabs>

      {/* Capture Modal */}
      <Dialog open={showCaptureModal} onOpenChange={setShowCaptureModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Capture New Expense</DialogTitle>
            <DialogDescription>
              Take a photo or upload a receipt to create a new expense entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Choose how to capture your receipt</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCaptureModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 