
import React, { useState, useEffect, useMemo } from "react";
import { GDSTicket, Invoice, Transaction, Client, User, Bill, Vendor } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Plane,
  DollarSign,
  Download,
  Filter,
  Activity,
  Settings,
  Ticket,
  Users,
  Zap,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  X,
  Eye,
  FileText,
  Building,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  TrendingDown,
  Plus,
  Search,
  Mail,
  MessageSquare,
  ExternalLink,
  Copy
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, startOfMonth, endOfMonth, differenceInDays, parseISO } from "date-fns";

export default function Reports() {
  // Enhanced state management
  const [fetchedRawData, setFetchedRawData] = useState({
    tickets: [],
    invoices: [],
    transactions: [],
    clients: [],
    bills: [],
    vendors: []
  });

  const [calculatedMetrics, setCalculatedMetrics] = useState({
    totalRevenue: 0,
    outstandingAmount: 0,
    totalTickets: 0,
    totalInvoices: 0,
    activeClients: 0,
    automationRate: 0,
    topAirlines: [],
    topDestinations: [],
    invoiceStatusBreakdown: { paid: { count: 0, amount: 0 }, sent: { count: 0, amount: 0 }, overdue: { count: 0, amount: 0 } },
    airlinesList: [],
    // Enhanced metrics
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    monthlyProfit: 0,
    cashFlow: 0,
    totalBills: 0,
    pendingBills: 0,
    overdueBills: 0,
    totalVendors: 0,
    conversionRate: 0,
    averageTicketValue: 0,
    averageInvoiceValue: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRangeFilter, setDateRangeFilter] = useState("last_30_days");
  const [airlineFilter, setAirlineFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCustomReport, setShowCustomReport] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [viewMode, setViewMode] = useState("cards"); // cards or table
  const [searchTerm, setSearchTerm] = useState("");

  // Enhanced data loading with error handling
  useEffect(() => {
    loadReportData();
  }, [dateRangeFilter]);

  useEffect(() => {
    if (!loading) {
      calculateReportData();
    }
  }, [fetchedRawData, airlineFilter, categoryFilter, loading]);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (!user?.agency_id) {
        setError("No agency assigned. Please contact your administrator.");
        setFetchedRawData({ tickets: [], invoices: [], transactions: [], clients: [], bills: [], vendors: [] });
        setLoading(false);
        return;
      }

      const now = new Date();
      const filterStartDate = new Date();

      switch (dateRangeFilter) {
        case "last_7_days":
          filterStartDate.setDate(now.getDate() - 7);
          break;
        case "last_30_days":
          filterStartDate.setDate(now.getDate() - 30);
          break;
        case "last_90_days":
          filterStartDate.setDate(now.getDate() - 90);
          break;
        case "last_year":
          filterStartDate.setFullYear(now.getFullYear() - 1);
          break;
        case "all_time":
          filterStartDate.setFullYear(1970);
          break;
        default:
          filterStartDate.setDate(now.getDate() - 30);
      }

      const [ticketsList, invoiceList, transactionList, clientList, billList, vendorList] = await Promise.all([
        GDSTicket.filter({ agency_id: user.agency_id }, '-created_date', 500),
        Invoice.filter({ agency_id: user.agency_id }, '-created_date', 500),
        Transaction.filter({ agency_id: user.agency_id }, '-created_date', 500),
        Client.filter({ agency_id: user.agency_id }, '-created_date', 200),
        Bill.filter({ agency_id: user.agency_id }, '-created_date', 200),
        Vendor.filter({ agency_id: user.agency_id }, '-created_date', 100)
      ]);

      const filteredTickets = (ticketsList || []).filter(t => t && new Date(t.created_date) >= filterStartDate);
      const filteredInvoices = (invoiceList || []).filter(i => i && new Date(i.created_date) >= filterStartDate);
      const filteredTransactions = (transactionList || []).filter(t => t && new Date(t.created_date) >= filterStartDate);
      const filteredClients = (clientList || []).filter(c => c && new Date(c.created_date) >= filterStartDate);
      const filteredBills = (billList || []).filter(b => b && new Date(b.created_date) >= filterStartDate);
      const filteredVendors = (vendorList || []).filter(v => v && new Date(v.created_date) >= filterStartDate);

      setFetchedRawData({
        tickets: filteredTickets,
        invoices: filteredInvoices,
        transactions: filteredTransactions,
        clients: filteredClients,
        bills: filteredBills,
        vendors: filteredVendors
      });

    } catch (error) {
      console.error("Error loading report data:", error);
      setError("Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateReportData = useMemo(() => {
    const ticketsForCalc = fetchedRawData.tickets;
    const invoicesForCalc = fetchedRawData.invoices;
    const transactionsForCalc = fetchedRawData.transactions;
    const clientsForCalc = fetchedRawData.clients;
    const billsForCalc = fetchedRawData.bills;
    const vendorsForCalc = fetchedRawData.vendors;

    // Filter tickets by airline
    const filteredTicketsByAirline = ticketsForCalc.filter(ticket => {
      if (!ticket) return false;
      if (airlineFilter === "all") return true;
      const airline = ticket.flight_segments?.[0]?.airline;
      return airline && airline.toUpperCase() === airlineFilter;
    });

    // Enhanced financial calculations
    const totalRevenue = invoicesForCalc
      .filter(inv => inv && inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    const outstandingAmount = invoicesForCalc
      .filter(inv => inv && (inv.status === 'sent' || inv.status === 'overdue'))
      .reduce((sum, inv) => sum + ((inv.total_amount || 0) - (inv.amount_paid || 0)), 0);

    // Monthly calculations
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyRevenue = invoicesForCalc
      .filter(inv => inv && inv.status === 'paid' && new Date(inv.created_date).getMonth() === currentMonth && new Date(inv.created_date).getFullYear() === currentYear)
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    const monthlyExpenses = transactionsForCalc
      .filter(t => t && t.type === 'expense' && new Date(t.transaction_date).getMonth() === currentMonth && new Date(t.transaction_date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const monthlyProfit = monthlyRevenue - monthlyExpenses;

    // Cash flow calculation (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentIncome = transactionsForCalc
      .filter(t => t && t.type === 'income' && new Date(t.transaction_date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const recentExpenses = transactionsForCalc
      .filter(t => t && t.type === 'expense' && new Date(t.transaction_date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const cashFlow = recentIncome - recentExpenses;

    // Bill calculations
    const totalBills = billsForCalc.length;
    const pendingBills = billsForCalc.filter(b => b && (b.status === 'pending' || b.status === 'approved')).length;
    const overdueBills = billsForCalc.filter(b => b && b.status !== 'paid' && b.status !== 'cancelled' && new Date(b.due_date) < new Date()).length;

    // Enhanced metrics
    const airlinesList = [...new Set(
      fetchedRawData.tickets
        .filter(t => t && t.flight_segments && t.flight_segments.length > 0)
        .map(t => t.flight_segments[0]?.airline?.toUpperCase())
        .filter(Boolean)
    )];

    const airlineSales = {};
    const airlineTicketCounts = {};
    filteredTicketsByAirline.forEach(ticket => {
      if (ticket && ticket.flight_segments && ticket.flight_segments.length > 0) {
        const airline = ticket.flight_segments[0]?.airline?.toUpperCase();
        if (airline) {
          airlineSales[airline] = (airlineSales[airline] || 0) + (ticket.total_amount || 0);
          airlineTicketCounts[airline] = (airlineTicketCounts[airline] || 0) + 1;
        }
      }
    });

    const topAirlines = Object.entries(airlineSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([airline, sales]) => ({
        airline,
        sales,
        count: airlineTicketCounts[airline] || 0
      }));

    const destinationCounts = {};
    filteredTicketsByAirline.forEach(ticket => {
      if (ticket && ticket.flight_segments) {
        ticket.flight_segments.forEach(segment => {
          if (segment && segment.destination) {
            destinationCounts[segment.destination] = (destinationCounts[segment.destination] || 0) + 1;
          }
        });
      }
    });

    const topDestinations = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    const totalTickets = filteredTicketsByAirline.length;
    const totalInvoices = invoicesForCalc.length;
    const activeClients = new Set(clientsForCalc.map(c => c.name).filter(Boolean)).size;
    const automationRate = 92; // Placeholder

    const invoiceStatusBreakdown = {
      paid: { count: 0, amount: 0 },
      sent: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
    };
    
    invoicesForCalc.forEach(inv => {
      if (inv && inv.status && invoiceStatusBreakdown[inv.status]) {
        invoiceStatusBreakdown[inv.status].count++;
        invoiceStatusBreakdown[inv.status].amount += (inv.total_amount || 0);
      }
    });

    // Additional calculated metrics
    const conversionRate = totalTickets > 0 ? (totalInvoices / totalTickets) * 100 : 0;
    const averageTicketValue = totalTickets > 0 ? totalRevenue / totalTickets : 0;
    const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    setCalculatedMetrics({
      totalRevenue,
      outstandingAmount,
      totalTickets,
      totalInvoices,
      activeClients,
      automationRate,
      topAirlines,
      topDestinations,
      invoiceStatusBreakdown,
      airlinesList,
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit,
      cashFlow,
      totalBills,
      pendingBills,
      overdueBills,
      totalVendors: vendorsForCalc.length,
      conversionRate,
      averageTicketValue,
      averageInvoiceValue
    });
  }, [fetchedRawData, airlineFilter, categoryFilter, loading]);

  const handleExportAll = () => {
    setShowExportModal(true);
  };

  const handleRefresh = () => {
    loadReportData();
  };

  const filteredData = useMemo(() => {
    let filtered = fetchedRawData;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = {
        ...filtered,
        tickets: filtered.tickets.filter(t => 
          t?.passenger_name?.toLowerCase().includes(searchLower) ||
          t?.ticket_number?.toLowerCase().includes(searchLower) ||
          t?.pnr?.toLowerCase().includes(searchLower)
        ),
        invoices: filtered.invoices.filter(i => 
          i?.invoice_number?.toLowerCase().includes(searchLower) ||
          i?.client_name?.toLowerCase().includes(searchLower)
        ),
        clients: filtered.clients.filter(c => 
          c?.name?.toLowerCase().includes(searchLower) ||
          c?.email?.toLowerCase().includes(searchLower)
        )
      };
    }
    
    return filtered;
  }, [fetchedRawData, searchTerm]);

  if (error) {
    return (
      <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <Alert className="bg-red-50/50 border-red-200/50 text-red-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Reports & Analytics</h1>
            <p className="text-amber-800/80">
              Comprehensive insights into your agency's performance and growth trends.
              {currentUser ? ` Agency ID: ${currentUser.agency_id}` : ' Loading agency info...'}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={handleRefresh} className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setShowCustomReport(true)} className="bg-blue-100/50 backdrop-blur-sm text-blue-900 border-blue-300/50 hover:bg-blue-100/70 rounded-xl shadow-sm">
              <Settings className="w-4 h-4 mr-2" />
              Custom Report
            </Button>
            <Button onClick={handleExportAll} className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <Card key={i} className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Enhanced Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-green-50/50 backdrop-blur-md border border-green-200/50 rounded-xl shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700/80">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${calculatedMetrics.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {calculatedMetrics.monthlyRevenue > 0 ? `+${((calculatedMetrics.monthlyRevenue / calculatedMetrics.totalRevenue) * 100).toFixed(1)}% this month` : 'No monthly data'}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50/50 backdrop-blur-md border border-blue-200/50 rounded-xl shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700/80">Tickets Processed</p>
                      <p className="text-2xl font-bold text-blue-700">{calculatedMetrics.totalTickets || 0}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        ${calculatedMetrics.averageTicketValue?.toFixed(2)} avg value
                      </p>
                    </div>
                    <Ticket className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50/50 backdrop-blur-md border border-purple-200/50 rounded-xl shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700/80">Active Clients</p>
                      <p className="text-2xl font-bold text-purple-700">{calculatedMetrics.activeClients || 0}</p>
                      <p className="text-xs text-purple-600 mt-1">
                        {calculatedMetrics.conversionRate?.toFixed(1)}% conversion rate
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50/50 backdrop-blur-md border border-orange-200/50 rounded-xl shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-700/80">Cash Flow (30d)</p>
                      <p className={`text-2xl font-bold ${calculatedMetrics.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        ${Math.abs(calculatedMetrics.cashFlow)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs ${calculatedMetrics.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>
                        {calculatedMetrics.cashFlow >= 0 ? 'Positive' : 'Negative'} flow
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Filters */}
            <Card className="mb-8 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-amber-700/80" />
                    <span className="text-sm font-medium text-amber-900">Filter by:</span>
                  </div>
                  
                  <div className="flex gap-4 flex-wrap">
                    <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                      <SelectTrigger className="w-full md:w-[180px] bg-amber-100/50 border-amber-300/50 text-amber-900">
                        <SelectValue placeholder="Date Range" />
                      </SelectTrigger>
                      <SelectContent className="bg-amber-50/90 border-amber-200/50">
                        <SelectItem value="last_7_days" className="text-amber-900 hover:bg-amber-100">Last 7 Days</SelectItem>
                        <SelectItem value="last_30_days" className="text-amber-900 hover:bg-amber-100">Last 30 Days</SelectItem>
                        <SelectItem value="last_90_days" className="text-amber-900 hover:bg-amber-100">Last 90 Days</SelectItem>
                        <SelectItem value="last_year" className="text-amber-900 hover:bg-amber-100">Last Year</SelectItem>
                        <SelectItem value="all_time" className="text-amber-900 hover:bg-amber-100">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={airlineFilter} onValueChange={setAirlineFilter}>
                      <SelectTrigger className="w-full md:w-[180px] bg-amber-100/50 border-amber-300/50 text-amber-900">
                        <SelectValue placeholder="All Airlines" />
                      </SelectTrigger>
                      <SelectContent className="bg-amber-50/90 border-amber-200/50">
                        <SelectItem value="all" className="text-amber-900 hover:bg-amber-100">All Airlines</SelectItem>
                        {calculatedMetrics.airlinesList.map(airline => (
                          <SelectItem key={airline} value={airline} className="text-amber-900 hover:bg-amber-100">{airline}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600" />
                      <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-amber-100/50 border border-amber-300/50 text-amber-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === "cards" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("cards")}
                        className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                        className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl"
                      >
                        <PieChart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Report Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-amber-200/50 backdrop-blur-sm border border-amber-300/50 rounded-xl text-amber-800">
                <TabsTrigger value="overview" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Overview</TabsTrigger>
                <TabsTrigger value="revenue" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Revenue</TabsTrigger>
                <TabsTrigger value="tickets" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Tickets</TabsTrigger>
                <TabsTrigger value="clients" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Clients</TabsTrigger>
                <TabsTrigger value="financial" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Financial</TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Performance</TabsTrigger>
              </TabsList>

              {/* Overview Tab Content */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Financial Summary */}
                  <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-amber-900">Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-100/50 rounded-lg">
                          <p className="text-sm text-green-700">Monthly Revenue</p>
                          <p className="text-xl font-bold text-green-900">${calculatedMetrics.monthlyRevenue.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-red-100/50 rounded-lg">
                          <p className="text-sm text-red-700">Monthly Expenses</p>
                          <p className="text-xl font-bold text-red-900">${calculatedMetrics.monthlyExpenses.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-blue-100/50 rounded-lg">
                          <p className="text-sm text-blue-700">Monthly Profit</p>
                          <p className={`text-xl font-bold ${calculatedMetrics.monthlyProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                            ${Math.abs(calculatedMetrics.monthlyProfit).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 bg-purple-100/50 rounded-lg">
                          <p className="text-sm text-purple-700">Cash Flow</p>
                          <p className={`text-xl font-bold ${calculatedMetrics.cashFlow >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                            ${Math.abs(calculatedMetrics.cashFlow).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Operational Metrics */}
                  <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-amber-900">Operational Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-amber-100/50 rounded-lg">
                          <span className="text-amber-700">Total Bills</span>
                          <span className="font-bold text-amber-900">{calculatedMetrics.totalBills}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-100/50 rounded-lg">
                          <span className="text-orange-700">Pending Bills</span>
                          <span className="font-bold text-orange-900">{calculatedMetrics.pendingBills}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-100/50 rounded-lg">
                          <span className="text-red-700">Overdue Bills</span>
                          <span className="font-bold text-red-900">{calculatedMetrics.overdueBills}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-indigo-100/50 rounded-lg">
                          <span className="text-indigo-700">Total Vendors</span>
                          <span className="font-bold text-indigo-900">{calculatedMetrics.totalVendors}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Revenue Tab Content */}
              <TabsContent value="revenue" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-amber-700/80">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-700">${calculatedMetrics.totalRevenue?.toFixed(2)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-amber-700/80">Outstanding Amount</p>
                          <p className="text-2xl font-bold text-orange-700">${calculatedMetrics.outstandingAmount?.toFixed(2)}</p>
                        </div>
                        <Activity className="w-8 h-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Invoice Status Breakdown */}
                <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Invoice Status Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.entries(calculatedMetrics.invoiceStatusBreakdown).map(([status, data]) => (
                        <div key={status} className="p-4 bg-amber-100/50 rounded-lg border border-amber-200/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium capitalize text-amber-800">{status}</span>
                            <Badge className={
                              status === 'paid' ? 'bg-green-600 text-white' :
                              status === 'overdue' ? 'bg-red-600 text-white' :
                              'bg-amber-300 text-amber-900'
                            }>
                              {data.count}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-amber-900">${data.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tickets Tab Content */}
              <TabsContent value="tickets" className="space-y-6">
                 <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-amber-700/80">Total Tickets</p>
                          <p className="text-2xl font-bold text-blue-700">{calculatedMetrics.totalTickets}</p>
                        </div>
                        <Plane className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                {/* Top Airlines */}
                <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <Plane className="w-5 h-5 text-amber-900" />
                      Top Airlines by Sales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {calculatedMetrics.topAirlines.map(({ airline, sales, count }) => (
                        <div key={airline} className="flex items-center justify-between p-4 bg-amber-100/50 rounded-lg border border-amber-200/50">
                          <div>
                            <p className="font-medium text-amber-900">{airline}</p>
                            <p className="text-sm text-amber-800/80">
                              {count} tickets
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-900">${sales.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Destinations */}
                <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <TrendingUp className="w-5 h-5 text-amber-900" />
                      Popular Destinations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {calculatedMetrics.topDestinations.map(([destination, count]) => (
                        <div key={destination} className="flex items-center justify-between p-4 bg-amber-100/50 rounded-lg border border-amber-200/50">
                          <span className="font-medium text-amber-900">{destination}</span>
                          <Badge className="bg-amber-300 text-amber-900">{count} flights</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Clients Tab Content */}
              <TabsContent value="clients" className="space-y-6">
                <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Active Clients Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold text-amber-900 mb-2">Total Active Clients: {calculatedMetrics.activeClients}</p>
                    <p className="text-amber-800/80">This section would typically show client acquisition, retention, and value over time. Currently showing unique customers from filtered tickets.</p>
                    {calculatedMetrics.activeClients > 0 && (
                      <div className="mt-4 p-4 bg-amber-100/50 rounded-lg border border-amber-200/50">
                        <h4 className="font-semibold text-amber-900 mb-2">Recent Clients (Example):</h4>
                        <ul className="list-disc list-inside text-amber-800/80">
                          {fetchedRawData.clients.slice(0, 5).map((client, index) => (
                            <li key={index}>{client.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financial Tab Content */}
              <TabsContent value="financial" className="space-y-6">
                <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Financial Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold text-amber-900 mb-2">Overall Financial Health</p>
                    <p className="text-amber-800/80">This tab can display detailed financial metrics, payment statuses, and expense tracking. Currently, it summarizes outstanding amounts and transaction counts.</p>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-amber-100/50 rounded-lg border border-amber-200/50">
                        <span className="text-sm font-medium text-amber-800">Transactions Processed:</span>
                        <p className="text-lg font-bold text-amber-900">{fetchedRawData.transactions.length}</p>
                      </div>
                      <div className="p-4 bg-amber-100/50 rounded-lg border border-amber-200/50">
                        <span className="text-sm font-medium text-amber-800">Average Invoice Value:</span>
                        <p className="text-lg font-bold text-amber-900">
                          ${calculatedMetrics.averageInvoiceValue?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab Content */}
              <TabsContent value="performance" className="space-y-6">
                <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Operational Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold text-amber-900 mb-2">Automation Rate: {calculatedMetrics.automationRate}%</p>
                    <p className="text-amber-800/80">This tab would typically showcase operational efficiencies, processing times, and staff productivity metrics.</p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-amber-100/50 rounded-lg border border-amber-200/50">
                        <span className="text-sm font-medium text-amber-800">Tickets per Day:</span>
                        <p className="text-lg font-bold text-amber-900">
                          { (calculatedMetrics.totalTickets / 30).toFixed(1) }
                        </p>
                      </div>
                      <div className="p-4 bg-amber-100/50 rounded-lg border border-amber-200/50">
                        <span className="text-sm font-medium text-amber-800">Invoices per Day:</span>
                        <p className="text-lg font-bold text-amber-900">
                          { (calculatedMetrics.totalInvoices / 30).toFixed(1) }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="bg-amber-50/80 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-900">Export Reports</CardTitle>
                  <Button variant="ghost" onClick={() => setShowExportModal(false)} className="text-amber-800 hover:bg-amber-800/10">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div className="text-sm text-amber-800/80">
                  Export will include all data for the selected date range and filters.
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
