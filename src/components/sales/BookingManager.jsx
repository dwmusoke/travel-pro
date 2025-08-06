import React, { useState } from "react";
import { Booking } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  Plane,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  FileText
} from "lucide-react";

export default function BookingManager({ bookings, onUpdate, onAddBooking, onViewBooking, onEditBooking }) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Enhanced filtering with search
  const filteredBookings = bookings.filter(booking => {
    const statusMatch = filter === "all" || booking.status === filter;
    const searchMatch = searchTerm === "" || 
      booking.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.destinations?.some(dest => dest.toLowerCase().includes(searchTerm.toLowerCase()));
    return statusMatch && searchMatch;
  }).sort((a, b) => {
    const aVal = a[sortBy] || "";
    const bVal = b[sortBy] || "";
    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'partially_paid': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBookingTypeIcon = (type) => {
    switch (type) {
      case 'flight': return <Plane className="w-4 h-4" />;
      case 'hotel': return <MapPin className="w-4 h-4" />;
      case 'package': return <Calendar className="w-4 h-4" />;
      case 'car_rental': return <MapPin className="w-4 h-4" />;
      case 'travel_insurance': return <FileText className="w-4 h-4" />;
      case 'visa_service': return <FileText className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        await Booking.delete(bookingId);
        onUpdate();
      } catch (error) {
        console.error("Error deleting booking:", error);
        alert("Failed to delete booking. Please try again.");
      }
    }
  };

  // Calculate booking stats
  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + (b.total_amount || 0), 0),
    pendingPayments: bookings.filter(b => b.payment_status === 'pending').reduce((sum, b) => sum + (b.total_amount || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Booking Management</h2>
          <p className="text-slate-600">Track and manage all client bookings</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onAddBooking} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
          <Button variant="outline" onClick={onUpdate} className="border-slate-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-900">{bookingStats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-700">{bookingStats.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Revenue</p>
                <p className="text-2xl font-bold text-purple-700">${bookingStats.totalRevenue.toFixed(0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Payment</p>
                <p className="text-2xl font-bold text-orange-700">${bookingStats.pendingPayments.toFixed(0)}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search bookings by reference, client name, email, or destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_date-desc">Newest First</SelectItem>
                  <SelectItem value="created_date-asc">Oldest First</SelectItem>
                  <SelectItem value="total_amount-desc">Highest Value</SelectItem>
                  <SelectItem value="total_amount-asc">Lowest Value</SelectItem>
                  <SelectItem value="client_name-asc">Client A-Z</SelectItem>
                  <SelectItem value="client_name-desc">Client Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { key: 'all', label: 'All', count: bookingStats.total },
          { key: 'pending', label: 'Pending', count: bookingStats.pending },
          { key: 'confirmed', label: 'Confirmed', count: bookingStats.confirmed },
          { key: 'completed', label: 'Completed', count: bookingStats.completed },
          { key: 'cancelled', label: 'Cancelled', count: bookingStats.cancelled }
        ].map((status) => (
          <Button
            key={status.key}
            variant={filter === status.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status.key)}
            className={`${filter === status.key ? "bg-blue-600" : ""} whitespace-nowrap`}
          >
            {status.label}
            <Badge variant="secondary" className="ml-2">
              {status.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Bookings List */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Bookings ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {getBookingTypeIcon(booking.booking_type)}
                          <h4 className="font-semibold text-slate-900">{booking.booking_reference}</h4>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <Badge className={getPaymentStatusColor(booking.payment_status)}>
                          {booking.payment_status?.replace('_', ' ')}
                        </Badge>
                        {booking.booking_type && (
                          <Badge variant="outline" className="capitalize">
                            {booking.booking_type.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600 mb-3">
                        <div className="space-y-1">
                          <p><strong>Client:</strong> {booking.client_name}</p>
                          <p><strong>Email:</strong> {booking.client_email}</p>
                          {booking.client_phone && (
                            <p><strong>Phone:</strong> {booking.client_phone}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          {booking.travel_dates?.departure_date && (
                            <p><strong>Departure:</strong> {new Date(booking.travel_dates.departure_date).toLocaleDateString()}</p>
                          )}
                          {booking.travel_dates?.return_date && (
                            <p><strong>Return:</strong> {new Date(booking.travel_dates.return_date).toLocaleDateString()}</p>
                          )}
                          <p><strong>Created:</strong> {new Date(booking.created_date).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {booking.destinations && booking.destinations.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-slate-600">
                            <strong>Destinations:</strong> {booking.destinations.join(', ')}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-lg">{booking.currency} {booking.total_amount?.toFixed(2)}</span>
                          </div>
                          {booking.passengers && booking.passengers.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-slate-500" />
                              <span>{booking.passengers.length} passenger{booking.passengers.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {booking.special_requirements && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                          <strong>Special Requirements:</strong> {booking.special_requirements}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => onViewBooking(booking)} className="w-20">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onEditBooking(booking)} className="w-20">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-600 hover:bg-red-50 w-20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-slate-900 mb-2">
                  {searchTerm || filter !== 'all' ? 'No Matching Bookings' : 'No Bookings Found'}
                </h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm || filter !== 'all' 
                    ? "Try adjusting your search or filter criteria."
                    : "Start converting your leads into confirmed bookings."
                  }
                </p>
                {!searchTerm && filter === 'all' && (
                  <Button onClick={onAddBooking} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Booking
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}