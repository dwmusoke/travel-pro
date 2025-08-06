
import React, { useState } from "react";
import { Estimate } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Edit,
  Eye,
  Trash2,
  Send,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EstimateManager({ estimates, onUpdate }) {
  const [filter, setFilter] = useState("all");

  const filteredEstimates = estimates.filter(estimate => {
    if (filter === "all") return true;
    return estimate.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteEstimate = async (estimateId) => {
    if (window.confirm("Are you sure you want to delete this estimate? This cannot be undone.")) {
        try {
            await Estimate.delete(estimateId);
            onUpdate(); // Refresh the list
        } catch(e) {
            console.error("Failed to delete estimate:", e);
            alert("Error: Could not delete estimate.");
        }
    }
  }


  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <Send className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'declined': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const isExpiringSoon = (validUntil) => {
    if (!validUntil) return false;
    const expiryDate = new Date(validUntil);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-amber-900">Estimate Management</h2>
          <p className="text-amber-800/80">Create and track project estimates and proposals</p>
        </div>
        <Link to={createPageUrl("EstimateEditor")}>
          <Button className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            New Estimate
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'draft', 'sent', 'accepted', 'declined', 'expired'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className={`${filter === status ? "bg-amber-800/20 text-amber-900 shadow-md" : "bg-amber-50/50 text-amber-800"} border-amber-300/50 rounded-lg`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {estimates.filter(e => e.status === status).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Estimates List */}
      <div className="space-y-4">
        {filteredEstimates.length > 0 ? (
          filteredEstimates.map((estimate) => (
            <div key={estimate.id} className="p-4 border border-amber-200/50 rounded-lg bg-amber-50/50 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h4 className="font-semibold text-amber-900">{estimate.estimate_number}</h4>
                    <Badge className={getStatusColor(estimate.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(estimate.status)}
                        {estimate.status}
                      </div>
                    </Badge>
                    {isExpiringSoon(estimate.valid_until) && (
                      <Badge className="bg-orange-100 text-orange-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Expiring Soon
                      </Badge>
                    )}
                    {estimate.converted_to_booking && (
                      <Badge className="bg-green-100 text-green-800">Converted</Badge>
                    )}
                  </div>

                  <h5 className="font-medium text-amber-900 mb-2">{estimate.title}</h5>

                  <div className="grid md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-amber-700 mb-3">
                    <p><strong>Client:</strong> {estimate.client_name}</p>
                    <p><strong>Email:</strong> {estimate.client_email}</p>
                    {estimate.valid_until && (
                      <p><strong>Valid Until:</strong> {new Date(estimate.valid_until).toLocaleDateString()}</p>
                    )}
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-700" />
                      <span className="font-semibold text-base">{estimate.currency} {estimate.total_amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button size="sm" variant="outline" className="bg-white/50">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Link to={createPageUrl(`EstimateEditor?id=${estimate.id}`)}>
                    <Button size="sm" variant="outline" className="bg-white/50 w-full">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 bg-white/50" onClick={() => handleDeleteEstimate(estimate.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-amber-300 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-amber-900 mb-2">No Estimates Found</h3>
            <p className="text-amber-700/80 mb-6">
              {filter === 'all'
                ? "Create professional estimates to convert leads into bookings."
                : `No estimates with status "${filter}" found.`
              }
            </p>
            <Link to={createPageUrl("EstimateEditor")}>
              <Button className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Create First Estimate
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
