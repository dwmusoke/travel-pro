import React, { useState, useEffect, useMemo } from "react";
import { GDSTicket, User, Booking, Invoice } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Download, 
  Plane, 
  Ticket, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  MoreHorizontal, 
  DollarSign, 
  Zap, 
  Upload, 
  FileText,
  Eye,
  Edit,
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity,
  Users,
  CreditCard,
  ArrowRight,
  ExternalLink,
  Copy,
  Send,
  Mail,
  MessageSquare
} from "lucide-react";
import { format, isBefore, parseISO, addDays, differenceInDays } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";

// Enhanced Ticket Detail Modal
const TicketDetailModal = ({ ticket, isOpen, onClose, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [relatedBookings, setRelatedBookings] = useState([]);
  const [relatedInvoices, setRelatedInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && ticket?.id) {
      loadRelatedData();
    }
  }, [isOpen, ticket?.id]);

  const loadRelatedData = async () => {
    setLoading(true);
    try {
      // Load related bookings and invoices
      const [bookings, invoices] = await Promise.all([
        Booking.filter({ ticket_id: ticket.id }, '-created_date', 10),
        Invoice.filter({ ticket_id: ticket.id }, '-created_date', 10)
      ]);
      setRelatedBookings(bookings);
      setRelatedInvoices(invoices);
    } catch (error) {
      console.error("Error loading related data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Needs Attention': return { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle };
      case 'Unflown':
      case 'Unflown (No Segments)':
      case 'Unflown (Invalid Date)': return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Plane };
      case 'Used': return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
      case 'Refunded': return { color: 'bg-slate-100 text-slate-800 border-slate-200', icon: RefreshCw };
      case 'Expired': return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle };
      default: return { color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };

  const statusInfo = getStatusInfo(ticket?.computedStatus);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Ticket Details: {ticket?.ticket_number}
          </DialogTitle>
          <DialogDescription>
            Comprehensive ticket information and related data.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="segments">Flight Segments</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="related">Related Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Ticket Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-amber-700">Ticket Number</Label>
                    <p className="font-semibold">{ticket?.ticket_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-amber-700">PNR</Label>
                    <p className="font-semibold">{ticket?.pnr}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-amber-700">Passenger</Label>
                    <p className="font-semibold">{ticket?.passenger_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-amber-700">GDS Source</Label>
                    <p className="font-semibold">{ticket?.gds_source}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-amber-700">Status</Label>
                    <Badge className={statusInfo.color}>
                      {statusInfo.icon && <statusInfo.icon className="w-3 h-3 mr-1" />}
                      {ticket?.computedStatus}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-amber-700">Total Amount</Label>
                    <p className="font-semibold">
                      {ticket?.currency} {ticket?.total_amount?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Travel Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ticket?.flight_segments && ticket.flight_segments.length > 0 ? (
                  <div className="space-y-3">
                    {ticket.flight_segments.map((segment, index) => (
                      <div key={index} className="p-3 bg-amber-100/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              {segment.origin} → {segment.destination}
                            </p>
                            <p className="text-sm text-amber-700">
                              {segment.departure_date && format(new Date(segment.departure_date), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{segment.airline}</p>
                            <p className="text-sm text-amber-700">{segment.flight_number}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-amber-700">No flight segments available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  Flight Segments Detail
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ticket?.flight_segments && ticket.flight_segments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Airline</TableHead>
                        <TableHead>Flight</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ticket.flight_segments.map((segment, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{segment.origin} → {segment.destination}</p>
                              <p className="text-sm text-amber-700">{segment.aircraft_type}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {segment.departure_date && format(new Date(segment.departure_date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>{segment.airline}</TableCell>
                          <TableCell>{segment.flight_number}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {segment.status || 'Confirmed'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-amber-700">No flight segments available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-amber-100/50 rounded-lg">
                    <p className="text-sm text-amber-700">Total Amount</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {ticket?.currency} {ticket?.total_amount?.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-100/50 rounded-lg">
                    <p className="text-sm text-green-700">Commission</p>
                    <p className="text-2xl font-bold text-green-900">
                      {ticket?.currency} {(ticket?.commission || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-100/50 rounded-lg">
                    <p className="text-sm text-blue-700">Net Revenue</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {ticket?.currency} {((ticket?.total_amount || 0) - (ticket?.commission || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-amber-700">Payment Status</Label>
                  <Badge variant={ticket?.payment_status === 'paid' ? 'default' : 'secondary'}>
                    {ticket?.payment_status || 'Pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="related" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Related Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : relatedBookings.length > 0 ? (
                  <div className="space-y-3">
                    {relatedBookings.map((booking) => (
                      <div key={booking.id} className="p-3 bg-amber-100/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{booking.booking_reference}</p>
                            <p className="text-sm text-amber-700">
                              {booking.travel_dates?.departure_date && format(new Date(booking.travel_dates.departure_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{booking.currency} {booking.total_amount?.toFixed(2)}</p>
                            <Badge variant="outline">{booking.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-amber-700">No related bookings found.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Related Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : relatedInvoices.length > 0 ? (
                  <div className="space-y-3">
                    {relatedInvoices.map((invoice) => (
                      <div key={invoice.id} className="p-3 bg-amber-100/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{invoice.invoice_number}</p>
                            <p className="text-sm text-amber-700">
                              {invoice.created_date && format(new Date(invoice.created_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{invoice.currency} {invoice.total_amount?.toFixed(2)}</p>
                            <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-amber-700">No related invoices found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default function TicketTracker() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("needs_attention");
  const [gdsFilter, setGdsFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("cards"); // cards or table

  const getComputedStatus = (ticket) => {
    if (ticket.status !== 'active') {
      return ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
    }
    
    const now = new Date();
    if (!ticket.flight_segments || ticket.flight_segments.length === 0) {
      return 'Unflown (No Segments)';
    }

    const lastDeparture = ticket.flight_segments.reduce((latest, segment) => {
      try {
        if (segment.departure_date) {
          const departure = parseISO(segment.departure_date);
          if (!isNaN(departure.getTime())) {
            return departure > latest ? departure : latest;
          }
        }
        return latest;
      } catch (e) {
        console.warn("Error parsing date:", e, segment.departure_date);
        return latest;
      }
    }, new Date(0));

    if (lastDeparture.getTime() === new Date(0).getTime()) {
      return 'Unflown (Invalid Date)';
    }

    if (isBefore(lastDeparture, now)) {
      return 'Needs Attention';
    }

    return 'Unflown';
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      if (user && user.agency_id) {
        const allTickets = await GDSTicket.filter({ agency_id: user.agency_id }, '-created_date', 100);
        const ticketsWithStatus = allTickets.map(ticket => ({
          ...ticket,
          computedStatus: getComputedStatus(ticket)
        }));
        setTickets(ticketsWithStatus);
      } else {
        console.warn("User has no agency assigned or user data not found.");
        setTickets([]);
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);
  
  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await GDSTicket.update(ticketId, { status: newStatus });
      await loadTickets();
    } catch(error) {
      console.error("Failed to update ticket status:", error);
    }
  };

  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    // Status filter
    if (statusFilter === "all") {
      filtered = filtered;
    } else if (statusFilter === "needs_attention") {
      filtered = filtered.filter(ticket => ticket.computedStatus === 'Needs Attention');
    } else if (statusFilter === "unflown") {
      filtered = filtered.filter(ticket => ['Unflown', 'Unflown (No Segments)', 'Unflown (Invalid Date)'].includes(ticket.computedStatus));
    } else {
      filtered = filtered.filter(ticket => ticket.computedStatus.toLowerCase() === statusFilter);
    }

    // GDS filter
    if (gdsFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.gds_source === gdsFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(ticket => {
        if (!ticket.flight_segments || ticket.flight_segments.length === 0) return false;
        
        const lastDeparture = ticket.flight_segments.reduce((latest, segment) => {
          try {
            if (segment.departure_date) {
              const departure = parseISO(segment.departure_date);
              if (!isNaN(departure.getTime())) {
                return departure > latest ? departure : latest;
              }
            }
            return latest;
          } catch (e) {
            return latest;
          }
        }, new Date(0));

        if (lastDeparture.getTime() === new Date(0).getTime()) return false;

        const daysUntilDeparture = differenceInDays(lastDeparture, now);

        switch (dateFilter) {
          case "today":
            return daysUntilDeparture === 0;
          case "tomorrow":
            return daysUntilDeparture === 1;
          case "this_week":
            return daysUntilDeparture >= 0 && daysUntilDeparture <= 7;
          case "this_month":
            return daysUntilDeparture >= 0 && daysUntilDeparture <= 30;
          case "overdue":
            return daysUntilDeparture < 0;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.pnr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.gds_source?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [tickets, statusFilter, searchTerm, gdsFilter, dateFilter]);

  const getStatusInfo = (computedStatus) => {
    switch (computedStatus) {
      case 'Needs Attention': return { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle };
      case 'Unflown':
      case 'Unflown (No Segments)':
      case 'Unflown (Invalid Date)': return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Plane };
      case 'Used': return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
      case 'Refunded': return { color: 'bg-slate-100 text-slate-800 border-slate-200', icon: RefreshCw };
      case 'Expired': return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle };
      default: return { color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };

  const exportToExcel = () => {
    const escapeCsvField = (field) => {
      if (typeof field === 'string') {
        const needsQuotes = field.includes(',') || field.includes('"') || field.includes('\n');
        const escapedField = field.replace(/"/g, '""');
        return needsQuotes ? `"${escapedField}"` : field;
      }
      return field;
    };

    const dataToExport = filteredTickets.map(t => {
      let lastDepartureDate = 'N/A';
      if (t.flight_segments?.length > 0 && t.flight_segments[t.flight_segments.length - 1].departure_date) {
        try {
          const departure = parseISO(t.flight_segments[t.flight_segments.length - 1].departure_date);
          if (!isNaN(departure.getTime()) && departure.getTime() !== new Date(0).getTime()) {
            lastDepartureDate = format(departure, 'yyyy-MM-dd');
          }
        } catch (e) {
          console.warn("Error parsing date for export:", e, t.flight_segments[t.flight_segments.length - 1].departure_date);
        }
      }

      return {
        'PNR': t.pnr,
        'Ticket Number': t.ticket_number,
        'Passenger': t.passenger_name,
        'Status': t.computedStatus,
        'GDS': t.gds_source,
        'Total Amount': t.total_amount?.toFixed(2),
        'Currency': t.currency,
        'Last Departure': lastDepartureDate
      };
    });
    
    if(dataToExport.length === 0) return;

    const headers = Object.keys(dataToExport[0]);
    const csvContent = [
      headers.map(escapeCsvField).join(','),
      ...dataToExport.map(row => headers.map(header => escapeCsvField(row[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ticket_tracker_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const needsAttentionTickets = useMemo(() => tickets.filter(t => t.computedStatus === 'Needs Attention'), [tickets]);
  const unflownTickets = useMemo(() => tickets.filter(t => ['Unflown', 'Unflown (No Segments)', 'Unflown (Invalid Date)'].includes(t.computedStatus)), [tickets]);
  const usedTickets = useMemo(() => tickets.filter(t => t.computedStatus === 'Used'), [tickets]);

  // Financial calculations
  const totalValue = useMemo(() => tickets.reduce((sum, t) => sum + (t.total_amount || 0), 0), [tickets]);
  const needsAttentionValue = useMemo(() => needsAttentionTickets.reduce((sum, t) => sum + (t.total_amount || 0), 0), [needsAttentionTickets]);
  const unflownValue = useMemo(() => unflownTickets.reduce((sum, t) => sum + (t.total_amount || 0), 0), [unflownTickets]);

  return (
    <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Ticket Tracker</h1>
            <p className="text-amber-800">Monitor and manage unflown, expired, and refundable tickets with comprehensive tracking.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportToExcel} disabled={filteredTickets.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
            <Button onClick={loadTickets} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Enhanced Alert Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">Needs Attention</p>
                  <p className="text-3xl font-bold text-red-900">
                    {needsAttentionTickets.length}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    ${needsAttentionValue.toFixed(2)} value
                  </p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              {needsAttentionTickets.length > 0 && (
                <Button 
                  size="sm" 
                  className="w-full mt-4 bg-red-600 hover:bg-red-700"
                  onClick={() => setStatusFilter('needs_attention')}
                >
                  Review Now
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Unflown Tickets</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {unflownTickets.length}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    ${unflownValue.toFixed(2)} value
                  </p>
                </div>
                <Plane className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Used Tickets</p>
                  <p className="text-3xl font-bold text-green-900">
                    {usedTickets.length}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Completed flights</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700">Total Value</p>
                  <p className="text-3xl font-bold text-amber-900">
                    ${totalValue.toFixed(2)}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">All tickets</p>
                </div>
                <DollarSign className="w-10 h-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="mb-8 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-amber-600" />
                <Input
                  placeholder="Search tickets by PNR, ticket number, passenger..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-amber-100/50 border-amber-300/50 text-amber-900 placeholder:text-amber-700/70"
                />
              </div>
              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-amber-100/50 border-amber-300/50 text-amber-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="needs_attention">Needs Attention</SelectItem>
                    <SelectItem value="unflown">Unflown</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={gdsFilter} onValueChange={setGdsFilter}>
                  <SelectTrigger className="w-32 bg-amber-100/50 border-amber-300/50 text-amber-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All GDS</SelectItem>
                    <SelectItem value="amadeus">Amadeus</SelectItem>
                    <SelectItem value="sabre">Sabre</SelectItem>
                    <SelectItem value="galileo">Galileo</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40 bg-amber-100/50 border-amber-300/50 text-amber-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === "cards" ? "default" : "outline"}
                    onClick={() => setViewMode("cards")}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "table" ? "default" : "outline"}
                    onClick={() => setViewMode("table")}
                  >
                    <Table className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Ticket Display */}
        <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-amber-900">
              <span className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                Ticket Inventory
              </span>
              <Badge variant="outline" className="bg-amber-100/50 text-amber-800 border-amber-300/50">
                {filteredTickets.length} tickets
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 bg-amber-100/40 border border-amber-300/50 rounded-xl animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-amber-200 rounded w-1/3"></div>
                        <div className="h-3 bg-amber-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === "cards" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map((ticket) => {
                  const statusInfo = getStatusInfo(ticket.computedStatus);
                  return (
                    <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-amber-900">{ticket.ticket_number}</h3>
                            <p className="text-sm text-amber-700">{ticket.pnr}</p>
                          </div>
                          <Badge className={statusInfo.color}>
                            {statusInfo.icon && <statusInfo.icon className="w-3 h-3 mr-1" />}
                            {ticket.computedStatus}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-amber-700">Passenger</p>
                            <p className="font-medium">{ticket.passenger_name}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-amber-700">Amount</p>
                            <p className="font-bold text-lg">
                              {ticket.currency} {ticket.total_amount?.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-amber-700">GDS</p>
                              <p className="font-medium">{ticket.gds_source}</p>
                            </div>
                            <div>
                              <p className="text-amber-700">Segments</p>
                              <p className="font-medium">{ticket.flight_segments?.length || 0}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <Button 
                            className="w-full" 
                            variant="outline"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setIsTicketModalOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Mail className="w-3 h-3 mr-1" />
                              Email
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              SMS
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>GDS</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => {
                    const statusInfo = getStatusInfo(ticket.computedStatus);
                    return (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.ticket_number}</p>
                            <p className="text-sm text-amber-700">{ticket.pnr}</p>
                          </div>
                        </TableCell>
                        <TableCell>{ticket.passenger_name}</TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            {statusInfo.icon && <statusInfo.icon className="w-3 h-3 mr-1" />}
                            {ticket.computedStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {ticket.currency} {ticket.total_amount?.toFixed(2)}
                          </p>
                        </TableCell>
                        <TableCell>{ticket.gds_source}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setIsTicketModalOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Send SMS
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            
            {!loading && filteredTickets.length === 0 && (
              <div className="text-center py-8">
                <Ticket className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                <p className="text-amber-700">No tickets found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Detail Modal */}
        {isTicketModalOpen && selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            isOpen={isTicketModalOpen}
            onClose={() => {
              setIsTicketModalOpen(false);
              setSelectedTicket(null);
            }}
            onUpdateStatus={handleStatusUpdate}
          />
        )}
      </div>
    </div>
  );
}