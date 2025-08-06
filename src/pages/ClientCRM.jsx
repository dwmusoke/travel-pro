
import React, { useState, useEffect, useRef } from "react";
import { Client, GDSTicket, Invoice, User, Booking } from "@/api/entities";
import { UploadFile, InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
  Plane,
  DollarSign,
  ArrowRight,
  Star,
  TrendingUp,
  Download,
  AlertCircle,
  UserCheck,
  FileWarning,
  Upload,
  Clock,
  BookUser,
  CreditCard,
  ShieldCheck,
  Save,
  Trash2,
  X,
  Bell,
  Share2,
  Eye,
  Edit,
  Send,
  Copy,
  ExternalLink,
  MessageSquare,
  CalendarDays,
  MapPin,
  Globe,
  CreditCard as CreditCardIcon,
  History,
  Activity
} from "lucide-react";
import { format, isBefore, parseISO, addDays } from "date-fns";

// Enhanced Client Detail Modal with Profile Management
const ClientDetailModal = ({ client, onClose, onSave, onShareStatement, onSendReminder }) => {
    const [formData, setFormData] = useState(client);
    const [newDocument, setNewDocument] = useState({ document_type: 'passport', document_number: '', expiry_date: '' });
    const [activeTab, setActiveTab] = useState("profile");
    const [clientBookings, setClientBookings] = useState([]);
    const [clientInvoices, setClientInvoices] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    useEffect(() => {
        if (client?.id) {
            loadClientData();
        }
    }, [client?.id]);

    const loadClientData = async () => {
        setLoadingBookings(true);
        setLoadingInvoices(true);
        try {
            // Load client bookings and invoices
            const [bookings, invoices] = await Promise.all([
                Booking.filter({ client_id: client.id }, '-created_date', 10),
                Invoice.filter({ client_id: client.id }, '-created_date', 10)
            ]);
            setClientBookings(bookings);
            setClientInvoices(invoices);
        } catch (error) {
            console.error("Error loading client data:", error);
        } finally {
            setLoadingBookings(false);
            setLoadingInvoices(false);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleAddDocument = () => {
        if (!newDocument.document_number || !newDocument.expiry_date) {
            alert("Please provide both document number and expiry date.");
            return;
        }
        setFormData(prev => ({
            ...prev,
            documents: [...(prev.documents || []), newDocument]
        }));
        setNewDocument({ document_type: 'passport', document_number: '', expiry_date: '' });
    };

    const handleRemoveDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        await onSave(formData);
        onClose();
    };

    const getDocumentStatus = (expiryDate) => {
        if (!expiryDate) return { status: 'unknown', color: 'gray' };
        const expiry = new Date(expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) return { status: 'expired', color: 'red' };
        if (daysUntilExpiry <= 30) return { status: 'expiring_soon', color: 'orange' };
        if (daysUntilExpiry <= 90) return { status: 'expiring', color: 'yellow' };
        return { status: 'valid', color: 'green' };
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl text-amber-900 dark:bg-gray-800/80 dark:border-gray-700/50 dark:text-amber-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5" />
                        Client Profile: {client.name || "New Client"}
                    </DialogTitle>
                    <DialogDescription>Manage client details, documents, and interactions.</DialogDescription>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="actions">Actions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" value={formData.phone} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input id="company" value={formData.company} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" value={formData.address} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" value={formData.city} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State/Province</Label>
                                    <Input id="state" value={formData.state} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Postal Code</Label>
                                    <Input id="postal_code" value={formData.postal_code} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input id="country" value={formData.country} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input id="website" value={formData.website} onChange={handleInputChange} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCardIcon className="w-5 h-5" />
                                    Financial Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="credit_limit">Credit Limit</Label>
                                    <Input id="credit_limit" type="number" value={formData.credit_limit} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="payment_terms">Payment Terms</Label>
                                    <Select value={formData.payment_terms} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_terms: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="net_30">Net 30</SelectItem>
                                            <SelectItem value="net_15">Net 15</SelectItem>
                                            <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tax_id">Tax ID</Label>
                                    <Input id="tax_id" value={formData.tax_id} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Preferred Currency</Label>
                                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                            <SelectItem value="CAD">CAD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Client Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-amber-100/50 rounded-lg">
                                        <p className="text-2xl font-bold text-amber-900">{formData.total_bookings || 0}</p>
                                        <p className="text-sm text-amber-700">Total Bookings</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-100/50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-900">${formData.total_spent || 0}</p>
                                        <p className="text-sm text-green-700">Total Spent</p>
                                    </div>
                                    <div className="text-center p-4 bg-blue-100/50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-900">{formData.documents?.length || 0}</p>
                                        <p className="text-sm text-blue-700">Documents</p>
                                    </div>
                                    <div className="text-center p-4 bg-purple-100/50 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-900">{formData.last_booking_date ? format(new Date(formData.last_booking_date), 'MMM yyyy') : 'N/A'}</p>
                                        <p className="text-sm text-purple-700">Last Booking</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Client Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {(formData.documents || []).map((doc, index) => {
                                        const status = getDocumentStatus(doc.expiry_date);
                                        return (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-amber-100/50 dark:bg-gray-700/50 rounded-md">
                                                <div className="capitalize font-medium w-24">{doc.document_type}</div>
                                                <div className="flex-1">{doc.document_number}</div>
                                                <div className="text-sm">
                                                    Expires: {doc.expiry_date ? format(new Date(doc.expiry_date), 'MMM dd, yyyy') : 'N/A'}
                                                </div>
                                                <Badge variant={status.color === 'red' ? 'destructive' : status.color === 'orange' ? 'secondary' : 'default'}>
                                                    {status.status.replace('_', ' ')}
                                                </Badge>
                                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleRemoveDocument(index)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                    {(!formData.documents || formData.documents.length === 0) && (
                                        <p className="text-center text-amber-700/80 dark:text-amber-300/80">No documents added yet.</p>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-amber-300/50 dark:border-gray-600/50">
                                    <h4 className="font-semibold mb-3">Add New Document</h4>
                                    <div className="grid md:grid-cols-4 gap-3 items-end">
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Select value={newDocument.document_type} onValueChange={(v) => setNewDocument(p => ({...p, document_type: v}))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="passport">Passport</SelectItem>
                                                    <SelectItem value="visa">Visa</SelectItem>
                                                    <SelectItem value="insurance">Insurance</SelectItem>
                                                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                                                    <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Document Number</Label>
                                            <Input value={newDocument.document_number} onChange={(e) => setNewDocument(p => ({...p, document_number: e.target.value}))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Expiry Date</Label>
                                            <Input type="date" value={newDocument.expiry_date} onChange={(e) => setNewDocument(p => ({...p, expiry_date: e.target.value}))} />
                                        </div>
                                        <Button onClick={handleAddDocument} className="w-full">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Document
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Plane className="w-5 h-5" />
                                    Recent Bookings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingBookings ? (
                                    <div className="text-center py-4">Loading bookings...</div>
                                ) : clientBookings.length > 0 ? (
                                    <div className="space-y-3">
                                        {clientBookings.map((booking) => (
                                            <div key={booking.id} className="flex items-center justify-between p-3 bg-amber-100/30 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{booking.booking_reference}</p>
                                                    <p className="text-sm text-amber-700">
                                                        {booking.travel_dates?.departure_date && format(new Date(booking.travel_dates.departure_date), 'MMM dd, yyyy')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">${booking.total_amount?.toFixed(2)}</p>
                                                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                                        {booking.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-amber-700/80">No bookings found.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Recent Invoices
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingInvoices ? (
                                    <div className="text-center py-4">Loading invoices...</div>
                                ) : clientInvoices.length > 0 ? (
                                    <div className="space-y-3">
                                        {clientInvoices.map((invoice) => (
                                            <div key={invoice.id} className="flex items-center justify-between p-3 bg-amber-100/30 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{invoice.invoice_number}</p>
                                                    <p className="text-sm text-amber-700">
                                                        {invoice.created_date && format(new Date(invoice.created_date), 'MMM dd, yyyy')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">${invoice.total_amount?.toFixed(2)}</p>
                                                    <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                                                        {invoice.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-amber-700/80">No invoices found.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="actions" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    Client Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Button 
                                        onClick={() => onShareStatement(formData)} 
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        Share Statement
                                    </Button>
                                    <Button 
                                        onClick={() => onSendReminder(formData)} 
                                        className="w-full bg-orange-600 hover:bg-orange-700"
                                    >
                                        <Bell className="w-4 h-4 mr-2" />
                                        Send Reminder
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="w-full"
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send Email
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="w-full"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        WhatsApp
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Document Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(formData.documents || []).filter(doc => {
                                    const status = getDocumentStatus(doc.expiry_date);
                                    return status.status === 'expired' || status.status === 'expiring_soon';
                                }).map((doc, index) => (
                                    <Alert key={index} variant={getDocumentStatus(doc.expiry_date).status === 'expired' ? 'destructive' : 'default'} className="mb-3">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>
                                            {doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1)} Expiry Alert
                                        </AlertTitle>
                                        <AlertDescription>
                                            {doc.document_number} expires on {format(new Date(doc.expiry_date), 'MMM dd, yyyy')}
                                        </AlertDescription>
                                    </Alert>
                                ))}
                                {!(formData.documents || []).some(doc => {
                                    const status = getDocumentStatus(doc.expiry_date);
                                    return status.status === 'expired' || status.status === 'expiring_soon';
                                }) && (
                                    <p className="text-center text-green-700">All documents are up to date!</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-amber-800 hover:bg-amber-900">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Document Expiry Reminder Modal
const DocumentExpiryReminderModal = ({ client, isOpen, onClose, onSend }) => {
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (isOpen && client) {
            const expiringDocs = (client.documents || []).filter(doc => {
                if (!doc.expiry_date) return false;
                const expiry = new Date(doc.expiry_date);
                const today = new Date();
                const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                return daysUntilExpiry <= 30;
            });
            setSelectedDocuments(expiringDocs.map(doc => ({ ...doc, selected: true })));
            
            const defaultMessage = `Dear ${client.name},

We noticed that the following documents are expiring soon:

${expiringDocs.map(doc => `• ${doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1)} (${doc.document_number}) - Expires: ${new Date(doc.expiry_date).toLocaleDateString()}`).join('\n')}

Please ensure these documents are renewed before their expiry date to avoid any travel disruptions.

If you need assistance with document renewal, please don't hesitate to contact us.

Best regards,
Your Travel Agency Team`;

            setMessage(defaultMessage);
        }
    }, [isOpen, client]);

    const handleSend = async () => {
        setSending(true);
        try {
            await onSend(client, selectedDocuments.filter(doc => doc.selected), message);
            onClose();
        } catch (error) {
            console.error("Error sending reminder:", error);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Document Expiry Reminder
                    </DialogTitle>
                    <DialogDescription>
                        Send a reminder to {client?.name} about expiring documents.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div>
                        <Label className="text-amber-900">Select Documents to Include</Label>
                        <div className="space-y-2 mt-2">
                            {selectedDocuments.map((doc, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={doc.selected}
                                        onChange={(e) => {
                                            const updated = [...selectedDocuments];
                                            updated[index].selected = e.target.checked;
                                            setSelectedDocuments(updated);
                                        }}
                                        className="rounded border-amber-300"
                                    />
                                    <span className="text-sm">
                                        {doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1)} ({doc.document_number}) - 
                                        Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-amber-900">Message</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            className="mt-2 bg-amber-100/50 border-amber-300/50 text-amber-900"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSend} disabled={sending} className="bg-orange-600 hover:bg-orange-700">
                        <Send className="w-4 h-4 mr-2" />
                        {sending ? 'Sending...' : 'Send Reminder'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function ClientCRM() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isImportContactsOpen, setIsImportContactsOpen] = useState(false);
  const [importFiles, setImportFiles] = useState([]);
  const [importProcessing, setImportProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    expiringDocuments: 0,
    totalBookings: 0,
  });

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  
  // New state for enhanced features
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedClientForAction, setSelectedClientForAction] = useState(null);

  const importFileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      if (!user?.agency_id) {
          console.error("User has no agency_id - cannot load clients.");
          setClients([]);
          setStats({ totalClients: 0, activeClients: 0, expiringDocuments: 0, totalBookings: 0 });
          setExpiringDocuments([]);
          setLoading(false);
          return;
      }

      console.log(`Loading clients for agency: ${user.agency_id}`);
      
      const clientList = await Client.filter({ agency_id: user.agency_id }, '-created_date', 100);
      
      console.log(`Loaded ${clientList.length} clients for agency ${user.agency_id}`);
      
      let totalBookingsCount = 0;
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      const docsExpiringSoon = [];

      const enhancedClients = clientList.map(client => {
          totalBookingsCount += client.total_bookings || 0;
          
          let clientExpiringDocsCount = 0;
          const clientDocsExpiring = (client.documents || []).filter(doc => {
              if (!doc.expiry_date) return false;
              const expiry = new Date(doc.expiry_date);
              if (expiry >= today && expiry <= thirtyDaysFromNow) {
                  clientExpiringDocsCount++;
                  return true;
              }
              return false;
          });

          if (clientExpiringDocsCount > 0) {
              docsExpiringSoon.push({ clientName: client.name, documents: clientDocsExpiring });
          }

          return { ...client, expiringDocumentCount: clientExpiringDocsCount };
      });
      
      setClients(enhancedClients);
      setExpiringDocuments(docsExpiringSoon);

      setStats({
          totalClients: clientList.length,
          activeClients: clientList.filter(c => c.total_bookings > 0).length,
          expiringDocuments: docsExpiringSoon.reduce((sum, item) => sum + item.documents.length, 0),
          totalBookings: totalBookingsCount,
      });

    } catch (error) {
      console.error("Error loading clients:", error);
      alert("Failed to load clients. Please try refreshing.");
    } finally {
        setLoading(false);
    }
  };
  
  const handleSave = async (clientData) => {
    try {
        if (!currentUser?.agency_id) {
            alert("Agency information not found. Please contact support.");
            return;
        }

        const dataToSave = {
            ...clientData,
            agency_id: currentUser.agency_id
        };

        if (clientData.id) {
            console.log(`Updating client ${clientData.id} for agency ${currentUser.agency_id}`);
            await Client.update(clientData.id, dataToSave);
        } else {
            console.log(`Creating new client for agency ${currentUser.agency_id}`);
            await Client.create(dataToSave);
        }
        await loadData();
    } catch (error) {
        console.error("Error saving client:", error);
        alert("Failed to save client. Please try again.");
    }
  };

  const handleShareStatement = (client) => {
    setSelectedClientForAction(client);
    setIsStatementModalOpen(true);
  };

  const handleSendReminder = (client) => {
    setSelectedClientForAction(client);
    setIsReminderModalOpen(true);
  };

  const handleSendDocumentReminder = async (client, documents, message) => {
    try {
      // Here you would integrate with your email/notification system
      console.log("Sending document reminder:", { client, documents, message });
      
      // For now, we'll just show a success message
      alert(`Document reminder sent to ${client.name} for ${documents.length} document(s).`);
      
      // You could also log this action in the client's activity history
      await Client.update(client.id, {
        last_reminder_sent: new Date().toISOString(),
        reminder_count: (client.reminder_count || 0) + 1
      });
      
    } catch (error) {
      console.error("Error sending document reminder:", error);
      alert("Failed to send reminder. Please try again.");
    }
  };

  const filteredClients = clients
    .filter(client => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'last_booking_date') return new Date(b.last_booking_date || 0) - new Date(a.last_booking_date || 0);
        return 0;
    });

  return (
    <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Client Relationship Management</h1>
            <p className="text-amber-800/80">Manage clients, track interactions, and build lasting relationships.</p>
          </div>
          <div className="flex gap-3">
             <Button
              onClick={() => setIsImportContactsOpen(true)}
              className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Contacts
            </Button>
            <Button
              onClick={() => setSelectedClient({ documents: [], name: '', email: ''})}
              className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
          </div>
        </div>

        {expiringDocuments.length > 0 && (
            <Alert className="mb-8 bg-orange-100/50 border-orange-300/50 text-orange-900">
                <AlertCircle className="h-4 w-4 !text-orange-600" />
                <AlertTitle>Document Expiry Alert!</AlertTitle>
                <AlertDescription>
                    {stats.expiringDocuments} documents are expiring in the next 30 days. Proactively reach out to clients like {expiringDocuments.map(e => e.clientName).slice(0, 2).join(', ')} to assist with renewals.
                </AlertDescription>
            </Alert>
        )}
        
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-amber-800">Total Clients</p>
                        <p className="text-2xl font-bold text-amber-900">{stats.totalClients}</p>
                    </div>
                    <Users className="w-8 h-8 text-amber-700"/>
                </CardContent>
            </Card>
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-amber-800">Active Clients</p>
                        <p className="text-2xl font-bold text-amber-900">{stats.activeClients}</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-600"/>
                </CardContent>
            </Card>
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-amber-800">Total Bookings</p>
                        <p className="text-2xl font-bold text-amber-900">{stats.totalBookings}</p>
                    </div>
                    <Plane className="w-8 h-8 text-blue-600"/>
                </CardContent>
            </Card>
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-amber-800">Docs Expiring Soon</p>
                        <p className="text-2xl font-bold text-orange-600">{stats.expiringDocuments}</p>
                    </div>
                    <FileWarning className="w-8 h-8 text-orange-500"/>
                </CardContent>
            </Card>
        </div>

        <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Client Database</CardTitle>
                <div className="flex gap-4">
                    <Input placeholder="Search clients..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-64" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Sort by Name</SelectItem>
                            <SelectItem value="last_booking_date">Sort by Last Booking</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                    <p className="ml-3 text-amber-700">Loading clients...</p>
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <Card key={client.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start">
                                   <div>
                                     <h3 className="font-bold text-lg text-amber-900">{client.name}</h3>
                                     <p className="text-sm text-amber-700/80 flex items-center gap-2">
                                         <Mail className="w-3 h-3"/>{client.email}
                                     </p>
                                     {client.phone && (
                                         <p className="text-sm text-amber-700/80 flex items-center gap-2">
                                             <Phone className="w-3 h-3"/>{client.phone}
                                         </p>
                                     )}
                                   </div>
                                   {client.expiringDocumentCount > 0 && (
                                       <Badge variant="destructive" className="animate-pulse">Expiring Docs</Badge>
                                   )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm mt-4 text-center">
                                    <div className="p-2 bg-amber-100/50 rounded-md">
                                        <p className="font-semibold">{client.total_bookings || 0}</p>
                                        <p className="text-xs text-amber-700/80">Bookings</p>
                                    </div>
                                    <div className="p-2 bg-amber-100/50 rounded-md">
                                        <p className="font-semibold">{client.documents?.length || 0}</p>
                                        <p className="text-xs text-amber-700/80">Documents</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <Button 
                                        className="w-full" 
                                        variant="outline" 
                                        onClick={() => setSelectedClient(client)}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Profile
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="flex-1"
                                            onClick={() => handleShareStatement(client)}
                                        >
                                            <FileText className="w-3 h-3 mr-1" />
                                            Statement
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="flex-1"
                                            onClick={() => handleSendReminder(client)}
                                        >
                                            <Bell className="w-3 h-3 mr-1" />
                                            Remind
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    </div>
                    {filteredClients.length === 0 && (
                        <p className="text-center py-10 text-amber-700/80">No clients found.</p>
                    )}
                </>
            )}
          </CardContent>
        </Card>
        
        {/* Modals */}
        {selectedClient && (
            <ClientDetailModal 
                client={selectedClient} 
                onClose={() => setSelectedClient(null)} 
                onSave={handleSave}
                onShareStatement={handleShareStatement}
                onSendReminder={handleSendReminder}
            />
        )}

        {isStatementModalOpen && selectedClientForAction && (
            <ClientStatementModal
                client={selectedClientForAction}
                isOpen={isStatementModalOpen}
                onClose={() => {
                    setIsStatementModalOpen(false);
                    setSelectedClientForAction(null);
                }}
            />
        )}

        {isReminderModalOpen && selectedClientForAction && (
            <DocumentExpiryReminderModal
                client={selectedClientForAction}
                isOpen={isReminderModalOpen}
                onClose={() => {
                    setIsReminderModalOpen(false);
                    setSelectedClientForAction(null);
                }}
                onSend={handleSendDocumentReminder}
            />
        )}
      </div>
    </div>
  );
}
