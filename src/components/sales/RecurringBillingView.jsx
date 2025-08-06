import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DollarSign, Calendar, CreditCard, Users, CheckCircle, Clock, RefreshCw, Mail, Phone
} from "lucide-react";

export default function RecurringBillingView({ subscription }) {
  if (!subscription) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getServiceTypeLabel = (type) => {
    switch (type) {
      case 'travel_insurance': return 'Travel Insurance';
      case 'visa_monitoring': return 'Visa Monitoring';
      case 'loyalty_program': return 'Loyalty Program';
      case 'corporate_package': return 'Corporate Package';
      case 'maintenance_fee': return 'Maintenance Fee';
      default: return type.replace('_', ' ');
    }
  };

  const getFrequencyLabel = (frequency) => {
    switch (frequency) {
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'semi_annual': return 'Semi-Annual';
      case 'annual': return 'Annual';
      default: return frequency;
    }
  };
  
  return (
    <ScrollArea className="h-[70vh] p-1">
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-amber-100/30">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-amber-900">{subscription.subscription_name}</h3>
              <p className="text-amber-800/80">{getServiceTypeLabel(subscription.service_type)}</p>
            </div>
            <Badge className={getStatusColor(subscription.status)}>{subscription.status}</Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-amber-900">Client Details</h4>
            <div className="text-sm space-y-2">
              <p className="flex items-center gap-2"><Users className="w-4 h-4 text-amber-700" /> {subscription.client_name}</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-amber-700" /> {subscription.client_email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-amber-900">Billing Information</h4>
            <div className="text-sm space-y-2">
              <p className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-700" /> 
                {subscription.currency} {subscription.amount?.toFixed(2)} / {getFrequencyLabel(subscription.billing_frequency)}
              </p>
              <p className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-700" /> 
                {subscription.payment_method?.replace('_', ' ') || 'Not set'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-amber-900">Schedule</h4>
            <div className="text-sm space-y-2">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" /> 
                Start: {new Date(subscription.start_date).toLocaleDateString()}
              </p>
              {subscription.end_date && (
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-700" /> 
                  End: {new Date(subscription.end_date).toLocaleDateString()}
                </p>
              )}
              {subscription.next_billing_date && (
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700" /> 
                  Next Bill: {new Date(subscription.next_billing_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-amber-900">Revenue Summary</h4>
            <div className="text-sm space-y-2">
              <p className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" /> 
                Total Billed: {subscription.currency} {subscription.total_billed?.toFixed(2) || '0.00'}
              </p>
              <p className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600" /> 
                Auto-Renewal: {subscription.auto_renewal ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>

        {subscription.billing_history && subscription.billing_history.length > 0 && (
          <div>
            <h4 className="font-semibold text-amber-900 mb-2">Billing History</h4>
            <div className="border rounded-lg p-4 bg-amber-50/30">
              <div className="space-y-2 text-sm">
                {subscription.billing_history.map((bill, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium">{new Date(bill.date).toLocaleDateString()}</span>
                      <Badge className="ml-2" variant={bill.status === 'paid' ? 'default' : 'secondary'}>
                        {bill.status}
                      </Badge>
                    </div>
                    <span className="font-semibold">{subscription.currency} {bill.amount?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}