
import React, { useState, useEffect, useMemo } from "react";
import { Workflow, GDSTicket, Invoice, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Workflow as WorkflowIcon,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Zap,
  Clock,
  Mail,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Settings,
  Activity,
  Target,
  FileText,
  Send,
  Users,
  Calendar,
  X,
  RefreshCw,
  Eye,
  Copy,
  Download,
  Search,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Bell,
  Shield,
  Globe,
  Database,
  Cpu,
  Wifi,
  WifiOff,
  AlertCircle,
  Info,
  HelpCircle
} from "lucide-react";
import WorkflowBuilder from "../components/workflows/WorkflowBuilder";
import WorkflowStats from "../components/workflows/WorkflowStats";
import { executeWorkflow as executeWorkflowBackend } from '@/api/functions';

const WORKFLOW_TEMPLATES = [
  {
    id: 'complete-booking-process',
    name: 'Complete Booking to Invoice Process',
    description: 'Automatically handle the complete process from ticket creation to invoice generation and client management',
    category: 'sales',
    trigger: { type: 'ticket_created', conditions: {} },
    steps: [
      { id: 'step1', type: 'create_client', config: { default_credit_limit: 5000 } },
      { id: 'step2', type: 'create_booking', config: { booking_type: 'flight', initial_status: 'confirmed' } },
      { id: 'step3', type: 'create_invoice', config: { service_fee: 50, due_days: 30, tax_rate: 0 } },
      { id: 'step4', type: 'create_transaction', config: { transaction_type: 'income', category: 'ticket_sale' } },
      { id: 'step5', type: 'send_email', config: { 
        subject: 'Booking Confirmation - {{ticket_number}}',
        body: 'Dear {{client_name}},\n\nYour booking has been confirmed. Invoice will be sent separately.\n\nBest regards,\n{{agent_name}}'
      }},
      { id: 'step6', type: 'log_analytics_event', config: { event_type: 'booking_completed' } }
    ]
  },
  {
    id: 'payment-reminder-system',
    name: 'Automated Payment Reminder System',
    description: 'Send escalating payment reminders for overdue invoices with CRM updates',
    category: 'financial',
    trigger: { type: 'invoice_overdue', conditions: { days: 7 } },
    steps: [
      { id: 'step1', type: 'send_payment_reminder', config: { 
        template: 'friendly_reminder',
        subject: 'Payment Reminder - Invoice {{invoice_number}}'
      }},
      { id: 'step2', type: 'update_client_status', config: { status: 'payment_overdue' } },
      { id: 'step3', type: 'log_analytics_event', config: { event_type: 'payment_reminder_sent' } }
    ]
  },
  {
    id: 'lead-nurturing-workflow',
    name: 'Lead Nurturing and Follow-up',
    description: 'Automatically create leads from inquiries and set up follow-up sequences',
    category: 'sales',
    trigger: { type: 'client_registered', conditions: {} },
    steps: [
      { id: 'step1', type: 'create_lead', config: { 
        source: 'website', 
        initial_status: 'new',
        follow_up_days: 3
      }},
      { id: 'step2', type: 'send_email', config: {
        subject: 'Welcome to {{agency_name}} - Let\'s Plan Your Perfect Trip!',
        body: 'Dear {{client_name}},\n\nWelcome! We\'re excited to help you plan your next adventure.\n\nOur team will be in touch within 24 hours.\n\nBest regards,\n{{agent_name}}'
      }},
      { id: 'step3', type: 'create_task', config: { 
        task_type: 'follow_up_call',
        due_days: 1
      }}
    ]
  },
  {
    id: 'financial-reporting-automation',
    name: 'Daily Financial Reporting',
    description: 'Generate daily financial summaries and analytics updates',
    category: 'analytics',
    trigger: { type: 'scheduled', schedule: '0 18 * * *' }, // 6 PM daily
    steps: [
      { id: 'step1', type: 'update_kpi_metrics', config: { metrics: ['daily_revenue', 'bookings_count', 'pending_payments'] } },
      { id: 'step2', type: 'log_analytics_event', config: { event_type: 'daily_report_generated' } },
      { id: 'step3', type: 'send_email', config: {
        subject: 'Daily Financial Summary - {{date}}',
        body: 'Daily financial report has been updated in your dashboard.',
        to: 'admin'
      }}
    ]
  },
  {
    id: 'client-credit-monitoring',
    name: 'Client Credit Limit Monitoring',
    description: 'Monitor client credit limits and send alerts when approaching limits',
    category: 'financial',
    trigger: { type: 'invoice_created', conditions: {} },
    steps: [
      { id: 'step1', type: 'check_credit_limit', config: { alert_threshold: 80 } },
      { id: 'step2', type: 'send_email', config: {
        subject: 'Credit Limit Alert - {{client_name}}',
        body: 'Client {{client_name}} is approaching their credit limit.',
        to: 'agent'
      }},
      { id: 'step3', type: 'update_client_status', config: { flag: 'credit_watch' } }
    ]
  },
  {
    id: 'ticket-expiry-notification',
    name: 'Ticket Expiry Notification System',
    description: 'Automatically notify clients and agents about upcoming ticket expirations',
    category: 'operations',
    trigger: { type: 'ticket_near_expiry', conditions: { days_before: 7 } },
    steps: [
      { id: 'step1', type: 'send_email', config: {
        subject: 'Ticket Expiry Reminder - {{ticket_number}}',
        body: 'Dear {{client_name}},\n\nYour ticket {{ticket_number}} expires on {{expiry_date}}. Please contact us if you need assistance.\n\nBest regards,\n{{agent_name}}'
      }},
      { id: 'step2', type: 'notify_agent', config: { 
        message: 'Ticket {{ticket_number}} expires in {{days_remaining}} days',
        priority: 'medium'
      }},
      { id: 'step3', type: 'log_analytics_event', config: { event_type: 'expiry_notification_sent' } }
    ]
  }
];

export default function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // cards or table
  const [executionHistory, setExecutionHistory] = useState([]);

  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successRate: 0,
    // Enhanced stats
    failedExecutions: 0,
    averageExecutionTime: 0,
    mostUsedWorkflow: null,
    recentExecutions: 0
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (!user?.agency_id) {
        setError("No agency assigned. Please contact your administrator.");
        setWorkflows([]);
        setLoading(false);
        return;
      }

      const workflowList = await Workflow.filter({ agency_id: user.agency_id }, '-created_date', 100);
      setWorkflows(workflowList);

      // Enhanced stats calculation
      const activeCount = workflowList.filter(w => w.is_active).length;
      const totalExecutions = workflowList.reduce((sum, w) => sum + (w.execution_count || 0), 0);
      const successfulExecutions = workflowList.reduce((sum, w) => sum + (w.successful_executions || 0), 0);
      const failedExecutions = workflowList.reduce((sum, w) => sum + (w.failed_executions || 0), 0);
      
      // Find most used workflow
      const mostUsed = workflowList.reduce((max, w) => 
        (w.execution_count || 0) > (max?.execution_count || 0) ? w : max, null
      );

      // Calculate average execution time (placeholder)
      const averageExecutionTime = workflowList.length > 0 ? 
        workflowList.reduce((sum, w) => sum + (w.avg_execution_time || 0), 0) / workflowList.length : 0;

      // Recent executions (last 7 days)
      const recentExecutions = workflowList.reduce((sum, w) => {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        return sum + (w.last_execution && new Date(w.last_execution) >= lastWeek ? 1 : 0);
      }, 0);

      setStats({
        totalWorkflows: workflowList.length,
        activeWorkflows: activeCount,
        totalExecutions,
        successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
        failedExecutions,
        averageExecutionTime,
        mostUsedWorkflow: mostUsed,
        recentExecutions
      });

    } catch (error) {
      console.error("Error loading workflows:", error);
      setError("Failed to load workflows. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (template) => {
    try {
      const workflowData = {
        name: template.name,
        description: template.description,
        category: template.category || 'operations',
        trigger: template.trigger,
        steps: template.steps,
        is_active: false,
        execution_count: 0,
        successful_executions: 0,
        failed_executions: 0,
        last_execution: null,
        avg_execution_time: 0,
        agency_id: currentUser.agency_id,
        created_by: currentUser.id,
        created_date: new Date().toISOString()
      };

      await Workflow.create(workflowData);
      await loadWorkflows();
      setShowTemplates(false);
    } catch (error) {
      console.error("Error creating workflow from template:", error);
      setError("Failed to create workflow from template.");
    }
  };

  const handleToggleActive = async (workflowId, isActive) => {
    try {
      await Workflow.update(workflowId, { is_active: !isActive });
      await loadWorkflows();
    } catch (error) {
      console.error("Error toggling workflow:", error);
      setError("Failed to update workflow status.");
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (window.confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      try {
        await Workflow.delete(workflowId);
        await loadWorkflows();
      } catch (error) {
        console.error("Error deleting workflow:", error);
        setError("Failed to delete workflow.");
      }
    }
  };

  const executeWorkflow = async (workflow) => {
    setSelectedWorkflow(workflow);
    setShowExecutionModal(true);
  };

  const confirmExecuteWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      if (selectedWorkflow.trigger?.type === 'ticket_created') {
        const tickets = await GDSTicket.filter({ agency_id: currentUser.agency_id }, '-created_date', 1);
        if (tickets.length === 0) {
          alert("No recent ticket found to trigger this workflow. Please process a GDS file first.");
          setShowExecutionModal(false);
          return;
        }
        const trigger_data = tickets[0];

        const startTime = Date.now();
        const { data } = await executeWorkflowBackend({ 
          workflow_id: selectedWorkflow.id, 
          trigger_data,
          agency_id: currentUser.agency_id
        });
        const executionTime = Date.now() - startTime;

        // Update workflow with execution stats
        await Workflow.update(selectedWorkflow.id, {
          execution_count: (selectedWorkflow.execution_count || 0) + 1,
          successful_executions: (selectedWorkflow.successful_executions || 0) + 1,
          last_execution: new Date().toISOString(),
          avg_execution_time: ((selectedWorkflow.avg_execution_time || 0) + executionTime) / 2
        });

        // Add to execution history
        setExecutionHistory(prev => [{
          id: Date.now(),
          workflow_id: selectedWorkflow.id,
          workflow_name: selectedWorkflow.name,
          status: 'success',
          execution_time: executionTime,
          timestamp: new Date().toISOString(),
          result: data
        }, ...prev.slice(0, 9)]); // Keep last 10 executions

        alert(`Execution successful: ${data.log?.join(', ') || 'Workflow completed'}`);
        await loadWorkflows();
      } else {
        alert("This workflow cannot be triggered manually from this interface yet.");
      }
    } catch (error) {
      console.error("Workflow execution failed:", error);
      
      // Update workflow with failed execution
      await Workflow.update(selectedWorkflow.id, {
        execution_count: (selectedWorkflow.execution_count || 0) + 1,
        failed_executions: (selectedWorkflow.failed_executions || 0) + 1,
        last_execution: new Date().toISOString()
      });

      // Add to execution history
      setExecutionHistory(prev => [{
        id: Date.now(),
        workflow_id: selectedWorkflow.id,
        workflow_name: selectedWorkflow.name,
        status: 'failed',
        execution_time: 0,
        timestamp: new Date().toISOString(),
        error: error.message
      }, ...prev.slice(0, 9)]);

      alert("Workflow execution failed. See console for details.");
    } finally {
      setShowExecutionModal(false);
      setSelectedWorkflow(null);
    }
  };

  const getTriggerDescription = (trigger) => {
    switch (trigger?.type) {
      case 'ticket_created': return 'When new ticket is processed';
      case 'invoice_overdue': return `When invoice is ${trigger.conditions?.days || 7} days overdue`;
      case 'ticket_near_expiry': return `${trigger.conditions?.days_before || 3} days before ticket expires`;
      case 'manual': return 'Manual execution only';
      case 'client_registered': return 'When a new client registers';
      case 'scheduled': return `Scheduled (${trigger.schedule || 'daily'})`;
      case 'payment_received': return 'When payment is received';
      case 'lead_created': return 'When new lead is created';
      case 'booking_confirmed': return 'When booking is confirmed';
      default: return 'Unknown trigger';
    }
  };

  const getStepDescription = (steps) => {
    if (!steps || steps.length === 0) return 'No steps configured';
    return `${steps.length} step${steps.length > 1 ? 's' : ''}: ${steps.map(s => s.type.replace(/_/g, ' ')).join(', ')}`;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'sales': return 'bg-blue-100 text-blue-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'client_management': return 'bg-purple-100 text-purple-800';
      case 'operations': return 'bg-orange-100 text-orange-800';
      case 'analytics': return 'bg-indigo-100 text-indigo-800';
      case 'compliance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredWorkflows = useMemo(() => {
    let filtered = workflows;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(w => 
        w.name?.toLowerCase().includes(searchLower) ||
        w.description?.toLowerCase().includes(searchLower) ||
        w.category?.toLowerCase().includes(searchLower)
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(w => w.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(w => 
        filterStatus === 'active' ? w.is_active : !w.is_active
      );
    }

    return filtered;
  }, [workflows, searchTerm, filterCategory, filterStatus]);

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
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Workflow Automation</h1>
            <p className="text-amber-800/80">
              Automate repetitive tasks and streamline your operations.
              {currentUser ? ` Agency ID: ${currentUser.agency_id}` : ' Loading agency info...'}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={loadWorkflows} className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setShowTemplates(true)} className="bg-blue-100/50 backdrop-blur-sm text-blue-900 border-blue-300/50 hover:bg-blue-100/70 rounded-xl shadow-sm">
              <Target className="w-4 h-4 mr-2" />
              Use Template
            </Button>
            <Button
              onClick={() => setShowBuilder(true)}
              className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700/80">Total Workflows</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.totalWorkflows}</p>
                </div>
                <WorkflowIcon className="w-8 h-8 text-amber-800" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50/50 backdrop-blur-md border border-green-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700/80">Active Workflows</p>
                  <p className="text-2xl font-bold text-green-700">{stats.activeWorkflows}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.totalWorkflows > 0 ? `${((stats.activeWorkflows / stats.totalWorkflows) * 100).toFixed(1)}% active` : 'No workflows'}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50/50 backdrop-blur-md border border-blue-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700/80">Total Executions</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalExecutions}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {stats.recentExecutions} recent
                  </p>
                </div>
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50/50 backdrop-blur-md border border-orange-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700/80">Success Rate</p>
                  <p className="text-2xl font-bold text-orange-700">{stats.successRate.toFixed(1)}%</p>
                  <p className="text-xs text-orange-600 mt-1">
                    {stats.failedExecutions} failed
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-orange-600" />
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600" />
                  <input
                    type="text"
                    placeholder="Search workflows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-amber-100/50 border border-amber-300/50 text-amber-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full md:w-[180px] bg-amber-100/50 border-amber-300/50 text-amber-900">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-50/90 border-amber-200/50">
                    <SelectItem value="all" className="text-amber-900 hover:bg-amber-100">All Categories</SelectItem>
                    <SelectItem value="sales" className="text-amber-900 hover:bg-amber-100">Sales</SelectItem>
                    <SelectItem value="financial" className="text-amber-900 hover:bg-amber-100">Financial</SelectItem>
                    <SelectItem value="operations" className="text-amber-900 hover:bg-amber-100">Operations</SelectItem>
                    <SelectItem value="analytics" className="text-amber-900 hover:bg-amber-100">Analytics</SelectItem>
                    <SelectItem value="client_management" className="text-amber-900 hover:bg-amber-100">Client Management</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[180px] bg-amber-100/50 border-amber-300/50 text-amber-900">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-50/90 border-amber-200/50">
                    <SelectItem value="all" className="text-amber-900 hover:bg-amber-100">All Status</SelectItem>
                    <SelectItem value="active" className="text-amber-900 hover:bg-amber-100">Active</SelectItem>
                    <SelectItem value="inactive" className="text-amber-900 hover:bg-amber-100">Inactive</SelectItem>
                  </SelectContent>
                </Select>

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

        {/* Quick Setup Banner */}
        {workflows.length === 0 && !loading && (
          <Card className="mb-8 bg-gradient-to-r from-amber-200/50 to-amber-300/50 backdrop-blur-md border border-amber-300/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-800 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900 text-lg">Automate Your Travel Operations</h3>
                  <p className="text-amber-800/80">Set up automated workflows to handle invoicing, payment reminders, and ticket management without manual intervention.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowTemplates(true)}
                    className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Start with Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowBuilder(true)}
                    className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Build Custom
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Workflows List */}
        <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <WorkflowIcon className="w-5 h-5" />
              Workflows ({filteredWorkflows.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 bg-amber-100/30 border border-amber-200/50 rounded-lg animate-pulse">
                    <div className="h-4 bg-amber-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-amber-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredWorkflows.length > 0 ? (
              <div className="space-y-4">
                {filteredWorkflows.map((workflow) => (
                  <div key={workflow.id} className="p-4 bg-amber-100/30 border border-amber-200/50 rounded-lg hover:shadow-lg transition-shadow backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-amber-900">{workflow.name}</h4>
                          <Badge className={workflow.is_active ? 'bg-green-200/50 text-green-800 border-green-300/50 backdrop-blur-sm' : 'bg-gray-200/50 text-gray-800 border-gray-300/50 backdrop-blur-sm'}>
                            {workflow.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge className={`${getCategoryColor(workflow.category)} backdrop-blur-sm`}>
                            {workflow.category?.replace('_', ' ')}
                          </Badge>
                          {workflow.execution_count > 0 && (
                            <Badge variant="outline" className="text-xs text-amber-800 border-amber-300/50 bg-amber-100/50">
                              {workflow.execution_count} runs
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-amber-800/80 mb-2">{workflow.description}</p>
                        <div className="flex items-center gap-4 text-xs text-amber-700/80">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getTriggerDescription(workflow.trigger)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Settings className="w-3 h-3" />
                            {getStepDescription(workflow.steps)}
                          </span>
                          {workflow.last_execution && (
                            <span>
                              Last run: {new Date(workflow.last_execution).toLocaleDateString()}
                            </span>
                          )}
                          {workflow.avg_execution_time > 0 && (
                            <span>
                              Avg: {workflow.avg_execution_time}ms
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={workflow.is_active}
                          onCheckedChange={() => handleToggleActive(workflow.id, workflow.is_active)}
                        />
                        <Button size="sm" variant="outline" onClick={() => executeWorkflow(workflow)} className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-lg shadow-sm">
                          <Play className="w-3 h-3 mr-1" />
                          Run Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingWorkflow(workflow);
                            setShowBuilder(true);
                          }}
                          className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-lg shadow-sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                          className="text-red-600 hover:bg-red-100/50 border-red-300/50 bg-red-50/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {workflow.steps && workflow.steps.length > 0 && (
                      <div className="bg-amber-100/40 rounded-lg p-3 backdrop-blur-sm border border-amber-200/30">
                        <h5 className="text-sm font-medium text-amber-900 mb-2">Workflow Steps:</h5>
                        <div className="flex items-center gap-2 flex-wrap">
                          {workflow.steps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs text-amber-800 border-amber-300/50 bg-amber-100/50">
                                {step.type.replace(/_/g, ' ')}
                              </Badge>
                              {index < workflow.steps.length - 1 && (
                                <ArrowRight className="w-3 h-3 text-amber-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <WorkflowIcon className="w-16 h-16 text-amber-400 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-amber-900 mb-2">No Workflows Found</h3>
                <p className="text-amber-800/80 mb-6">
                  {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                    ? 'No workflows match your current filters. Try adjusting your search criteria.'
                    : 'Create your first workflow to start automating your travel operations.'
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setShowTemplates(true)}
                    className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Browse Templates
                  </Button>
                  <Button variant="outline" onClick={() => setShowBuilder(true)} className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Build from Scratch
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Template Selection Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="bg-amber-50/80 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-900">Choose a Workflow Template</CardTitle>
                  <Button variant="ghost" onClick={() => setShowTemplates(false)} className="text-amber-800 hover:bg-amber-800/10">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {WORKFLOW_TEMPLATES.map((template) => (
                    <Card key={template.id} className="bg-amber-100/50 border-2 border-amber-200/50 hover:border-amber-400/50 transition-colors cursor-pointer backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={`${getCategoryColor(template.category)} backdrop-blur-sm`}>
                            {template.category?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-amber-900 text-lg mb-2">{template.name}</h3>
                        <p className="text-amber-800/80 mb-4">{template.description}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-amber-700/80" />
                            <span className="text-amber-800/90">{getTriggerDescription(template.trigger)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Settings className="w-4 h-4 text-amber-700/80" />
                            <span className="text-amber-800/90">{getStepDescription(template.steps)}</span>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-amber-800 text-white hover:bg-amber-900 rounded-xl"
                          onClick={() => handleCreateFromTemplate(template)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Use This Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-amber-300/50">
                  <Button
                    variant="outline"
                    className="w-full bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
                    onClick={() => {
                      setShowTemplates(false);
                      setShowBuilder(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Custom Workflow Instead
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Execution Confirmation Modal */}
        {showExecutionModal && selectedWorkflow && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="bg-amber-50/80 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-900">Execute Workflow</CardTitle>
                  <Button variant="ghost" onClick={() => setShowExecutionModal(false)} className="text-amber-800 hover:bg-amber-800/10">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-amber-100/50 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">{selectedWorkflow.name}</h4>
                  <p className="text-sm text-amber-800/80 mb-2">{selectedWorkflow.description}</p>
                  <div className="text-xs text-amber-700/80">
                    <p>Trigger: {getTriggerDescription(selectedWorkflow.trigger)}</p>
                    <p>Steps: {getStepDescription(selectedWorkflow.steps)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowExecutionModal(false)}
                    className="flex-1 bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmExecuteWorkflow}
                    className="flex-1 bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Execute Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Workflow Builder Modal */}
        {showBuilder && (
          <WorkflowBuilder
            workflow={editingWorkflow}
            onClose={() => {
              setShowBuilder(false);
              setEditingWorkflow(null);
            }}
            onSave={async (workflowData) => {
              try {
                if (editingWorkflow) {
                  await Workflow.update(editingWorkflow.id, workflowData);
                } else {
                  await Workflow.create({
                    ...workflowData,
                    agency_id: currentUser.agency_id,
                    created_by: currentUser.id,
                    created_date: new Date().toISOString()
                  });
                }
                await loadWorkflows();
                setShowBuilder(false);
                setEditingWorkflow(null);
              } catch (error) {
                console.error("Error saving workflow:", error);
                setError("Failed to save workflow.");
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
