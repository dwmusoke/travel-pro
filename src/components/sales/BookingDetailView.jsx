import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Plane, MapPin, Users, DollarSign, Clock, Calendar, Info, Mail, Phone, 
  Building, CheckCircle, AlertCircle, FileText, CreditCard, Package
} from "lucide-react";

export default function BookingDetailView({ booking }) {
  if (!booking) return null;

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
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'hotel': return <Building className="w-5 h-5" />;
      case 'package': return <Package className="w-5 h-5" />;
      case 'car_rental': return <MapPin className="w-5 h-5" />;
      case 'travel_insurance': return <FileText className="w-5 h-5" />;
      case 'visa_service': return <FileText className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };
  
  return (
    <ScrollArea className="h-[70vh] p-1">
      <div className="space-y-6">
        {/* Header */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-amber-100/50 to-orange-100/50 border border-amber-200/50">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {getBookingTypeIcon(booking.booking_type)}
              <div>
                <h3 className="text-xl font-bold text-amber-900">{booking.booking_reference}</h3>
                <p className="text-amber-800/80 capitalize">{booking.booking_type?.replace('_', ' ')} Booking</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
              <Badge className={getPaymentStatusColor(booking.payment_status)}>
                {booking.payment_status?.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-900">{booking.currency} {booking.total_amount?.toFixed(2)}</p>
              <p className="text-sm text-amber-700">Total Amount</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-900">{booking.passengers?.length || 0}</p>
              <p className="text-sm text-amber-700">Passengers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-900">{booking.services?.length || 0}</p>
              <p className="text-sm text-amber-700">Services</p>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-amber-900 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Client Details
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-700" />
                <span className="font-medium">{booking.client_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-700" />
                <span>{booking.client_email}</span>
              </div>
              {booking.client_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-700" />
                  <span>{booking.client_phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-amber-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Travel Dates
            </h4>
            <div className="space-y-3 text-sm">
              {booking.travel_dates?.departure_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span>Departure: {new Date(booking.travel_dates.departure_date).toLocaleDateString()}</span>
                </div>
              )}
              {booking.travel_dates?.return_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span>Return: {new Date(booking.travel_dates.return_date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Created: {new Date(booking.created_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />
        
        {/* Destinations */}
        {booking.destinations?.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-900 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Destinations
            </h4>
            <div className="flex flex-wrap gap-2">
              {booking.destinations.map((dest, i) => (
                <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  <MapPin className="w-3 h-3 mr-1" />
                  {dest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Passengers */}
        {booking.passengers?.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-900 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Passengers ({booking.passengers.length})
            </h4>
            <div className="grid gap-2">
              {booking.passengers.map((passenger, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{passenger.name}</span>
                    <div className="flex gap-2 text-xs text-slate-600">
                      {passenger.age && <span>Age: {passenger.age}</span>}
                      {passenger.passport_number && <span>Passport: {passenger.passport_number}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services & Billing */}
        {booking.services?.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Services & Billing
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-slate-50 p-3 border-b">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-slate-700">
                  <span>Service</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Unit Price</span>
                  <span className="text-right">Total</span>
                </div>
              </div>
              <div className="divide-y">
                {booking.services.map((service, i) => (
                  <div key={i} className="p-3">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        {service.description && (
                          <p className="text-xs text-slate-600 mt-1">{service.description}</p>
                        )}
                      </div>
                      <span className="text-center">{service.quantity}</span>
                      <span className="text-right">{booking.currency} {service.unit_price?.toFixed(2)}</span>
                      <span className="text-right font-medium">
                        {booking.currency} {(service.quantity * service.unit_price)?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-slate-50">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Amount</span>
                    <span className="text-lg">{booking.currency} {booking.total_amount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Special Requirements */}
        {booking.special_requirements && (
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-900 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Special Requirements
            </h4>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">{booking.special_requirements}</p>
            </div>
          </div>
        )}

        {/* Booking Timeline */}
        <div className="space-y-3">
          <h4 className="font-semibold text-amber-900 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Booking Timeline
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-green-50 rounded border-l-4 border-green-400">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Booking Created</p>
                <p className="text-xs text-slate-600">{new Date(booking.created_date).toLocaleString()}</p>
              </div>
            </div>
            {booking.status === 'confirmed' && (
              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Booking Confirmed</p>
                  <p className="text-xs text-slate-600">Status updated to confirmed</p>
                </div>
              </div>
            )}
            {booking.payment_status === 'paid' && (
              <div className="flex items-center gap-3 p-2 bg-green-50 rounded border-l-4 border-green-400">
                <CreditCard className="w-4 h-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment Received</p>
                  <p className="text-xs text-slate-600">Full payment of {booking.currency} {booking.total_amount?.toFixed(2)} received</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </ScrollArea>
  );
}