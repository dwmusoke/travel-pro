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
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  RefreshCw,
  Settings,
  Eye,
  PieChart,
  Activity,
  Zap,
  Brain,
  Lightbulb,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon
} from 'lucide-react';

export default function AdvancedReportingDashboard({ 
  financialData = {}, 
  onDateRangeChange,
  onExportReport 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'profit', 'cashflow']);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockData = {
    revenue: {
      current: 125000,
      previous: 118000,
      change: 5.93,
      trend: 'up'
    },
    profit: {
      current: 45000,
      previous: 42000,
      change: 7.14,
      trend: 'up'
    },
    cashflow: {
      current: 32000,
      previous: 28000,
      change: 14.29,
      trend: 'up'
    },
    expenses: {
      current: 80000,
      previous: 76000,
      change: 5.26,
      trend: 'up'
    },
    bookings: {
      current: 156,
      previous: 142,
      change: 9.86,
      trend: 'up'
    },
    clients: {
      current: 89,
      previous: 82,
      change: 8.54,
      trend: 'up'
    }
  };

  // AI-powered insights
  const aiInsights = [
    {
      type: 'positive',
      title: 'Revenue Growth Trend',
      description: 'Your revenue has increased by 5.93% compared to last period. This is above the industry average of 3.2%.',
      impact: 'high',
      action: 'Consider expanding successful routes or services.',
      icon: TrendingUpIcon
    },
    {
      type: 'warning',
      title: 'Expense Management',
      description: 'Expenses are growing faster than revenue (5.26% vs 5.93%). Monitor cost control measures.',
      impact: 'medium',
      action: 'Review vendor contracts and operational efficiency.',
      icon: AlertTriangleIcon
    },
    {
      type: 'positive',
      title: 'Cash Flow Improvement',
      description: 'Cash flow has improved significantly by 14.29%. This indicates better working capital management.',
      impact: 'high',
      action: 'Consider investing excess cash in growth opportunities.',
      icon: CheckCircleIcon
    },
    {
      type: 'info',
      title: 'Client Acquisition',
      description: 'New client acquisition rate is 8.54%, which is healthy for the industry.',
      impact: 'medium',
      action: 'Focus on client retention and upselling opportunities.',
      icon: TargetIcon
    }
  ];

  // Predictive analytics
  const predictions = {
    nextMonth: {
      revenue: 132000,
      profit: 48000,
      cashflow: 35000,
      confidence: 85
    },
    nextQuarter: {
      revenue: 410000,
      profit: 150000,
      cashflow: 110000,
      confidence: 72
    }
  };

  // Performance metrics
  const performanceMetrics = [
    { name: 'Revenue per Booking', value: '$801.28', change: '+2.3%', trend: 'up' },
    { name: 'Profit Margin', value: '36.0%', change: '+1.2%', trend: 'up' },
    { name: 'Client Lifetime Value', value: '$1,404', change: '+5.1%', trend: 'up' },
    { name: 'Booking Conversion Rate', value: '23.4%', change: '-0.8%', trend: 'down' },
    { name: 'Average Transaction Value', value: '$1,245', change: '+3.7%', trend: 'up' },
    { name: 'Customer Acquisition Cost', value: '$156', change: '-2.1%', trend: 'up' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    );
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(mockData).map(([key, data]) => (
          <Card key={key} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </CardTitle>
              <Badge variant={data.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                {formatPercentage(data.change)}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {key === 'revenue' || key === 'profit' || key === 'cashflow' || key === 'expenses' 
                  ? formatCurrency(data.current)
                  : data.current.toLocaleString()
                }
              </div>
              <p className="text-xs text-muted-foreground">
                vs {key === 'revenue' || key === 'profit' || key === 'cashflow' || key === 'expenses'
                  ? formatCurrency(data.previous)
                  : data.previous.toLocaleString()
                } last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'positive' ? 'bg-green-100 text-green-600' :
                    insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <insight.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.impact} impact
                      </Badge>
                      <span className="text-xs text-muted-foreground">{insight.action}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{metric.name}</p>
                  <p className="text-lg font-bold">{metric.value}</p>
                </div>
                <div className={`flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                  {getTrendIcon(metric.trend)}
                  <span className="text-sm font-medium">{metric.change}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      {/* Revenue Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Revenue by Category</h4>
              <div className="space-y-3">
                {[
                  { name: 'Flight Bookings', value: 65000, percentage: 52 },
                  { name: 'Hotel Bookings', value: 35000, percentage: 28 },
                  { name: 'Package Tours', value: 15000, percentage: 12 },
                  { name: 'Other Services', value: 10000, percentage: 8 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Monthly Trend</h4>
              <div className="space-y-3">
                {[
                  { month: 'Jan', revenue: 115000, target: 120000 },
                  { month: 'Feb', revenue: 125000, target: 120000 },
                  { month: 'Mar', revenue: 118000, target: 125000 },
                  { month: 'Apr', revenue: 132000, target: 130000 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">{formatCurrency(item.revenue)}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        item.revenue >= item.target ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Predictive Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Next Month Forecast</h4>
              <div className="space-y-3">
                {Object.entries(predictions.nextMonth).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {key === 'confidence' ? `${value}%` : formatCurrency(value)}
                      </span>
                      {key === 'confidence' && (
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Next Quarter Forecast</h4>
              <div className="space-y-3">
                {Object.entries(predictions.nextQuarter).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {key === 'confidence' ? `${value}%` : formatCurrency(value)}
                      </span>
                      {key === 'confidence' && (
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ReportsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Financial Reports</h3>
          <p className="text-sm text-muted-foreground">
            Generate and download comprehensive financial reports
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => onExportReport && onExportReport(dateRange)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'Profit & Loss Statement', icon: BarChart3, description: 'Comprehensive P&L analysis' },
          { name: 'Cash Flow Statement', icon: TrendingUp, description: 'Cash flow analysis and projections' },
          { name: 'Balance Sheet', icon: Target, description: 'Assets, liabilities, and equity' },
          { name: 'Revenue Analysis', icon: DollarSign, description: 'Detailed revenue breakdown' },
          { name: 'Expense Report', icon: TrendingDown, description: 'Expense categorization and trends' },
          { name: 'Client Profitability', icon: Users, description: 'Client-wise profitability analysis' }
        ].map((report, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <report.icon className="w-4 h-4" />
                {report.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{report.description}</p>
              <Button variant="outline" size="sm" className="mt-3">
                <Eye className="w-4 h-4 mr-2" />
                View Report
              </Button>
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
          <h2 className="text-2xl font-bold">Advanced Financial Dashboard</h2>
          <p className="text-muted-foreground">
            AI-powered insights, real-time analytics, and comprehensive reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInsightsModal(true)}>
            <Lightbulb className="w-4 h-4 mr-2" />
            AI Insights
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        
        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
        
        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
      </Tabs>

      {/* AI Insights Modal */}
      <Dialog open={showInsightsModal} onOpenChange={setShowInsightsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI-Powered Business Insights
            </DialogTitle>
            <DialogDescription>
              Detailed analysis and recommendations based on your financial data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {aiInsights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'positive' ? 'bg-green-100 text-green-600' :
                    insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <insight.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <p className="text-muted-foreground mt-1">{insight.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline">
                        {insight.impact} impact
                      </Badge>
                      <span className="text-sm text-muted-foreground">{insight.action}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInsightsModal(false)}>
              Close
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Insights
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 