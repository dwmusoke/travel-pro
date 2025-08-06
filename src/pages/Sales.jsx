
import React, { useState, useEffect } from "react";
import { Lead, Booking, Estimate, RecurringBilling, GDSTicket } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, X, Plane, FileText, AlertCircle, CheckCircle } from "lucide-react"; // Added icons

import LeadManager from "../components/sales/LeadManager";
import BookingManager from "../components/sales/BookingManager";
import EstimateManager from "../components/sales/EstimateManager";
import RecurringBillingManager from "../components/sales/RecurringBillingManager";
import SalesStats from "../components/sales/SalesStats";
import BookingForm from "../components/sales/BookingForm"; // Import new form
import BookingDetailView from "../components/sales/BookingDetailView"; // Import new view
import RecurringBillingForm from "../components/sales/RecurringBillingForm"; // Import RecurringBillingForm
import RecurringBillingView from "../components/sales/RecurringBillingView"; // Import RecurringBillingView
import { User } from "@/api/entities"; // Import User entity

// Placeholder components for forms within modals to ensure file is functional
// NOTE: RecurringBillingForm placeholder is removed as it's now imported

const LeadForm = ({ onClose, onSave, initialData }) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-4 text-amber-800">
      {initialData ? "Edit Lead" : "Add New Lead"}
    </h3>
    <p className="text-amber-700 mb-4">
      {initialData
        ? `Editing lead for ${initialData.name}.`
        : "Enter the details for your new lead."}
    </p>
    {/* In a real application, form fields would go here */}
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button
        onClick={() => {
          // Simulate saving data
          console.log("Saving lead:", initialData || "New Lead Data");
          onSave(); // Trigger data refresh
          onClose();
        }}
        className="bg-amber-800 hover:bg-amber-900"
      >
        Save Lead
      </Button>
    </div>
  </div>
);

export default function Sales() {
  const [activeTab, setActiveTab] = useState("leads");
  const [leads, setLeads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [recurringBilling, setRecurringBilling] = useState([]);
  const [ticketsPendingBooking, setTicketsPendingBooking] = useState([]); // New state for PNR tickets
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    totalBookings: 0,
    pendingBookings: 0, // Added
    completedBookings: 0, // Added
    totalRevenue: 0,
    totalBookingsValue: 0, // Added
    pendingEstimates: 0,
    activeSubscriptions: 0,
    monthlyRecurringRevenue: 0,
    // New ticket-related stats
    totalTickets: 0,
    ticketsPendingBooking: 0,
    ticketConversionRate: 0,
  });
  const [currentUser, setCurrentUser] = useState(null); // Added currentUser state

  // New states for modal management
  const [activeModal, setActiveModal] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null); // For view/edit
  const [isBookingViewOpen, setIsBookingViewOpen] = useState(false); // For view modal
  const [selectedRecurring, setSelectedRecurring] = useState(null); // For recurring billing view/edit
  const [isRecurringViewOpen, setIsRecurringViewOpen] = useState(false); // For recurring billing view modal
  const [selectedTicket, setSelectedTicket] = useState(null); // For ticket to booking conversion

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      if (!user.agency_id) {
        console.error("User has no agency_id - cannot load sales data");
        setLeads([]);
        setBookings([]);
        setEstimates([]);
        setRecurringBilling([]);
        setTicketsPendingBooking([]);
        setLoading(false);
        return;
      }

      console.log(`Loading sales data for agency: ${user.agency_id}`);

      // Load all data in parallel
      const [leadsList, bookingsList, estimatesList, recurringList, ticketsList] = await Promise.all([
        Lead.filter({ agency_id: user.agency_id }, '-created_date', 100),
        Booking.filter({ agency_id: user.agency_id }, '-created_date', 100),
        Estimate.filter({ agency_id: user.agency_id }, '-created_date', 100),
        RecurringBilling.filter({ agency_id: user.agency_id }, '-created_date', 100),
        GDSTicket.filter({ agency_id: user.agency_id }, '-created_date', 100)
      ]);

      console.log(`Loaded ${leadsList.length} leads, ${bookingsList.length} bookings, ${estimatesList.length} estimates, ${recurringList.length} recurring billing, ${ticketsList.length} tickets`);

      setLeads(leadsList);
      setBookings(bookingsList);
      setEstimates(estimatesList);
      setRecurringBilling(recurringList);

      // Filter tickets that are ready for booking creation
      const pendingTickets = ticketsList.filter(ticket => 
        ticket.processing_status === 'completed' && 
        !ticket.booking_id &&
        ticket.status === 'active'
      );
      setTicketsPendingBooking(pendingTickets);

      calculateStats(leadsList, bookingsList, estimatesList, recurringList, ticketsList);
    } catch (error) {
      console.error("Error loading sales data:", error);
      setLeads([]);
      setBookings([]);
      setEstimates([]);
      setRecurringBilling([]);
      setTicketsPendingBooking([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leadsList, bookingsList, estimatesList, recurringList, ticketsList) => {
    const convertedLeads = leadsList.filter(lead => lead.converted_to_booking).length;
    const pendingBookings = bookingsList.filter(booking => booking.status === 'pending').length;
    const completedBookings = bookingsList.filter(booking => booking.status === 'completed').length;
    const totalBookingsValue = bookingsList.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
    const pendingEstimates = estimatesList.filter(estimate => estimate.status === 'pending').length;
    const activeSubscriptions = recurringList.filter(sub => sub.status === 'active').length;
    const monthlyRecurringRevenue = recurringList
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + (sub.amount || 0), 0);

    // Calculate ticket conversion metrics
    const totalTickets = ticketsList.length;
    const ticketsPendingBooking = ticketsList.filter(ticket => 
      ticket.processing_status === 'completed' && 
      !ticket.booking_id &&
      ticket.status === 'active'
    ).length;
    const convertedTickets = ticketsList.filter(ticket => ticket.booking_id).length;
    const ticketConversionRate = totalTickets > 0 ? (convertedTickets / totalTickets) * 100 : 0;

    setStats({
      totalLeads: leadsList.length,
      convertedLeads,
      totalBookings: bookingsList.length,
      pendingBookings,
      completedBookings,
      totalRevenue: totalBookingsValue,
      totalBookingsValue,
      pendingEstimates,
      activeSubscriptions,
      monthlyRecurringRevenue,
      totalTickets,
      ticketsPendingBooking,
      ticketConversionRate: Math.round(ticketConversionRate * 100) / 100
    });
  };

  const handleDataUpdate = () => {
    loadSalesData();
  };

  const openBookingForm = (booking = null) => {
    setSelectedBooking(booking);
    setActiveModal("booking");
  };

  const openBookingView = (booking) => {
    setSelectedBooking(booking);
    setIsBookingViewOpen(true);
  };

  const openRecurringForm = (recurring = null) => {
    setSelectedRecurring(recurring);
    setActiveModal("recurring");
  };

  const openRecurringView = (recurring) => {
    setSelectedRecurring(recurring);
    setIsRecurringViewOpen(true);
  };

  // New function to handle ticket to booking conversion
  const openTicketToBooking = (ticket) => {
    setSelectedTicket(ticket);
    setActiveModal("ticket-to-booking");
  };

  const createBookingFromTicket = async (ticketData) => {
    try {
      // Create booking from ticket data
      const booking = await Booking.create({
        client_id: ticketData.client_id,
        booking_type: 'flight',
        status: 'confirmed',
        travel_dates: {
          departure_date: ticketData.flight_segments?.[0]?.departure_date,
          return_date: ticketData.flight_segments?.[ticketData.flight_segments.length - 1]?.arrival_date
        },
        destinations: ticketData.flight_segments?.map(segment => segment.destination) || [],
        passengers: [{ name: ticketData.passenger_name }],
        services: [{
          name: 'Flight Ticket',
          quantity: 1,
          unit_price: ticketData.total_amount,
          total_price: ticketData.total_amount
        }],
        total_amount: ticketData.total_amount,
        currency: ticketData.currency || 'USD',
        payment_status: 'pending',
        ticket_id: ticketData.id,
        agency_id: ticketData.agency_id,
        booking_reference: ticketData.booking_reference
      });

      // Update ticket with booking reference
      await GDSTicket.update(ticketData.id, { 
        booking_id: booking.id,
        processing_status: 'booking_created'
      });

      // Refresh data
      await loadSalesData();
      setActiveModal(null);
      setSelectedTicket(null);

      return booking;
    } catch (error) {
      console.error("Error creating booking from ticket:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-amber-200 rounded w-1/4"></div>
            <div className="grid md:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-amber-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">Manage leads, bookings, estimates, and recurring billing</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setActiveModal("lead")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
          <Button onClick={() => openBookingForm()}>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Enhanced Stats with Ticket Information */}
      <SalesStats stats={stats} />

      {/* Pending Tickets Alert */}
      {ticketsPendingBooking.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plane className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-amber-800">
                    {ticketsPendingBooking.length} Ticket{ticketsPendingBooking.length > 1 ? 's' : ''} Ready for Booking Creation
                  </h3>
                  <p className="text-sm text-amber-700">
                    PNR tickets have been processed and are ready to be converted to bookings
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("tickets")}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                View Tickets
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="tickets">PNR Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <LeadManager 
            leads={leads} 
            onUpdate={handleDataUpdate}
          />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <BookingManager 
            bookings={bookings} 
            onUpdate={handleDataUpdate}
            onAddBooking={() => openBookingForm()}
            onViewBooking={openBookingView}
            onEditBooking={openBookingForm}
          />
        </TabsContent>

        <TabsContent value="estimates" className="space-y-4">
          <EstimateManager 
            estimates={estimates} 
            onUpdate={handleDataUpdate}
          />
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <RecurringBillingManager 
            subscriptions={recurringBilling} 
            onUpdate={handleDataUpdate}
            onAddRecurring={() => openRecurringForm()}
            onViewSubscription={openRecurringView}
            onEditSubscription={openRecurringForm}
          />
        </TabsContent>

        {/* New Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                PNR Tickets Pending Booking Creation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsPendingBooking.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Plane className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No tickets pending booking creation</p>
                  <p className="text-sm">All PNR tickets have been processed or converted to bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ticketsPendingBooking.map((ticket) => (
                    <Card key={ticket.id} className="border-l-4 border-l-amber-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                {ticket.gds_source?.toUpperCase()}
                              </Badge>
                              <span className="font-medium">{ticket.passenger_name}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">{ticket.ticket_number}</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Email: {ticket.passenger_email}</p>
                              <p>Amount: {ticket.currency} {ticket.total_amount?.toFixed(2)}</p>
                              {ticket.flight_segments && ticket.flight_segments.length > 0 && (
                                <p>Route: {ticket.flight_segments[0].origin} → {ticket.flight_segments[ticket.flight_segments.length - 1].destination}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => openTicketToBooking(ticket)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create Booking
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <Dialog open={activeModal === "lead"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the details for your new lead.
            </DialogDescription>
          </DialogHeader>
          <LeadForm 
            onClose={() => setActiveModal(null)} 
            onSave={handleDataUpdate}
            initialData={null}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "booking"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBooking ? "Edit Booking" : "Create New Booking"}
            </DialogTitle>
            <DialogDescription>
              {selectedBooking ? "Update booking details." : "Enter booking information."}
            </DialogDescription>
          </DialogHeader>
          <BookingForm
            initialData={selectedBooking}
            selectedLead={null}
            onSave={handleDataUpdate}
            onClose={() => setActiveModal(null)}
            agencyId={currentUser?.agency_id}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "recurring"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRecurring ? "Edit Recurring Billing" : "Create New Recurring Billing"}
            </DialogTitle>
            <DialogDescription>
              {selectedRecurring ? "Update recurring billing details." : "Enter recurring billing information."}
            </DialogDescription>
          </DialogHeader>
          <RecurringBillingForm
            initialData={selectedRecurring}
            onSave={handleDataUpdate}
            onClose={() => setActiveModal(null)}
            agencyId={currentUser?.agency_id}
          />
        </DialogContent>
      </Dialog>

      {/* Ticket to Booking Modal */}
      <Dialog open={activeModal === "ticket-to-booking"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Create Booking from PNR Ticket
            </DialogTitle>
            <DialogDescription>
              Convert PNR ticket to a booking in the sales system.
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ticket Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Passenger</label>
                      <p className="text-sm text-gray-600">{selectedTicket.passenger_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Ticket Number</label>
                      <p className="text-sm text-gray-600">{selectedTicket.ticket_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm text-gray-600">{selectedTicket.passenger_email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Amount</label>
                      <p className="text-sm text-gray-600">{selectedTicket.currency} {selectedTicket.total_amount?.toFixed(2)}</p>
                    </div>
                  </div>
                  {selectedTicket.flight_segments && selectedTicket.flight_segments.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Flight Route</label>
                      <p className="text-sm text-gray-600">
                        {selectedTicket.flight_segments[0].origin} → {selectedTicket.flight_segments[selectedTicket.flight_segments.length - 1].destination}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createBookingFromTicket(selectedTicket)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Modals */}
      <Dialog open={isBookingViewOpen} onOpenChange={setIsBookingViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <BookingDetailView 
              booking={selectedBooking}
              onClose={() => setIsBookingViewOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRecurringViewOpen} onOpenChange={setIsRecurringViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recurring Billing Details</DialogTitle>
          </DialogHeader>
          {selectedRecurring && (
            <RecurringBillingView 
              subscription={selectedRecurring}
              onClose={() => setIsRecurringViewOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
