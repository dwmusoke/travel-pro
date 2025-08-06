import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Target, 
  Calendar, 
  DollarSign,
  FileText,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Plane,
  Zap
} from "lucide-react";

export default function SalesStats({ stats }) {
  const conversionRate = stats.totalLeads > 0 ? ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1) : 0;
  const bookingCompletionRate = stats.totalBookings > 0 ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1) : 0;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Leads Stats */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Leads</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalLeads}</p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <p className="text-xs text-green-600">{stats.convertedLeads} converted ({conversionRate}%)</p>
              </div>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Bookings Stats */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Bookings</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalBookings}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-blue-600" />
                <p className="text-xs text-blue-600">{stats.pendingBookings || 0} pending</p>
              </div>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* PNR Tickets Stats - NEW */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">PNR Tickets</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalTickets || 0}</p>
              <div className="flex items-center gap-1 mt-1">
                {stats.ticketsPendingBooking > 0 ? (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <p className="text-xs text-amber-600">{stats.ticketsPendingBooking} pending conversion</p>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-green-600">{stats.ticketConversionRate || 0}% conversion rate</p>
                  </>
                )}
              </div>
            </div>
            <Plane className="w-8 h-8 text-amber-500" />
          </div>
        </CardContent>
      </Card>

      {/* Revenue Stats */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalRevenue.toFixed(0)}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-purple-600" />
                <p className="text-xs text-purple-600">One-time bookings</p>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      {/* Recurring Revenue Stats */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Monthly Recurring</p>
              <p className="text-2xl font-bold text-slate-900">${stats.monthlyRecurringRevenue.toFixed(0)}</p>
              <div className="flex items-center gap-1 mt-1">
                <RefreshCw className="w-3 h-3 text-orange-600" />
                <p className="text-xs text-orange-600">{stats.activeSubscriptions} active subscriptions</p>
              </div>
            </div>
            <RefreshCw className="w-8 h-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      {/* Estimates Stats */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Estimates</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingEstimates}</p>
              <div className="flex items-center gap-1 mt-1">
                <FileText className="w-3 h-3 text-indigo-600" />
                <p className="text-xs text-indigo-600">Awaiting response</p>
              </div>
            </div>
            <FileText className="w-8 h-8 text-indigo-500" />
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate Stats */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Lead Conversion</p>
              <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
              <div className="flex items-center gap-1 mt-1">
                <Target className="w-3 h-3 text-red-600" />
                <p className="text-xs text-red-600">{stats.convertedLeads} of {stats.totalLeads} leads</p>
              </div>
            </div>
            <Target className="w-8 h-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      {/* Ticket Conversion Stats - NEW */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Ticket Conversion</p>
              <p className="text-2xl font-bold text-slate-900">{stats.ticketConversionRate || 0}%</p>
              <div className="flex items-center gap-1 mt-1">
                <Zap className="w-3 h-3 text-amber-600" />
                <p className="text-xs text-amber-600">PNR to booking rate</p>
              </div>
            </div>
            <Zap className="w-8 h-8 text-amber-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}