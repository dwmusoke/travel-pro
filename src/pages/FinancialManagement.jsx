
import React, { useState, useEffect, useMemo } from "react";
import { Transaction, Bill, Vendor, Payment, Invoice, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Import new components
import MultiCurrencyManager from "@/components/financial/MultiCurrencyManager";
import AdvancedReportingDashboard from "@/components/financial/AdvancedReportingDashboard";
import PaymentGatewayIntegration from "@/components/financial/PaymentGatewayIntegration";
import MobileExpenseTracker from "@/components/financial/MobileExpenseTracker";

// Import Phase 2 components
import AICashFlowForecaster from "@/components/financial/AICashFlowForecaster";
import AutomatedReconciliation from "@/components/financial/AutomatedReconciliation";
import AdvancedSecurityManager from "@/components/security/AdvancedSecurityManager";
import SupplierManagement from "@/components/financial/SupplierManagement";

// Import Phase 3 components
import BlockchainTransactionManager from "@/components/blockchain/BlockchainTransactionManager";
import AdvancedAIAnalytics from "@/components/ai/AdvancedAIAnalytics";
import IoTDataManager from "@/components/iot/IoTDataManager";
import VoiceCommandInterface from "@/components/voice/VoiceCommandInterface";
import { 
  DollarSign, 
  Plus, 
  Upload, 
  FileText, 
  CreditCard,
  TrendingUp,
  TrendingDown,
  Receipt,
  Building,
  Calendar,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  Calculator,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  X,
  Save,
  Copy,
  ExternalLink,
  Mail,
  MessageSquare,
  CalendarDays,
  MapPin,
  Globe,
  CreditCard as CreditCardIcon,
  History,
  Activity as ActivityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  DollarSign as DollarSignIcon,
  Building as BuildingIcon,
  FileText as FileTextIcon,
  Receipt as ReceiptIcon,
  Clock as ClockIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  Eye as EyeIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Plus as PlusIcon,
  Calendar as CalendarIcon,
  CreditCard as CreditCardIcon2,
  Building as BuildingIcon2,
  FileText as FileTextIcon2,
  Receipt as ReceiptIcon2,
  Clock as ClockIcon2,
  AlertTriangle as AlertTriangleIcon2,
  CheckCircle as CheckCircleIcon2,
  Eye as EyeIcon2,
  Edit as EditIcon2,
  Trash2 as Trash2Icon2,
  Download as DownloadIcon2,
  Upload as UploadIcon2,
  Search as SearchIcon2,
  Filter as FilterIcon2,
  Plus as PlusIcon2,
  Calendar as CalendarIcon2
} from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { format, subDays, startOfMonth, endOfMonth, differenceInDays } from "date-fns";

export default function FinancialManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Enhanced modal state management
  const [activeModal, setActiveModal] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showCashFlowModal, setShowCashFlowModal] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // cards or table

  const [transactionForm, setTransactionForm] = useState({
    type: "expense",
    category: "office_expenses",
    description: "",
    amount: "",
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: "bank_transfer",
    reference_number: "",
    vendor_id: "",
    notes: "",
    receipt_file: null
  });

  const [billForm, setBillForm] = useState({
    vendor_name: "",
    vendor_email: "",
    bill_date: new Date().toISOString().split('T')[0],
    due_date: "",
    category: "office_expenses",
    description: "",
    amount: "",
    currency: "USD",
    payment_terms: "Net 30",
    receipt_file: null,
    notes: ""
  });

  const [vendorForm, setVendorForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    vendor_type: "service_provider",
    payment_terms: "Net 30",
    tax_id: "",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      if (user && user.agency_id) {
        const [transactionList, billList, vendorList, paymentList, invoiceList] = await Promise.all([
          Transaction.filter({ agency_id: user.agency_id }, '-transaction_date', 100),
          Bill.filter({ agency_id: user.agency_id }, '-created_date', 50),
          Vendor.filter({ agency_id: user.agency_id }, '-created_date', 50),
          Payment.filter({ agency_id: user.agency_id }, '-payment_date', 100),
          Invoice.filter({ agency_id: user.agency_id }, '-created_date', 100)
        ]);

        setTransactions(transactionList);
        setBills(billList);
        setVendors(vendorList);
        setPayments(paymentList);
        setInvoices(invoiceList);
      } else {
        console.warn("User has no agency assigned or user data not found.");
        setTransactions([]);
        setBills([]);
        setVendors([]);
        setPayments([]);
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error loading financial data:", error);
    }
    setLoading(false);
  };

  const handleFileUpload = async (file) => {
    try {
      const { file_url } = await UploadFile({ file });
      return file_url;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      let receipt_url = null;
      if (transactionForm.receipt_file) {
        receipt_url = await handleFileUpload(transactionForm.receipt_file);
      }

      const transactionData = {
        ...transactionForm,
        amount: parseFloat(transactionForm.amount),
        receipt_url,
        status: "completed"
      };

      if (editingItem && editingItem.type === 'transaction') {
        await Transaction.update(editingItem.id, transactionData);
      } else {
        await Transaction.create(transactionData);
      }

      await loadData();
      setActiveModal(null); // Close modal
      setEditingItem(null);
      resetTransactionForm();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleBillSubmit = async (e) => {
    e.preventDefault();
    try {
      let receipt_url = null;
      if (billForm.receipt_file) {
        receipt_url = await handleFileUpload(billForm.receipt_file);
      }

      const billData = {
        bill_number: `BILL-${Date.now()}`,
        vendor_name: billForm.vendor_name,
        vendor_email: billForm.vendor_email,
        bill_date: billForm.bill_date,
        due_date: billForm.due_date,
        category: billForm.category,
        items: [{
          description: billForm.description,
          quantity: 1,
          unit_price: parseFloat(billForm.amount),
          total: parseFloat(billForm.amount)
        }],
        subtotal: parseFloat(billForm.amount),
        total_amount: parseFloat(billForm.amount),
        balance_due: parseFloat(billForm.amount),
        currency: billForm.currency,
        payment_terms: billForm.payment_terms,
        receipt_url,
        notes: billForm.notes,
        status: "pending"
      };

      if (editingItem && editingItem.type === 'bill') {
        await Bill.update(editingItem.id, billData);
      } else {
        await Bill.create(billData);
      }

      await loadData();
      setActiveModal(null); // Close modal
      setEditingItem(null);
      resetBillForm();
    } catch (error) {
      console.error("Error saving bill:", error);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem && editingItem.type === 'vendor') {
        await Vendor.update(editingItem.id, vendorForm);
      } else {
        await Vendor.create(vendorForm);
      }

      await loadData();
      setActiveModal(null); // Close modal
      setEditingItem(null);
      resetVendorForm();
    } catch (error) {
      console.error("Error saving vendor:", error);
    }
  };

  const resetTransactionForm = () => {
    setTransactionForm({
      type: "expense",
      category: "office_expenses",
      description: "",
      amount: "",
      transaction_date: new Date().toISOString().split('T')[0],
      payment_method: "bank_transfer",
      reference_number: "",
      vendor_id: "",
      notes: "",
      receipt_file: null
    });
  };

  const resetBillForm = () => {
    setBillForm({
      vendor_name: "",
      vendor_email: "",
      bill_date: new Date().toISOString().split('T')[0],
      due_date: "",
      category: "office_expenses",
      description: "",
      amount: "",
      currency: "USD",
      payment_terms: "Net 30",
      receipt_file: null,
      notes: ""
    });
  };

  const resetVendorForm = () => {
    setVendorForm({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      vendor_type: "service_provider",
      payment_terms: "Net 30",
      tax_id: "",
      notes: ""
    });
  };

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    if (type === 'transaction') {
      setTransactionForm({
        ...item,
        amount: String(item.amount), // Ensure amount is string for input
        transaction_date: item.transaction_date.split('T')[0],
        receipt_file: null
      });
      setActiveModal('transaction');
    } else if (type === 'bill') {
      setBillForm({
        vendor_name: item.vendor_name,
        vendor_email: item.vendor_email,
        bill_date: item.bill_date.split('T')[0],
        due_date: item.due_date.split('T')[0],
        category: item.category,
        description: item.items?.[0]?.description || "",
        amount: String(item.total_amount || item.balance_due || ""), // Ensure amount is string
        currency: item.currency,
        payment_terms: item.payment_terms,
        receipt_file: null,
        notes: item.notes || ""
      });
      setActiveModal('bill');
    } else if (type === 'vendor') {
      setVendorForm(item);
      setActiveModal('vendor');
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (type === 'transaction') {
          await Transaction.delete(id);
        } else if (type === 'bill') {
          await Bill.delete(id);
        } else if (type === 'vendor') {
          await Vendor.delete(id);
        }
        await loadData();
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return `${currency} ${amount?.toFixed(2) || '0.00'}`;
  };

  // Enhanced financial calculations with advanced analytics
  const totalIncome = useMemo(() => 
    transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0), 
    [transactions]
  );

  const totalExpenses = useMemo(() => 
    transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0), 
    [transactions]
  );

  const pendingBillsArray = useMemo(() => 
    bills.filter(b => b.status === 'pending' || b.status === 'approved'), 
    [bills]
  );

  const totalPendingBillsAmount = useMemo(() => 
    pendingBillsArray.reduce((sum, b) => sum + (b.balance_due || b.total_amount || 0), 0), 
    [pendingBillsArray]
  );

  const overdueBills = useMemo(() => 
    bills.filter(b => 
      b.status !== 'paid' && b.status !== 'cancelled' && new Date(b.due_date) < new Date()
    ), 
    [bills]
  );

  // Advanced analytics calculations
  const monthlyIncome = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions
      .filter(t => t.type === 'income' && new Date(t.transaction_date).getMonth() === currentMonth && new Date(t.transaction_date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [transactions]);

  const monthlyExpenses = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions
      .filter(t => t.type === 'expense' && new Date(t.transaction_date).getMonth() === currentMonth && new Date(t.transaction_date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [transactions]);

  const totalOutstandingInvoices = useMemo(() => 
    invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.balance_due || i.total_amount || 0), 0), 
    [invoices]
  );

  const cashFlow = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    
    const recentIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.transaction_date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const recentExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.transaction_date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    return recentIncome - recentExpenses;
  }, [transactions]);

  // Enhanced stats object with advanced metrics
  const stats = {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    pendingBills: totalPendingBillsAmount,
    monthlyIncome,
    monthlyExpenses,
    monthlyProfit: monthlyIncome - monthlyExpenses,
    totalOutstandingInvoices,
    cashFlow,
    overdueBillsCount: overdueBills.length,
    overdueBillsAmount: overdueBills.reduce((sum, b) => sum + (b.balance_due || b.total_amount || 0), 0),
    totalVendors: vendors.length,
    totalTransactions: transactions.length,
    totalBills: bills.length,
    totalInvoices: invoices.length
  };

  return (
    <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Financial Management</h1>
            <p className="text-amber-800/80">Comprehensive financial tracking, expense management, vendor relationships, and advanced analytics.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={() => setShowQuickAdd(true)} className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Quick Entry
            </Button>
            <Button variant="outline" onClick={() => setShowAnalyticsModal(true)} className="bg-blue-100/50 backdrop-blur-sm text-blue-900 border-blue-300/50 hover:bg-blue-100/70 rounded-xl shadow-sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" onClick={() => setShowCashFlowModal(true)} className="bg-green-100/50 backdrop-blur-sm text-green-900 border-green-300/50 hover:bg-green-100/70 rounded-xl shadow-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Cash Flow
            </Button>
            <Button onClick={() => setActiveModal('transaction')} className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
              <DollarSign className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Enhanced Financial Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-green-50/50 backdrop-blur-md border border-green-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700/80">Total Income</p>
                  <p className="text-2xl font-bold text-green-700">${stats.totalIncome.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  <p className="text-xs text-green-600">This month: ${stats.monthlyIncome.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50/50 backdrop-blur-md border border-red-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700/80">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-700">${stats.totalExpenses.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  <p className="text-xs text-red-600">This month: ${stats.monthlyExpenses.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50/50 backdrop-blur-md border border-blue-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700/80">Net Profit</p>
                  <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ${Math.abs(stats.netProfit).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                  <p className={`text-xs ${stats.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    This month: ${Math.abs(stats.monthlyProfit).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
                <Calculator className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50/50 backdrop-blur-md border border-purple-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700/80">Cash Flow (30d)</p>
                  <p className={`text-2xl font-bold ${stats.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ${Math.abs(stats.cashFlow).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                  <p className="text-xs text-purple-600">{stats.cashFlow >= 0 ? 'Positive' : 'Negative'} flow</p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics Row */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-orange-50/50 backdrop-blur-md border border-orange-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700/80">Pending Bills</p>
                  <p className="text-2xl font-bold text-orange-700">${stats.pendingBills.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  <p className="text-xs text-orange-600">{pendingBillsArray.length} bills pending</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700/80">Outstanding Invoices</p>
                  <p className="text-2xl font-bold text-amber-700">${stats.totalOutstandingInvoices.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  <p className="text-xs text-amber-600">{invoices.filter(i => i.status !== 'paid').length} invoices</p>
                </div>
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50/50 backdrop-blur-md border border-red-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700/80">Overdue Bills</p>
                  <p className="text-2xl font-bold text-red-700">${stats.overdueBillsAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  <p className="text-xs text-red-600">{stats.overdueBillsCount} bills overdue</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-indigo-50/50 backdrop-blur-md border border-indigo-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-700/80">Total Vendors</p>
                  <p className="text-2xl font-bold text-indigo-700">{stats.totalVendors}</p>
                  <p className="text-xs text-indigo-600">Active relationships</p>
                </div>
                <Building className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Bills Alert */}
        {overdueBills.length > 0 && (
          <Card className="mb-8 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-8 h-8 text-red-700" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-800 text-lg">
                    {overdueBills.length} Overdue Bills Require Attention
                  </h3>
                  <p className="text-red-700/90">
                    Total overdue: {formatCurrency(overdueBills.reduce((sum, b) => sum + (b.balance_due || b.total_amount || 0), 0))}
                  </p>
                </div>
                <Button className="bg-red-700 text-white hover:bg-red-800 rounded-xl shadow-lg" onClick={() => setActiveTab("bills")}>
                  Review Bills
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-16 bg-amber-200/50 backdrop-blur-sm border border-amber-300/50 rounded-xl text-amber-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Transactions ({transactions.length})</TabsTrigger>
          <TabsTrigger value="bills" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Bills ({bills.length})</TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="vendors" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Vendors ({vendors.length})</TabsTrigger>
          <TabsTrigger value="currency" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Multi-Currency</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Payments</TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Expenses</TabsTrigger>
          <TabsTrigger value="forecasting" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">AI Forecasting</TabsTrigger>
          <TabsTrigger value="reconciliation" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Reconciliation</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Security</TabsTrigger>
          <TabsTrigger value="suppliers" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Suppliers</TabsTrigger>
          <TabsTrigger value="blockchain" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Blockchain</TabsTrigger>
          <TabsTrigger value="ai-analytics" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">AI Analytics</TabsTrigger>
          <TabsTrigger value="iot" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">IoT Data</TabsTrigger>
          <TabsTrigger value="voice" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Voice Commands</TabsTrigger>
        </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Advanced Reporting Dashboard */}
            <AdvancedReportingDashboard 
              financialData={{
                revenue: stats.totalIncome,
                profit: stats.netProfit,
                cashflow: stats.cashFlow,
                expenses: stats.totalExpenses
              }}
              onDateRangeChange={(range) => console.log('Date range changed:', range)}
              onExportReport={(type) => console.log('Export report:', type)}
            />
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <Receipt className="w-5 h-5 text-amber-800" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-amber-100/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-amber-900">{transaction.description}</p>
                          <p className="text-sm text-amber-800/80">
                            {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${transaction.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Bills */}
              <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <FileText className="w-5 h-5 text-amber-800" />
                    Bills Requiring Action
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingBillsArray.slice(0, 5).map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between p-3 bg-amber-100/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-amber-900">{bill.vendor_name}</p>
                          <p className="text-sm text-amber-800/80">
                            Due: {format(new Date(bill.due_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-900">{formatCurrency(bill.balance_due || bill.total_amount, bill.currency)}</p>
                          <Badge className={getStatusColor(bill.status)}>
                            {bill.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transaction Tab Content */}
          <TabsContent value="transactions">
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader className="flex flex-row justify-between items-center flex-wrap gap-4">
                <CardTitle className="text-amber-900">Transaction History</CardTitle>
                <div className="flex gap-4">
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="max-w-xs bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl text-amber-900">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-amber-200/50 rounded-xl bg-amber-50/50 backdrop-blur-md shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-green-100/70' : 'bg-red-100/70'
                          }`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className={`w-5 h-5 ${transaction.type === 'income' ? 'text-green-700' : 'text-red-700'}`} />
                            ) : (
                              <TrendingDown className={`w-5 h-5 ${transaction.type === 'income' ? 'text-green-700' : 'text-red-700'}`} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-amber-900">{transaction.description}</p>
                            <p className="text-sm text-amber-800/80">
                              {transaction.category.replace('_', ' ')} • {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                            </p>
                            {transaction.reference_number && (
                              <p className="text-xs text-amber-700/80">Ref: {transaction.reference_number}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          {transaction.receipt_url && (
                            <Button size="sm" variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm" onClick={() => window.open(transaction.receipt_url, '_blank')}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm" onClick={() => handleEdit(transaction, 'transaction')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm" onClick={() => handleDelete(transaction.id, 'transaction')}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bills Tab Content */}
          <TabsContent value="bills">
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-900">Bill Management</CardTitle>
                <Button onClick={() => setActiveModal('bill')} className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
                  <FileText className="w-4 h-4 mr-2" />
                  Add Bill
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 border border-amber-200/50 rounded-xl bg-amber-50/50 backdrop-blur-md shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-orange-100/70 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-orange-700" />
                          </div>
                          <div>
                            <p className="font-medium text-amber-900">{bill.vendor_name}</p>
                            <p className="text-sm text-amber-800/80">
                              {bill.category.replace('_', ' ')} • Due: {format(new Date(bill.due_date), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-xs text-amber-700/80">Bill #{bill.bill_number}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-amber-900">
                            {formatCurrency(bill.balance_due || bill.total_amount, bill.currency)}
                          </p>
                          <Badge className={getStatusColor(bill.status)}>
                            {bill.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          {bill.receipt_url && (
                            <Button size="sm" variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm" onClick={() => window.open(bill.receipt_url, '_blank')}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm" onClick={() => handleEdit(bill, 'bill')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm" onClick={() => handleDelete(bill.id, 'bill')}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendors Tab Content */}
          <TabsContent value="vendors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-amber-900">Vendor Management</h3>
              <Button onClick={() => setActiveModal('vendor')} className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <Card key={vendor.id} className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-900 mb-1">{vendor.name}</h4>
                        <p className="text-sm text-amber-800/80">{vendor.vendor_type.replace('_', ' ')}</p>
                        <p className="text-sm text-amber-800/80">{vendor.email}</p>
                        {vendor.phone && <p className="text-sm text-amber-800/80">{vendor.phone}</p>}
                      </div>
                      <Badge className={getStatusColor(vendor.status)}>
                        {vendor.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-800/80">Total Paid:</span>
                        <span className="font-medium text-amber-900">{formatCurrency(vendor.total_paid)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-800/80">Outstanding:</span>
                        <span className="font-medium text-orange-700">{formatCurrency(vendor.outstanding_balance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-800/80">Terms:</span>
                        <span className="font-medium text-amber-900">{vendor.payment_terms}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm" onClick={() => handleEdit(vendor, 'vendor')}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm" onClick={() => handleDelete(vendor.id, 'vendor')}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Invoices Tab Content */}
          <TabsContent value="invoices">
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-900">Invoice Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-amber-200/50 rounded-xl bg-amber-50/50 backdrop-blur-md shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100/70 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-700" />
                          </div>
                          <div>
                            <p className="font-medium text-amber-900">{invoice.invoice_number}</p>
                            <p className="text-sm text-amber-800/80">
                              {invoice.client_name} • Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-xs text-amber-700/80">Client: {invoice.client_name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-amber-900">
                            {formatCurrency(invoice.balance_due || invoice.total_amount, invoice.currency)}
                          </p>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Reports Tab Content */}
          <TabsContent value="reports">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-amber-900">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-100/50 rounded-lg">
                      <p className="text-sm text-green-700">Total Revenue</p>
                      <p className="text-xl font-bold text-green-900">${stats.totalIncome.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-red-100/50 rounded-lg">
                      <p className="text-sm text-red-700">Total Expenses</p>
                      <p className="text-xl font-bold text-red-900">${stats.totalExpenses.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-blue-100/50 rounded-lg">
                      <p className="text-sm text-blue-700">Net Profit</p>
                      <p className={`text-xl font-bold ${stats.netProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                        ${Math.abs(stats.netProfit).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-100/50 rounded-lg">
                      <p className="text-sm text-purple-700">Cash Flow</p>
                      <p className={`text-xl font-bold ${stats.cashFlow >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                        ${Math.abs(stats.cashFlow).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-amber-900">Outstanding Balances</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-orange-100/50 rounded-lg">
                      <span className="text-orange-700">Pending Bills</span>
                      <span className="font-bold text-orange-900">${stats.pendingBills.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-100/50 rounded-lg">
                      <span className="text-amber-700">Outstanding Invoices</span>
                      <span className="font-bold text-amber-900">${stats.totalOutstandingInvoices.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-100/50 rounded-lg">
                      <span className="text-red-700">Overdue Bills</span>
                      <span className="font-bold text-red-900">${stats.overdueBillsAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Multi-Currency Tab Content */}
          <TabsContent value="currency">
            <MultiCurrencyManager 
              baseCurrency="USD"
              onCurrencyChange={(currency) => console.log('Currency changed:', currency)}
              onExchangeRateUpdate={(rates) => console.log('Exchange rates updated:', rates)}
            />
          </TabsContent>

          {/* Payment Gateway Integration Tab Content */}
          <TabsContent value="payments">
            <PaymentGatewayIntegration 
              onGatewayUpdate={(gateways) => console.log('Gateways updated:', gateways)}
              onPaymentMethodUpdate={(methods) => console.log('Payment methods updated:', methods)}
            />
          </TabsContent>

          {/* Mobile Expense Tracker Tab Content */}
          <TabsContent value="expenses">
            <MobileExpenseTracker 
              onExpenseSubmit={(expense) => console.log('Expense submitted:', expense)}
              onExpenseUpdate={(expense) => console.log('Expense updated:', expense)}
              onExpenseDelete={(expenseId) => console.log('Expense deleted:', expenseId)}
            />
          </TabsContent>

          {/* AI Cash Flow Forecasting Tab Content */}
          <TabsContent value="forecasting">
            <AICashFlowForecaster 
              historicalData={{
                revenue: stats.totalIncome,
                expenses: stats.totalExpenses,
                cashFlow: stats.cashFlow
              }}
              onForecastUpdate={(forecasts) => console.log('Forecasts updated:', forecasts)}
              onScenarioAnalysis={(scenarios) => console.log('Scenario analysis:', scenarios)}
            />
          </TabsContent>

          {/* Automated Reconciliation Tab Content */}
          <TabsContent value="reconciliation">
            <AutomatedReconciliation 
              onReconciliationComplete={(type, data) => console.log('Reconciliation complete:', type, data)}
              onDiscrepancyFound={(discrepancy) => console.log('Discrepancy found:', discrepancy)}
            />
          </TabsContent>

          {/* Advanced Security Management Tab Content */}
          <TabsContent value="security">
            <AdvancedSecurityManager 
              onSecurityUpdate={(settings) => console.log('Security settings updated:', settings)}
              onUserAccessChange={(userId, changes) => console.log('User access changed:', userId, changes)}
            />
          </TabsContent>

          {/* Supplier Management Tab Content */}
          <TabsContent value="suppliers">
            <SupplierManagement 
              onSupplierUpdate={(supplier) => console.log('Supplier updated:', supplier)}
              onPaymentProcessed={(payment) => console.log('Payment processed:', payment)}
            />
          </TabsContent>

          {/* Blockchain Transaction Manager Tab Content */}
          <TabsContent value="blockchain">
            <BlockchainTransactionManager 
              onTransactionComplete={(transaction) => console.log('Transaction completed:', transaction)}
              onSmartContractDeploy={(contract) => console.log('Smart contract deployed:', contract)}
            />
          </TabsContent>

          {/* Advanced AI Analytics Tab Content */}
          <TabsContent value="ai-analytics">
            <AdvancedAIAnalytics 
              onInsightGenerated={(insight) => console.log('Insight generated:', insight)}
              onModelTrained={(model) => console.log('Model trained:', model)}
            />
          </TabsContent>

          {/* IoT Data Manager Tab Content */}
          <TabsContent value="iot">
            <IoTDataManager 
              onDeviceConnected={(device) => console.log('Device connected:', device)}
              onDataReceived={(data) => console.log('Data received:', data)}
            />
          </TabsContent>

          {/* Voice Command Interface Tab Content */}
          <TabsContent value="voice">
            <VoiceCommandInterface 
              onCommandExecuted={(command) => console.log('Command executed:', command)}
              onVoiceInput={(input) => console.log('Voice input:', input)}
            />
          </TabsContent>
        </Tabs>

        {/* Transaction Form Modal */}
        {activeModal === 'transaction' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  {editingItem ? 'Edit Transaction' : 'Add New Transaction'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTransactionSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-amber-800">Transaction Type</Label>
                      <Select
                        value={transactionForm.type}
                        onValueChange={(value) => setTransactionForm({...transactionForm, type: value})}
                      >
                        <SelectTrigger className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl text-amber-900">
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-amber-800">Category</Label>
                      <Select
                        value={transactionForm.category}
                        onValueChange={(value) => setTransactionForm({...transactionForm, category: value})}
                      >
                        <SelectTrigger className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl text-amber-900">
                          <SelectItem value="ticket_sale">Ticket Sale</SelectItem>
                          <SelectItem value="service_fee">Service Fee</SelectItem>
                          <SelectItem value="commission">Commission</SelectItem>
                          <SelectItem value="office_rent">Office Rent</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="staff_salary">Staff Salary</SelectItem>
                          <SelectItem value="vendor_payment">Vendor Payment</SelectItem>
                          <SelectItem value="bsp_settlement">BSP Settlement</SelectItem>
                          <SelectItem value="refund">Refund</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-amber-800">Description</Label>
                    <Input
                      id="description"
                      value={transactionForm.description}
                      onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                      required
                      className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-amber-800">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={transactionForm.amount}
                        onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                        required
                        className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="transaction_date" className="text-amber-800">Transaction Date</Label>
                      <Input
                        id="transaction_date"
                        type="date"
                        value={transactionForm.transaction_date}
                        onChange={(e) => setTransactionForm({...transactionForm, transaction_date: e.target.value})}
                        required
                        className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_method" className="text-amber-800">Payment Method</Label>
                      <Select
                        value={transactionForm.payment_method}
                        onValueChange={(value) => setTransactionForm({...transactionForm, payment_method: value})}
                      >
                        <SelectTrigger className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl text-amber-900">
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="debit_card">Debit Card</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                          <SelectItem value="bsp_settlement">BSP Settlement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reference_number" className="text-amber-800">Reference Number</Label>
                      <Input
                        id="reference_number"
                        value={transactionForm.reference_number}
                        onChange={(e) => setTransactionForm({...transactionForm, reference_number: e.target.value})}
                        className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receipt_file" className="text-amber-800">Receipt/Document</Label>
                    <Input
                      id="receipt_file"
                      type="file"
                      onChange={(e) => setTransactionForm({...transactionForm, receipt_file: e.target.files[0]})}
                      accept="image/*,application/pdf"
                      className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl file:bg-amber-200/70 file:text-amber-900 file:border-amber-300/50 file:rounded-xl file:px-3 file:py-1 file:hover:bg-amber-300/70"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-amber-800">Notes</Label>
                    <Textarea
                      id="notes"
                      value={transactionForm.notes}
                      onChange={(e) => setTransactionForm({...transactionForm, notes: e.target.value})}
                      placeholder="Additional notes or comments..."
                      className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setActiveModal(null);
                        setEditingItem(null);
                        resetTransactionForm();
                      }}
                      className="flex-1 bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg"
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      {editingItem ? 'Update Transaction' : 'Create Transaction'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bill Form Modal */}
        {activeModal === 'bill' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  {editingItem ? 'Edit Bill' : 'Add New Bill'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBillSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendor_name" className="text-amber-800">Vendor Name</Label>
                      <Input
                        id="vendor_name"
                        value={billForm.vendor_name}
                        onChange={(e) => setBillForm({...billForm, vendor_name: e.target.value})}
                        required
                        className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vendor_email" className="text-amber-800">Vendor Email</Label>
                      <Input
                        id="vendor_email"
                        type="email"
                        value={billForm.vendor_email}
                        onChange={(e) => setBillForm({...billForm, vendor_email: e.target.value})}
                        required
                        className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bill_date" className="text-amber-800">Bill Date</Label>
                      <Input
                        id="bill_date"
                        type="date"
                        value={billForm.bill_date}
                        onChange={(e) => setBillForm({...billForm, bill_date: e.target.value})}
                        required
                        className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="due_date" className="text-amber-800">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={billForm.due_date}
                        onChange={(e) => setBillForm({...billForm, due_date: e.target.value})}
                        required
                        className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-amber-800">Category</Label>
                    <Select
                      value={billForm.category}
                      onValueChange={(value) => setBillForm({...billForm, category: value})}
                    >
                      <SelectTrigger className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl text-amber-900">
                        <SelectItem value="office_expenses">Office Expenses</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="travel_costs">Travel Costs</SelectItem>
                        <SelectItem value="software_subscriptions">Software Subscriptions</SelectItem>
                        <SelectItem value="professional_services">Professional Services</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="telecommunications">Telecommunications</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-amber-800">Description</Label>
                    <Input
                      id="description"
                      value={billForm.description}
                      onChange={(e) => setBillForm({...billForm, description: e.target.value})}
                      placeholder="Brief description of the bill"
                      required
                      className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-amber-800">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={billForm.amount}
                        onChange={(e) => setBillForm({...billForm, amount: e.target.value})}
                        required
                        className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-amber-800">Currency</Label>
                      <Select
                        value={billForm.currency}
                        onValueChange={(value) => setBillForm({...billForm, currency: value})}
                      >
                        <SelectTrigger className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl text-amber-900">
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="UGX">UGX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_terms" className="text-amber-800">Payment Terms</Label>
                    <Select
                      value={billForm.payment_terms}
                      onValueChange={(value) => setBillForm({...billForm, payment_terms: value})}
                    >
                      <SelectTrigger className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl text-amber-900">
                        <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="Net 90">Net 90</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receipt_file" className="text-amber-800">Bill/Receipt Document</Label>
                    <Input
                      id="receipt_file"
                      type="file"
                      onChange={(e) => setBillForm({...billForm, receipt_file: e.target.files[0]})}
                      accept="image/*,application/pdf"
                      className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl file:bg-amber-200/70 file:text-amber-900 file:border-amber-300/50 file:rounded-xl file:px-3 file:py-1 file:hover:bg-amber-300/70"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-amber-800">Notes</Label>
                    <Textarea
                      id="notes"
                      value={billForm.notes}
                      onChange={(e) => setBillForm({...billForm, notes: e.target.value})}
                      placeholder="Additional notes or comments..."
                      className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setActiveModal(null);
                        setEditingItem(null);
                        resetBillForm();
                      }}
                      className="flex-1 bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {editingItem ? 'Update Bill' : 'Create Bill'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vendor Form Modal */}
        {activeModal === 'vendor' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  {editingItem ? 'Edit Vendor' : 'Add New Vendor'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVendorSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-amber-800">Vendor Name</Label>
                      <Input
                        id="name"
                        value={vendorForm.name}
                        onChange={(e) => setVendorForm({...vendorForm, name: e.target.value})}
                        required
                        className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact_person" className="text-amber-800">Contact Person</Label>
                      <Input
                        id="contact_person"
                        value={vendorForm.contact_person}
                        onChange={(e) => setVendorForm({...vendorForm, contact_person: e.target.value})}
                        className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-amber-800">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={vendorForm.email}
                        onChange={(e) => setVendorForm({...vendorForm, email: e.target.value})}
                        required
                        className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-amber-800">Phone</Label>
                      <Input
                        id="phone"
                        value={vendorForm.phone}
                        onChange={(e) => setVendorForm({...vendorForm, phone: e.target.value})}
                        className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-amber-800">Address</Label>
                    <Textarea
                      id="address"
                      value={vendorForm.address}
                      onChange={(e) => setVendorForm({...vendorForm, address: e.target.value})}
                      className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendor_type" className="text-amber-800">Vendor Type</Label>
                      <Select
                        value={vendorForm.vendor_type}
                        onValueChange={(value) => setVendorForm({...vendorForm, vendor_type: value})}
                      >
                        <SelectTrigger className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl text-amber-900">
                          <SelectItem value="airline">Airline</SelectItem>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="car_rental">Car Rental</SelectItem>
                          <SelectItem value="tour_operator">Tour Operator</SelectItem>
                          <SelectItem value="service_provider">Service Provider</SelectItem>
                          <SelectItem value="software_vendor">Software Vendor</SelectItem>
                          <SelectItem value="office_supplier">Office Supplier</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment_terms" className="text-amber-800">Payment Terms</Label>
                      <Select
                        value={vendorForm.payment_terms}
                        onValueChange={(value) => setVendorForm({...vendorForm, payment_terms: value})}
                      >
                        <SelectTrigger className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl text-amber-900">
                          <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                          <SelectItem value="Net 15">Net 15</SelectItem>
                          <SelectItem value="Net 30">Net 30</SelectItem>
                          <SelectItem value="Net 60">Net 60</SelectItem>
                          <SelectItem value="Net 90">Net 90</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_id" className="text-amber-800">Tax ID</Label>
                    <Input
                      id="tax_id"
                      value={vendorForm.tax_id}
                      onChange={(e) => setVendorForm({...vendorForm, tax_id: e.target.value})}
                      className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-amber-800">Notes</Label>
                    <Textarea
                      id="notes"
                      value={vendorForm.notes}
                      onChange={(e) => setVendorForm({...vendorForm, notes: e.target.value})}
                      placeholder="Additional notes about this vendor..."
                      className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setActiveModal(null);
                        setEditingItem(null);
                        resetVendorForm();
                      }}
                      className="flex-1 bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg"
                    >
                      <Building className="w-4 h-4 mr-2" />
                      {editingItem ? 'Update Vendor' : 'Create Vendor'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Quick Add Modal */}
        {showQuickAdd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-900">Quick Financial Entry</CardTitle>
                <p className="text-amber-800/80">Quickly add transactions, bills, or expenses.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => {
                      setShowQuickAdd(false);
                      setActiveModal('transaction');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white p-6 h-24 flex flex-col items-center justify-center"
                  >
                    <DollarSign className="w-8 h-8 mb-2" />
                    <span>Quick Transaction</span>
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowQuickAdd(false);
                      setActiveModal('bill');
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white p-6 h-24 flex flex-col items-center justify-center"
                  >
                    <FileText className="w-8 h-8 mb-2" />
                    <span>Quick Bill</span>
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowQuickAdd(false);
                      setActiveModal('vendor');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-6 h-24 flex flex-col items-center justify-center"
                  >
                    <Building className="w-8 h-8 mb-2" />
                    <span>Add Vendor</span>
                  </Button>
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowQuickAdd(false)} 
                    className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalyticsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-900">Financial Analytics</CardTitle>
                <p className="text-amber-800/80">Comprehensive financial analysis and insights.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Income vs Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Income</span>
                          <span className="font-bold text-green-900">${stats.totalIncome.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-700">Expenses</span>
                          <span className="font-bold text-red-900">${stats.totalExpenses.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Net Profit</span>
                            <span className={`font-bold ${stats.netProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                              ${Math.abs(stats.netProfit).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Monthly Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Monthly Income</span>
                          <span className="font-bold text-green-900">${stats.monthlyIncome.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-700">Monthly Expenses</span>
                          <span className="font-bold text-red-900">${stats.monthlyExpenses.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Monthly Profit</span>
                            <span className={`font-bold ${stats.monthlyProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                              ${Math.abs(stats.monthlyProfit).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-100/50 rounded-lg">
                    <p className="text-sm text-blue-700">Cash Flow (30d)</p>
                    <p className={`text-2xl font-bold ${stats.cashFlow >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                      ${Math.abs(stats.cashFlow).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-100/50 rounded-lg">
                    <p className="text-sm text-orange-700">Outstanding Receivables</p>
                    <p className="text-2xl font-bold text-orange-900">${stats.totalOutstandingInvoices.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-red-100/50 rounded-lg">
                    <p className="text-sm text-red-700">Outstanding Payables</p>
                    <p className="text-2xl font-bold text-red-900">${stats.pendingBills.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAnalyticsModal(false)} 
                    className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cash Flow Modal */}
        {showCashFlowModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-900">Cash Flow Analysis</CardTitle>
                <p className="text-amber-800/80">Detailed cash flow tracking and forecasting.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cash Inflows</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Total Income</span>
                          <span className="font-bold text-green-900">${stats.totalIncome.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Outstanding Invoices</span>
                          <span className="font-bold text-green-900">${stats.totalOutstandingInvoices.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total Inflows</span>
                            <span className="font-bold text-green-900">${(stats.totalIncome + stats.totalOutstandingInvoices).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cash Outflows</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-red-700">Total Expenses</span>
                          <span className="font-bold text-red-900">${stats.totalExpenses.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-700">Pending Bills</span>
                          <span className="font-bold text-red-900">${stats.pendingBills.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total Outflows</span>
                            <span className="font-bold text-red-900">${(stats.totalExpenses + stats.pendingBills).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Net Cash Position</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className={`text-4xl font-bold ${stats.cashFlow >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                        ${Math.abs(stats.cashFlow).toLocaleString()}
                      </p>
                      <p className={`text-lg ${stats.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {stats.cashFlow >= 0 ? 'Positive' : 'Negative'} Cash Flow
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCashFlowModal(false)} 
                    className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
