import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InvoicePreview from "@/components/invoices/InvoicePreview";
import InvoiceEditor from "@/components/invoices/InvoiceEditor";
import { 
  Eye, 
  Edit, 
  Download, 
  Send, 
  Building, 
  Palette,
  Globe,
  Mail,
  Phone
} from "lucide-react";

// Sample agencies with different branding
const SAMPLE_AGENCIES = {
  default: {
    id: 'default',
    name: "TravelPro Agency",
    tagline: "Your trusted travel partner",
    logo_url: "https://via.placeholder.com/150x50/3B82F6/FFFFFF?text=TravelPro",
    address: "123 Travel Street, Tourism City, TC 12345",
    email: "info@travelpro.com",
    phone: "+1 (555) 123-4567",
    website: "https://travelpro.com",
    bank_account: "1234-5678-9012-3456",
    branding_theme: "default"
  },
  premium: {
    id: 'premium',
    name: "Luxury Escapes",
    tagline: "Exclusive destinations, unforgettable experiences",
    logo_url: "https://via.placeholder.com/150x50/8B5CF6/FFFFFF?text=Luxury+Escapes",
    address: "456 Premium Avenue, Luxury District, LD 67890",
    email: "concierge@luxuryescapes.com",
    phone: "+1 (555) 987-6543",
    website: "https://luxuryescapes.com",
    bank_account: "9876-5432-1098-7654",
    branding_theme: "premium"
  },
  luxury: {
    id: 'luxury',
    name: "Golden Voyages",
    tagline: "Where dreams become destinations",
    logo_url: "https://via.placeholder.com/150x50/D97706/FFFFFF?text=Golden+Voyages",
    address: "789 Golden Boulevard, Elite Quarter, EQ 11111",
    email: "service@goldenvoyages.com",
    phone: "+1 (555) 456-7890",
    website: "https://goldenvoyages.com",
    bank_account: "5555-4444-3333-2222",
    branding_theme: "luxury"
  },
  business: {
    id: 'business',
    name: "Corporate Travel Solutions",
    tagline: "Professional travel management for modern businesses",
    logo_url: "https://via.placeholder.com/150x50/475569/FFFFFF?text=Corporate+Travel",
    address: "321 Business Park, Corporate Center, CC 22222",
    email: "travel@corporatetravel.com",
    phone: "+1 (555) 321-0987",
    website: "https://corporatetravel.com",
    bank_account: "1111-2222-3333-4444",
    branding_theme: "business"
  }
};

// Sample invoice data
const SAMPLE_INVOICE = {
  invoice_number: "INV-2024-001",
  client_name: "John Smith",
  client_email: "john.smith@example.com",
  client_phone: "+1 (555) 123-4567",
  client_address: "456 Client Street, Customer City, CC 33333",
  created_date: "2024-01-15",
  due_date: "2024-02-14",
  currency: "USD",
  items: [
    {
      description: "Safari Adventure Package",
      quantity: 2,
      unit_price: 2500.00,
      total: 5000.00,
      details: "3-day luxury safari with accommodation and meals"
    },
    {
      description: "Flight Booking Service",
      quantity: 1,
      unit_price: 150.00,
      total: 150.00,
      details: "International flight booking and seat selection"
    },
    {
      description: "Travel Insurance",
      quantity: 2,
      unit_price: 75.00,
      total: 150.00,
      details: "Comprehensive travel insurance coverage"
    }
  ],
  subtotal: 5300.00,
  tax_rate: 8.5,
  tax_amount: 450.50,
  service_fee: 100.00,
  total_amount: 5850.50,
  amount_paid: 2000.00,
  balance_due: 3850.50,
  notes: "Thank you for choosing our services. Payment is due within 30 days. For any questions about this invoice, please contact our customer service team.",
  status: "sent"
};

export default function InvoiceDemo() {
  const [selectedAgency, setSelectedAgency] = useState('default');
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'editor'
  const [currentInvoice, setCurrentInvoice] = useState(SAMPLE_INVOICE);

  const handleSaveInvoice = (invoiceData) => {
    setCurrentInvoice(invoiceData);
    setViewMode('preview');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Professional Invoice System</h1>
        <p className="text-gray-600">Showcasing enhanced invoice functionality with QR codes and agency branding</p>
      </div>

      {/* Agency Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Agency Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(SAMPLE_AGENCIES).map(([key, agency]) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-all ${
                  selectedAgency === key 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedAgency(key)}
              >
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <img 
                      src={agency.logo_url} 
                      alt={`${agency.name} logo`}
                      className="h-8 mx-auto object-contain"
                    />
                    <h3 className="font-semibold text-sm">{agency.name}</h3>
                    <p className="text-xs text-gray-500">{agency.tagline}</p>
                    <Badge variant={selectedAgency === key ? "default" : "outline"}>
                      {agency.branding_theme}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant={viewMode === 'editor' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('editor')}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editor
          </Button>
        </div>
      </div>

      {/* Invoice Display */}
      <div className="space-y-4">
        {viewMode === 'preview' ? (
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-2" />
                Print Invoice
              </Button>
              <Button variant="outline">
                <Send className="w-4 h-4 mr-2" />
                Send to Client
              </Button>
            </div>
            <InvoicePreview 
              invoice={currentInvoice} 
              agency={SAMPLE_AGENCIES[selectedAgency]} 
            />
          </div>
        ) : (
          <InvoiceEditor
            invoice={currentInvoice}
            agency={SAMPLE_AGENCIES[selectedAgency]}
            onSave={handleSaveInvoice}
            onClose={() => setViewMode('preview')}
          />
        )}
      </div>

      {/* Features Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                <Palette className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Agency Branding</h3>
              <p className="text-sm text-gray-600">
                Custom colors, logos, and themes for different agencies
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold">QR Code Payment</h3>
              <p className="text-sm text-gray-600">
                Integrated QR codes for easy mobile payments
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Professional Design</h3>
              <p className="text-sm text-gray-600">
                Modern, clean design with responsive layout
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">Contact Integration</h3>
              <p className="text-sm text-gray-600">
                Complete agency contact information display
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto">
                <Download className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold">Print Ready</h3>
              <p className="text-sm text-gray-600">
                Optimized for printing and PDF generation
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto">
                <Building className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold">Multi-Agency Support</h3>
              <p className="text-sm text-gray-600">
                Support for multiple agencies with different branding
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 