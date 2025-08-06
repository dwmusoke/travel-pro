import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building, 
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  BarChart3,
  PieChart,
  CreditCard,
  Receipt,
  Calculator,
  Award,
  Shield,
  Clock as ClockIcon,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

export default function SupplierManagement({ 
  onSupplierUpdate,
  onPaymentProcessed 
}) {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Suppliers data
  const [suppliers, setSuppliers] = useState([
    {
      id: 'sup_001',
      name: 'Global Airlines Inc.',
      category: 'airline',
      status: 'active',
      rating: 4.8,
      contactPerson: 'Sarah Johnson',
      email: 'sarah.johnson@globalairlines.com',
      phone: '+1-555-0123',
      website: 'www.globalairlines.com',
      address: '123 Aviation Blvd, New York, NY 10001',
      contractStart: '2023-01-15',
      contractEnd: '2025-01-15',
      paymentTerms: 'Net 30',
      totalSpent: 1250000,
      outstandingBalance: 45000,
      performance: {
        onTimeDelivery: 95,
        qualityRating: 4.8,
        responseTime: 2.5,
        costCompetitiveness: 4.6
      }
    },
    {
      id: 'sup_002',
      name: 'Luxury Hotels Group',
      category: 'hotel',
      status: 'active',
      rating: 4.9,
      contactPerson: 'Michael Chen',
      email: 'michael.chen@luxuryhotels.com',
      phone: '+1-555-0456',
      website: 'www.luxuryhotels.com',
      address: '456 Hospitality Ave, Los Angeles, CA 90210',
      contractStart: '2023-03-20',
      contractEnd: '2025-03-20',
      paymentTerms: 'Net 45',
      totalSpent: 890000,
      outstandingBalance: 12500,
      performance: {
        onTimeDelivery: 98,
        qualityRating: 4.9,
        responseTime: 1.8,
        costCompetitiveness: 4.7
      }
    },
    {
      id: 'sup_003',
      name: 'Adventure Tours Co.',
      category: 'tour_operator',
      status: 'active',
      rating: 4.6,
      contactPerson: 'David Rodriguez',
      email: 'david.rodriguez@adventuretours.com',
      phone: '+1-555-0789',
      website: 'www.adventuretours.com',
      address: '789 Adventure St, Miami, FL 33101',
      contractStart: '2023-06-10',
      contractEnd: '2024-06-10',
      paymentTerms: 'Net 30',
      totalSpent: 320000,
      outstandingBalance: 8500,
      performance: {
        onTimeDelivery: 92,
        qualityRating: 4.6,
        responseTime: 3.2,
        costCompetitiveness: 4.5
      }
    }
  ]);

  // Payment history
  const [payments, setPayments] = useState([
    {
      id: 'pay_001',
      supplierId: 'sup_001',
      amount: 45000,
      date: '2024-01-15',
      dueDate: '2024-02-14',
      status: 'pending',
      invoiceNumber: 'INV-2024-001',
      description: 'Q4 2023 commission payment'
    },
    {
      id: 'pay_002',
      supplierId: 'sup_002',
      amount: 12500,
      date: '2024-01-10',
      dueDate: '2024-02-24',
      status: 'pending',
      invoiceNumber: 'INV-2024-002',
      description: 'December 2023 hotel bookings'
    },
    {
      id: 'pay_003',
      supplierId: 'sup_003',
      amount: 8500,
      date: '2024-01-05',
      dueDate: '2024-02-04',
      status: 'paid',
      invoiceNumber: 'INV-2024-003',
      description: 'Q4 2023 tour commissions'
    }
  ]);

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalSuppliers: 15,
    activeSuppliers: 12,
    totalSpent: 2460000,
    outstandingPayments: 66000,
    averageRating: 4.7,
    onTimeDelivery: 94.2,
    costSavings: 125000
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status] || variants.inactive}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'airline': return '✈️';
      case 'hotel': return '🏨';
      case 'tour_operator': return '🗺️';
      case 'car_rental': return '🚗';
      case 'insurance': return '🛡️';
      default: return '🏢';
    }
  };

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || supplier.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [suppliers, searchTerm, filterCategory, filterStatus]);

  const SuppliersTab = () => (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              {performanceMetrics.activeSuppliers} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(performanceMetrics.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(performanceMetrics.outstandingPayments)}</div>
            <p className="text-xs text-muted-foreground">
              Pending payments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              Supplier performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Supplier Directory</span>
            <Button onClick={() => setShowSupplierModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="airline">Airlines</SelectItem>
                <SelectItem value="hotel">Hotels</SelectItem>
                <SelectItem value="tour_operator">Tour Operators</SelectItem>
                <SelectItem value="car_rental">Car Rental</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{getCategoryIcon(supplier.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{supplier.name}</h3>
                        {getStatusBadge(supplier.status)}
                        <div className="flex items-center gap-1">
                          {getRatingStars(supplier.rating)}
                          <span className="text-sm text-gray-600">({supplier.rating})</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Contact:</strong> {supplier.contactPerson}</p>
                          <p><strong>Email:</strong> {supplier.email}</p>
                          <p><strong>Phone:</strong> {supplier.phone}</p>
                        </div>
                        <div>
                          <p><strong>Contract:</strong> {new Date(supplier.contractStart).toLocaleDateString()} - {new Date(supplier.contractEnd).toLocaleDateString()}</p>
                          <p><strong>Payment Terms:</strong> {supplier.paymentTerms}</p>
                          <p><strong>Total Spent:</strong> {formatCurrency(supplier.totalSpent)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{supplier.performance.onTimeDelivery}%</div>
                          <div className="text-xs text-gray-600">On Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{supplier.performance.qualityRating}</div>
                          <div className="text-xs text-gray-600">Quality</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{supplier.performance.responseTime}h</div>
                          <div className="text-xs text-gray-600">Response</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{supplier.performance.costCompetitiveness}</div>
                          <div className="text-xs text-gray-600">Cost</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Payments
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const PaymentsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Management</span>
            <Button onClick={() => setShowPaymentModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Payment
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const supplier = suppliers.find(s => s.id === payment.supplierId);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{supplier?.name}</div>
                        <div className="text-sm text-gray-600">{payment.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{payment.invoiceNumber}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(payment.dueDate).toLocaleDateString()}
                        {payment.status === 'pending' && new Date(payment.dueDate) < new Date() && (
                          <div className="text-red-600 text-xs">Overdue</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {payment.status === 'pending' && (
                          <Button variant="ghost" size="sm">
                            <DollarSign className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: 'Airlines', amount: 1250000, percentage: 51 },
                { category: 'Hotels', amount: 890000, percentage: 36 },
                { category: 'Tour Operators', amount: 320000, percentage: 13 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">On-Time Delivery</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <span className="text-sm font-medium">94%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Quality Rating</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <span className="text-sm font-medium">4.7/5</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Cost Savings</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(125000)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Supplier Management</h2>
          <p className="text-muted-foreground">
            Manage vendor relationships, track payments, and monitor performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Performance Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="suppliers">
          <SuppliersTab />
        </TabsContent>
        
        <TabsContent value="payments">
          <PaymentsTab />
        </TabsContent>
        
        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>

      {/* Add Supplier Modal */}
      <Dialog open={showSupplierModal} onOpenChange={setShowSupplierModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Enter supplier information to add them to your directory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" placeholder="Enter company name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="airline">Airline</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="tour_operator">Tour Operator</SelectItem>
                    <SelectItem value="car_rental">Car Rental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Person</Label>
                <Input id="contact" placeholder="Enter contact person name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="Enter phone number" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Enter company address" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupplierModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSupplierModal(false)}>
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 