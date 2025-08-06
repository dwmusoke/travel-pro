import React, { useState, useEffect } from "react";
import { Agency, User, GDSTicket } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download, Building, DollarSign, Users, Ticket, BarChart as BarChartIcon } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

export default function SystemAnalytics() {
  const [analyticsData, setAnalyticsData] = useState({
    activeAgencies: 0,
    platformRevenue: 0,
    totalUsers: 0,
    ticketsProcessed: 0,
    agencyGrowth: [],
    planDistribution: [],
    topAgencies: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const agencies = await Agency.list();
      const users = await User.list();
      const tickets = await GDSTicket.list(); // Be cautious with large datasets

      const activeAgencies = agencies.filter(a => a.is_active).length;
      
      // Simplified revenue calculation
      const platformRevenue = agencies
        .filter(a => a.subscription_status === 'active')
        .reduce((sum, a) => {
          if (a.subscription_plan === 'pro') sum += 99;
          if (a.subscription_plan === 'basic') sum += 49;
          return sum;
        }, 0);

      const planDistribution = agencies.reduce((acc, agency) => {
        const plan = agency.subscription_plan || 'N/A';
        const existing = acc.find(item => item.name === plan);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: plan, value: 1 });
        }
        return acc;
      }, []);

      setAnalyticsData({
        activeAgencies,
        platformRevenue,
        totalUsers: users.length,
        ticketsProcessed: tickets.length,
        agencyGrowth: [], // Placeholder for more complex query
        planDistribution,
        topAgencies: [], // Placeholder for more complex query
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">System Analytics</h1>
            <p className="text-amber-800/80">Platform-wide performance metrics and insights</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36 bg-amber-100/50 border-amber-300/50 text-amber-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-amber-50 border-amber-200">
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadAnalytics} className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <p className="text-sm text-amber-700/80">Active Agencies</p>
              <p className="text-2xl font-bold text-amber-900">{analyticsData.activeAgencies}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <p className="text-sm text-amber-700/80">Platform Revenue (MRR)</p>
              <p className="text-2xl font-bold text-amber-900">${analyticsData.platformRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <p className="text-sm text-amber-700/80">Total Users</p>
              <p className="text-2xl font-bold text-amber-900">{analyticsData.totalUsers}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <p className="text-sm text-amber-700/80">Tickets Processed</p>
              <p className="text-2xl font-bold text-amber-900">{analyticsData.ticketsProcessed.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardHeader><CardTitle className="text-amber-900">Agency Growth Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.agencyGrowth}>
                  <XAxis dataKey="name" stroke="#78350f" />
                  <YAxis stroke="#78350f" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(247, 243, 233, 0.8)', border: '1px solid #d4b382', color: '#78350f' }}/>
                  <Bar dataKey="agencies" fill="#c2a57c" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardHeader><CardTitle className="text-amber-900">Subscription Plan Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={analyticsData.planDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                    {analyticsData.planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(247, 243, 233, 0.8)', border: '1px solid #d4b382', color: '#78350f' }}/>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
          <CardHeader><CardTitle className="text-amber-900">Top Performing Agencies by Revenue</CardTitle></CardHeader>
          <CardContent>
            {/* Table or list of top agencies would go here */}
            <div className="text-center p-8 text-amber-700/80">
              Top agency performance data coming soon.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}