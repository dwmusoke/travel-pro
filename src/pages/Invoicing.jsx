
import React, { useState, useEffect } from "react";
import { Invoice, GDSTicket, User, Client } from "@/api/entities";
import RecordPaymentModal from "@/components/invoices/RecordPaymentModal";
import EmailInvoiceModal from "@/components/invoices/EmailInvoiceModal";
import WhatsAppShareModal from "@/components/invoices/WhatsAppShareModal";
import ClientStatementModal from "@/components/invoices/ClientStatementModal";
import ReminderSettingsModal from "@/components/invoices/ReminderSettingsModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
    Plus,
    FileText,
    DollarSign,
    Clock,
    CheckCircle,
    Send,
    Search,
    Receipt,
    Eye,
    Trash2,
    TrendingUp,
    MoreVertical,
    Mail,
    MessageSquare,
    Calendar,
    AlertTriangle,
    Download,
    Bell
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Invoicing() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [ticketsWaitingForInvoice, setTicketsWaitingForInvoice] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        outstandingAmount: 0,
        overdueAmount: 0,
        drafts: 0,
        sent: 0,
        paid: 0
    });
    const [user, setUser] = useState(null);

    // Modal states
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);

            if (!currentUser.agency_id) {
                console.error("User has no agency_id - cannot load invoices");
                setInvoices([]);
                setTicketsWaitingForInvoice([]);
                setLoading(false);
                return;
            }

            console.log(`Loading invoices for agency: ${currentUser.agency_id}`);

            const [invoiceList, ticketList] = await Promise.all([
                Invoice.filter({ agency_id: currentUser.agency_id }, '-created_date', 100),
                GDSTicket.filter({
                    agency_id: currentUser.agency_id,
                    processing_status: 'completed',
                    invoice_id: null
                }, '-created_date', 50),
            ]);

            console.log(`Loaded ${invoiceList.length} invoices and ${ticketList.length} pending tickets`);

            setInvoices(invoiceList);
            setTicketsWaitingForInvoice(ticketList);
            calculateStats(invoiceList);
        } catch (error) {
            console.error("Failed to load invoicing data:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (invoices) => {
        const newStats = {
            totalRevenue: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
            outstandingAmount: invoices.filter(inv => ['sent', 'partial', 'overdue'].includes(inv.status)).reduce((sum, inv) => sum + (inv.balance_due || 0), 0),
            overdueAmount: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.balance_due || 0), 0),
            drafts: invoices.filter(inv => inv.status === 'draft').length,
            sent: invoices.filter(inv => inv.status === 'sent').length,
            paid: invoices.filter(inv => inv.status === 'paid').length
        };
        setStats(newStats);
    };

    const filteredInvoices = invoices.filter(invoice =>
        (invoice.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusVariant = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800 border-green-200';
            case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
            case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleSendInvoice = async (invoice) => {
        if (window.confirm('Are you sure you want to mark this invoice as sent?')) {
            try {
                await Invoice.update(invoice.id, { status: 'sent' });
                loadData();
            } catch(e) {
                alert("Failed to send invoice.");
            }
        }
    };

    const handleDeleteInvoice = async (invoiceId) => {
        if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
            try {
                await Invoice.delete(invoiceId);
                loadData();
            } catch (error) {
                console.error("Failed to delete invoice:", error);
                alert("Failed to delete invoice.");
            }
        }
    };

    const handleGenerateStatement = async (clientName) => {
        if (!clientName) {
            alert("Cannot generate statement for a client with no name.");
            return;
        }
        setSelectedClient({ name: clientName, agencyId: user.agency_id });
        setIsStatementModalOpen(true);
    };

    const handleSuccess = () => {
        loadData();
        setIsPaymentModalOpen(false);
        setIsEmailModalOpen(false);
        setIsWhatsAppModalOpen(false);
    };

    if (loading) {
        return <div className="p-8">Loading invoices...</div>;
    }

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">Invoicing</h1>
                        <p className="text-amber-800/80 dark:text-amber-200/80">Create, manage, and track all your agency's invoices.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsReminderModalOpen(true)}
                            className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm"
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Reminder Settings
                        </Button>
                        <Link to={createPageUrl("InvoiceEditor")}>
                            <Button className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Invoice
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Revenue Opportunity Alert */}
                {ticketsWaitingForInvoice.length > 0 && (
                    <Card className="mb-8 bg-emerald-100/50 backdrop-blur-sm border-emerald-300/50 rounded-xl shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-200/50 rounded-full border border-emerald-300">
                                    <TrendingUp className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-emerald-900 text-lg">Revenue Opportunity: ${ticketsWaitingForInvoice.reduce((sum, t) => sum + (t.total_amount || 0), 0).toFixed(2)}</h3>
                                    <p className="text-emerald-800">You have {ticketsWaitingForInvoice.length} processed tickets ready for invoicing. Don't let revenue sit idle!</p>
                                </div>
                                <div className="flex gap-2">
                                  <Link to={createPageUrl(`InvoiceEditor?ticket_id=${ticketsWaitingForInvoice[0].id}`)}>
                                    <Button className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Invoice Now
                                    </Button>
                                  </Link>
                                    <Button variant="outline" className="border-emerald-400 text-emerald-800 rounded-lg shadow-sm">
                                        <Receipt className="w-4 h-4 mr-2" />
                                        Bulk Generate
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Enhanced Quick Stats */}
                <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
                    <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-amber-700/80">Total Revenue</p>
                                    <p className="text-2xl font-bold text-green-700">${stats.totalRevenue.toFixed(2)}</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-amber-700/80">Outstanding</p>
                                    <p className="text-2xl font-bold text-blue-700">${stats.outstandingAmount.toFixed(2)}</p>
                                </div>
                                <Clock className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-amber-700/80">Overdue</p>
                                    <p className="text-2xl font-bold text-red-700">${stats.overdueAmount.toFixed(2)}</p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-amber-700/80">Drafts</p>
                                    <p className="text-2xl font-bold text-gray-700">{stats.drafts}</p>
                                </div>
                                <FileText className="w-8 h-8 text-gray-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-amber-700/80">Sent</p>
                                    <p className="text-2xl font-bold text-blue-700">{stats.sent}</p>
                                </div>
                                <Send className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-amber-700/80">Paid</p>
                                    <p className="text-2xl font-bold text-green-700">{stats.paid}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Invoice List */}
                <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-amber-900 dark:text-amber-100">Invoice History ({filteredInvoices.length})</CardTitle>
                        <div className="mt-4">
                            <Input
                                placeholder="Search by client name or invoice #"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm bg-amber-100/50 text-amber-900 border-amber-300/50 focus:border-amber-500 rounded-xl"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredInvoices.map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-4 border border-amber-200/50 rounded-xl bg-amber-50/50 backdrop-blur-md shadow-sm">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-10 h-10 bg-amber-200/50 rounded-full flex items-center justify-center border border-amber-300/50">
                                            <FileText className="w-5 h-5 text-amber-800" />
                                        </div>
                                        <div>
                                            <Link to={createPageUrl(`InvoiceEditor?id=${invoice.id}`)} className="font-medium text-amber-900 hover:underline">{invoice.invoice_number}</Link>
                                            <p className="text-sm text-amber-800/80">{invoice.client_name}</p>
                                            <p className="text-xs text-amber-700/80">
                                                Due: {new Date(invoice.due_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="hidden md:block text-right">
                                        <p className="font-bold text-lg text-amber-900">${invoice.total_amount?.toFixed(2)}</p>
                                        <p className="text-sm text-orange-600">
                                            Balance: ${invoice.balance_due?.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="hidden lg:block mx-4 text-center">
                                        <Badge variant="outline" className={getStatusVariant(invoice.status)}>
                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedInvoice(invoice);
                                                        setIsPaymentModalOpen(true);
                                                    }}
                                                    disabled={invoice.status === 'paid' || invoice.status === 'draft'}
                                                >
                                                    <DollarSign className="mr-2 h-4 w-4" />
                                                    Record Payment
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleSendInvoice(invoice)}
                                                    disabled={invoice.status !== 'draft'}
                                                >
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Mark as Sent
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedInvoice(invoice);
                                                        setIsEmailModalOpen(true);
                                                    }}
                                                >
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Email Invoice
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedInvoice(invoice);
                                                        setIsWhatsAppModalOpen(true);
                                                    }}
                                                >
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    Share via WhatsApp
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleGenerateStatement(invoice.client_name)}
                                                    disabled={!invoice.client_name}
                                                >
                                                    <Receipt className="mr-2 h-4 w-4" />
                                                    Client Statement
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link to={createPageUrl(`InvoiceEditor?id=${invoice.id}`)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View/Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteInvoice(invoice.id)}
                                                    className="text-red-500"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}

                            {filteredInvoices.length === 0 && (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-amber-900 mb-2">No Invoices Found</h3>
                                    <p className="text-amber-800/80 mb-6">
                                        {searchTerm ? "No invoices match your search criteria." : "Create your first invoice to get started."}
                                    </p>
                                    <Link to={createPageUrl("InvoiceEditor")}>
                                        <Button className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create First Invoice
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modals */}
            {isPaymentModalOpen && selectedInvoice && (
                <RecordPaymentModal
                    invoice={selectedInvoice}
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onPaymentSuccess={handleSuccess}
                />
            )}

            {isEmailModalOpen && selectedInvoice && (
                <EmailInvoiceModal
                    invoice={selectedInvoice}
                    isOpen={isEmailModalOpen}
                    onClose={() => setIsEmailModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}

            {isWhatsAppModalOpen && selectedInvoice && (
                <WhatsAppShareModal
                    invoice={selectedInvoice}
                    isOpen={isWhatsAppModalOpen}
                    onClose={() => setIsWhatsAppModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}

            {isStatementModalOpen && selectedClient && (
                <ClientStatementModal
                    client={selectedClient}
                    isOpen={isStatementModalOpen}
                    onClose={() => setIsStatementModalOpen(false)}
                />
            )}

            {isReminderModalOpen && (
                <ReminderSettingsModal
                    isOpen={isReminderModalOpen}
                    onClose={() => setIsReminderModalOpen(false)}
                />
            )}
        </div>
    );
}
