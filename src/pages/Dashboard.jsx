
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Agency } from "@/api/entities";
import { GDSTicket } from "@/api/entities";
import { Invoice } from "@/api/entities";
import { Booking } from "@/api/entities";
import { Transaction } from "@/api/entities";
import { Client } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Plane,
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  Upload,
  Bell,
  Building,
  Wand2,
  ArrowRightCircle,
  FileWarning,
  Shield,
  Settings,
  Calendar,
  Target,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [agency, setAgency] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    tickets: [],
    invoices: [],
    bookings: [],
    transactions: [],
    stats: {
      totalTickets: 0,
      automatedBookings: 0,
      totalRevenue: 0,
      pendingRevenue: 0,
      outstandingAmount: 0,
      overdueInvoices: 0,
      automationRate: 0
    }
  });
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isAgencyPending, setIsAgencyPending] = useState(false);
  const [agencyStatus, setAgencyStatus] = useState('active'); // active, pending, suspended

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    setLoading(true);
    try {
      const userData = await User.me();

      // CRITICAL FIX: Immediately redirect super admins to their dedicated dashboard.
      if (userData && (userData.app_role === 'super_admin' || userData.email === 'dwmusoke@gmail.com')) {
        window.location.replace(createPageUrl("SuperAdmin"));
        return;
      }

      setUser(userData);
      setNeedsOnboarding(false);
      setIsAgencyPending(false);

      if (userData.agency_id) {
        // User has an agency, load dashboard data
        const agencyData = await loadAgencyData(userData.agency_id);
        
        if (agencyData) {
          setAgency(agencyData);
          setAgencyStatus(agencyData.subscription_status || 'active');
          
          // Check agency status and handle accordingly
          if (agencyData.subscription_status === 'pending_approval') {
            setIsAgencyPending(true);
            setLoading(false);
            return; // Don't load other data if agency is pending
          }
          
          if (agencyData.subscription_status === 'suspended' || !agencyData.is_active) {
            setAgencyStatus('suspended');
            setLoading(false);
            return; // Don't load other data if agency is suspended
          }

          // Load dashboard data only for active agencies
          await Promise.all([
            loadDashboardData(userData.agency_id),
            checkExpiringDocuments(userData.agency_id)
          ]);
        } else {
          // Agency not found, user needs to create one
          setNeedsOnboarding(true);
        }
      } else {
        // User has no agency, redirect to setup
        window.location.href = createPageUrl("GetStarted");
        return;
      }
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      setNeedsOnboarding(true);
    } finally {
      setLoading(false);
    }
  };

  const loadAgencyData = async (agencyId) => {
    try {
      const agencyData = await Agency.get(agencyId);
      return agencyData;
    } catch (error) {
      console.error("Error loading agency data:", error);
      return null;
    }
  };

  const loadDashboardData = async (agencyId) => {
    try {
      // Load all data with proper agency filtering
      const [tickets, invoices, bookings, transactions] = await Promise.all([
        GDSTicket.filter({ agency_id: agencyId }, '-created_date', 50),
        Invoice.filter({ agency_id: agencyId }, '-created_date', 50),
        Booking.filter({ agency_id: agencyId }, '-created_date', 50),
        Transaction.filter({ agency_id: agencyId }, '-created_date', 50)
      ]);

      // Calculate stats
      const stats = {
        totalTickets: tickets.length,
        automatedBookings: bookings.filter(b => b.ticket_id).length,
        totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0),
        pendingRevenue: invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + (i.balance_due || 0), 0),
        outstandingAmount: invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.balance_due || 0), 0),
        overdueInvoices: invoices.filter(i => i.status === 'overdue').length,
        automationRate: tickets.length > 0 ? ((bookings.filter(b => b.ticket_id).length / tickets.length) * 100) : 0
      };

      setDashboardData({
        tickets,
        invoices,
        bookings,
        transactions,
        stats
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const checkExpiringDocuments = async (agencyId) => {
    try {
      // Check for expiring documents (implement based on your document structure)
      const expiringDocs = [];
      setExpiringDocuments(expiringDocs);
    } catch (error) {
      console.error("Error checking expiring documents:", error);
    }
  };

  // Agency Pending Approval Screen
  if (isAgencyPending) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-800 mb-4">Agency Pending Approval</h2>
              <p className="text-amber-700 mb-6">
                Your agency "{agency?.name}" is currently under review. Our team will review your application 
                and activate your account within 24-48 hours.
              </p>
              <div className="bg-white rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-amber-800 mb-2">Agency Details</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-amber-600">Agency Name:</span>
                    <p className="font-medium">{agency?.name}</p>
                  </div>
                  <div>
                    <span className="text-amber-600">Office ID:</span>
                    <p className="font-medium">{agency?.office_id}</p>
                  </div>
                  <div>
                    <span className="text-amber-600">Contact Email:</span>
                    <p className="font-medium">{agency?.contact_email}</p>
                  </div>
                  <div>
                    <span className="text-amber-600">Contact Phone:</span>
                    <p className="font-medium">{agency?.contact_phone}</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Agency Suspended Screen
  if (agencyStatus === 'suspended') {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-red-50 to-red-100">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Agency Account Suspended</h2>
              <p className="text-red-700 mb-6">
                Your agency account has been suspended. Please contact support for assistance.
              </p>
              <Button 
                onClick={() => window.location.href = createPageUrl("Billing")} 
                className="bg-red-600 hover:bg-red-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Onboarding Screen
  if (needsOnboarding) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <Building className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-800 mb-4">Welcome to TravelPro!</h2>
              <p className="text-amber-700 mb-6">
                You need to set up your agency before you can access the dashboard.
              </p>
              <Button 
                onClick={() => window.location.href = createPageUrl("GetStarted")} 
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Set Up My Agency
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Dashboard</h1>
            <p className="text-amber-800/80">
              Welcome back, {user?.name || 'User'}! Here's what's happening with {agency?.name}.
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="bg-amber-100/50 text-amber-800 border-amber-300/50">
              {agency?.subscription_plan || 'Basic'} Plan
            </Badge>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900">Upload PNR</p>
                  <p className="text-xs text-amber-700">Process tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900">New Booking</p>
                  <p className="text-xs text-amber-700">Create booking</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900">Create Invoice</p>
                  <p className="text-xs text-amber-700">Generate invoice</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900">Add Client</p>
                  <p className="text-xs text-amber-700">New client</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-amber-900">{dashboardData.stats.totalTickets}</p>
                </div>
                <Plane className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-amber-900">${dashboardData.stats.totalRevenue.toFixed(0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Pending Revenue</p>
                  <p className="text-2xl font-bold text-amber-900">${dashboardData.stats.pendingRevenue.toFixed(0)}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Automation Rate</p>
                  <p className="text-2xl font-bold text-amber-900">{dashboardData.stats.automationRate.toFixed(1)}%</p>
                </div>
                <Wand2 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50">
            <CardHeader>
              <CardTitle className="text-amber-900">Recent Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.tickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between py-2 border-b border-amber-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-amber-900">{ticket.passenger_name}</p>
                    <p className="text-sm text-amber-600">{ticket.ticket_number}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {ticket.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50">
            <CardHeader>
              <CardTitle className="text-amber-900">Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-2 border-b border-amber-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-amber-900">{invoice.invoice_number}</p>
                    <p className="text-sm text-amber-600">{invoice.client_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-amber-900">${invoice.total_amount?.toFixed(2)}</p>
                    <Badge variant="outline" className="text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
