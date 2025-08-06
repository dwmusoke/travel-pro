import React, { useState } from "react";
import { RecurringBilling } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  DollarSign,
  Calendar,
  CreditCard,
  Pause,
  Play,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";

export default function RecurringBillingManager({ subscriptions, onUpdate, onAddRecurring, onViewSubscription, onEditSubscription }) {
  const [filter, setFilter] = useState("all");

  const filteredSubscriptions = subscriptions.filter(subscription => {
    if (filter === "all") return true;
    return subscription.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  const isRenewalDue = (nextBillingDate) => {
    if (!nextBillingDate) return false;
    const nextDate = new Date(nextBillingDate);
    const today = new Date();
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const handleStatusChange = async (subscription, newStatus) => {
    try {
      await RecurringBilling.update(subscription.id, { 
        status: newStatus,
        last_billing_date: newStatus === 'active' ? new Date().toISOString().split('T')[0] : subscription.last_billing_date
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to update subscription status:", error);
      alert("Failed to update subscription status");
    }
  };

  const handleDelete = async (subscriptionId) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await RecurringBilling.delete(subscriptionId);
        onUpdate();
      } catch (error) {
        console.error("Failed to delete subscription:", error);
        alert("Failed to delete subscription");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Recurring Billing</h2>
          <p className="text-slate-600">Manage subscription services and recurring revenue</p>
        </div>
        <Button onClick={onAddRecurring} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          New Subscription
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'active', 'paused', 'cancelled', 'expired'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className={filter === status ? "bg-green-600" : ""}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {subscriptions.filter(s => s.status === status).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Subscriptions List */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Subscriptions ({filteredSubscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map((subscription) => (
                <div key={subscription.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-slate-900">{subscription.subscription_name}</h4>
                        <Badge className={getStatusColor(subscription.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(subscription.status)}
                            {subscription.status}
                          </div>
                        </Badge>
                        {isRenewalDue(subscription.next_billing_date) && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Calendar className="w-3 h-3 mr-1" />
                            Renewal Due
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600 mb-3">
                        <div>
                          <p><strong>Client:</strong> {subscription.client_name}</p>
                          <p><strong>Email:</strong> {subscription.client_email}</p>
                          <p><strong>Service:</strong> {getServiceTypeLabel(subscription.service_type)}</p>
                        </div>
                        <div>
                          <p><strong>Frequency:</strong> {getFrequencyLabel(subscription.billing_frequency)}</p>
                          <p><strong>Start Date:</strong> {new Date(subscription.start_date).toLocaleDateString()}</p>
                          {subscription.end_date && (
                            <p><strong>End Date:</strong> {new Date(subscription.end_date).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-lg">{subscription.currency} {subscription.amount?.toFixed(2)}</span>
                            <span className="text-slate-500">/ {subscription.billing_frequency.replace('_', ' ')}</span>
                          </div>
                          <p className="text-slate-600">Total Billed: {subscription.currency} {subscription.total_billed?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                          {subscription.next_billing_date && (
                            <div className="flex items-center gap-1 mb-1">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span>Next Bill: {new Date(subscription.next_billing_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4 text-purple-600" />
                            <span>{subscription.payment_method?.replace('_', ' ') || 'Not set'}</span>
                          </div>
                        </div>
                      </div>

                      {subscription.billing_history && subscription.billing_history.length > 0 && (
                        <div className="mt-3 p-2 bg-slate-50 rounded text-sm">
                          <strong>Recent Billing:</strong> {subscription.billing_history.length} payment{subscription.billing_history.length > 1 ? 's' : ''} recorded
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {subscription.status === 'active' ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-orange-600 hover:bg-orange-50"
                          onClick={() => handleStatusChange(subscription, 'paused')}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      ) : subscription.status === 'paused' ? (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusChange(subscription, 'active')}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                      ) : null}
                      <Button size="sm" variant="outline" onClick={() => onViewSubscription(subscription)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onEditSubscription(subscription)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(subscription.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <RefreshCw className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-slate-900 mb-2">No Subscriptions Found</h3>
                <p className="text-slate-600 mb-6">
                  {filter === 'all' 
                    ? "Set up recurring billing for subscription services and maintenance fees."
                    : `No subscriptions with status "${filter}" found.`
                  }
                </p>
                <Button onClick={onAddRecurring} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Subscription
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}