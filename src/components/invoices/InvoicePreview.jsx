import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Calendar, DollarSign, User, Mail, Phone, MapPin, Globe, Building } from "lucide-react";
import QRCode from "react-qr-code";

export default function InvoicePreview({ invoice, agency }) {
  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No invoice data available</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Generate QR code data for payment
  const generateQRData = () => {
    const qrData = {
      invoice_number: invoice.invoice_number,
      amount: invoice.balance_due,
      currency: invoice.currency || 'USD',
      agency: agency?.name || 'Travel Agency',
      due_date: invoice.due_date,
      client: invoice.client_name
    };
    return JSON.stringify(qrData);
  };

  // Get agency branding colors
  const getAgencyBranding = () => {
    const agencyId = agency?.id || 'default';
    const brandingMap = {
      'default': {
        primary: 'from-blue-600 to-blue-700',
        secondary: 'from-blue-500 to-blue-600',
        accent: 'blue'
      },
      'premium': {
        primary: 'from-purple-600 to-purple-700',
        secondary: 'from-purple-500 to-purple-600',
        accent: 'purple'
      },
      'luxury': {
        primary: 'from-amber-600 to-amber-700',
        secondary: 'from-amber-500 to-amber-600',
        accent: 'amber'
      },
      'business': {
        primary: 'from-slate-600 to-slate-700',
        secondary: 'from-slate-500 to-slate-600',
        accent: 'slate'
      }
    };
    return brandingMap[agencyId] || brandingMap['default'];
  };

  const branding = getAgencyBranding();

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200">
      {/* Professional Header with Agency Branding */}
      <div className={`bg-gradient-to-r ${branding.primary} text-white p-8 relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
          {/* Agency Info with Logo */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              {agency?.logo_url ? (
                <img 
                  src={agency.logo_url} 
                  alt={`${agency.name} logo`}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Building className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">INVOICE</h1>
              <div className="space-y-1">
                <p className="text-xl font-semibold">{agency?.name || 'Your Travel Agency'}</p>
                {agency?.tagline && (
                  <p className="text-white/80 text-sm italic">{agency.tagline}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-white/90">
                  {agency?.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{agency.address}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-white/90">
                  {agency?.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{agency.email}</span>
                    </div>
                  )}
                  {agency?.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{agency.phone}</span>
                    </div>
                  )}
                </div>
                {agency?.website && (
                  <div className="flex items-center gap-1 text-sm text-white/90">
                    <Globe className="w-4 h-4" />
                    <span>{agency.website}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Number and QR Code */}
          <div className="flex items-start gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <p className="text-3xl font-bold tracking-wider">{invoice.invoice_number}</p>
              <Badge variant="outline" className={`mt-3 ${getStatusColor(invoice.status)} border-white/20 text-white`}>
                {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
              </Badge>
            </div>
            
            {/* QR Code for Payment */}
            <div className="bg-white rounded-xl p-4">
              <div className="text-center mb-2">
                <p className="text-xs text-gray-600 font-medium">SCAN TO PAY</p>
              </div>
              <QRCode 
                value={generateQRData()}
                size={80}
                level="M"
                bgColor="white"
                fgColor="#1f2937"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="p-8">
        {/* Client and Invoice Details Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Bill To Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Bill To
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="font-bold text-lg text-gray-900">{invoice.client_name}</p>
                {invoice.client_email && (
                  <p className="text-gray-600 flex items-center gap-2 mt-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {invoice.client_email}
                  </p>
                )}
                {invoice.client_phone && (
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {invoice.client_phone}
                  </p>
                )}
                {invoice.client_address && (
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {invoice.client_address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Invoice Details
            </h3>
            <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Issue Date:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(invoice.created_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Due Date:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(invoice.due_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Currency:</span>
                <span className="font-semibold text-gray-900">{invoice.currency || 'USD'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Payment Terms:</span>
                <span className="font-semibold text-gray-900">Net 30</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Items & Services
          </h3>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className={`bg-gradient-to-r ${branding.secondary} text-white`}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.description}</p>
                          {item.details && (
                            <p className="text-xs text-gray-500 mt-1">{item.details}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        {invoice.currency || 'USD'} {item.unit_price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                        {invoice.currency || 'USD'} {item.total?.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No items found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end">
          <div className="w-80">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Subtotal:</span>
                  <span className="font-semibold">{invoice.currency || 'USD'} {invoice.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Tax ({invoice.tax_rate}%):</span>
                    <span className="font-semibold">{invoice.currency || 'USD'} {invoice.tax_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                {invoice.service_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Service Fee:</span>
                    <span className="font-semibold">{invoice.currency || 'USD'} {invoice.service_fee?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                <Separator className="my-3" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span>{invoice.currency || 'USD'} {invoice.total_amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                  <span>Amount Paid:</span>
                  <span>{invoice.currency || 'USD'} {invoice.amount_paid?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-red-600 bg-red-50 p-3 rounded-lg">
                  <span>Balance Due:</span>
                  <span>{invoice.currency || 'USD'} {invoice.balance_due?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {invoice.notes && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Additional Notes
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{invoice.notes}</p>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment Instructions
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
            <div>
              <p className="font-medium mb-2">Bank Transfer:</p>
              <p>Account: {agency?.bank_account || 'XXXX-XXXX-XXXX'}</p>
              <p>Reference: {invoice.invoice_number}</p>
            </div>
            <div>
              <p className="font-medium mb-2">Online Payment:</p>
              <p>Scan the QR code above or visit our payment portal</p>
              <p>Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-3">
              {agency?.logo_url && (
                <img 
                  src={agency.logo_url} 
                  alt={`${agency.name} logo`}
                  className="w-8 h-8 object-contain"
                />
              )}
              <p className="text-lg font-semibold text-gray-900">{agency?.name || 'Your Travel Agency'}</p>
            </div>
            <p className="text-gray-600 mb-2">Thank you for choosing our services!</p>
            <p className="text-sm text-gray-500">
              For questions about this invoice, please contact us at{' '}
              <span className="text-blue-600 font-medium">{agency?.email || 'info@youragency.com'}</span>
            </p>
            {agency?.website && (
              <p className="text-sm text-gray-500 mt-1">
                Visit us at{' '}
                <span className="text-blue-600 font-medium">{agency.website}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}