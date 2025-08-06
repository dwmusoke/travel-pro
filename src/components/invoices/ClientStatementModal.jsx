import React, { useState, useEffect } from "react";
import { Invoice } from "@/api/entities";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Mail, Copy, Download, Loader2 } from "lucide-react";

export default function ClientStatementModal({ client, isOpen, onClose }) {
  const [statementContent, setStatementContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && client?.name && client?.agencyId) {
      generateStatement();
    }
  }, [isOpen, client]);

  const generateStatement = async () => {
    setLoading(true);
    try {
      const clientInvoices = await Invoice.filter({
        agency_id: client.agencyId,
        client_name: client.name
      }, '-created_date');

      if (!clientInvoices || clientInvoices.length === 0) {
        setStatementContent(`No invoices found for ${client.name}.`);
        return;
      }

      const totalInvoiced = clientInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const totalPaid = clientInvoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
      const outstandingBalance = totalInvoiced - totalPaid;

      const invoiceDetails = clientInvoices.map(inv => `
Invoice: ${inv.invoice_number || 'N/A'}
Date: ${inv.created_date ? new Date(inv.created_date).toLocaleDateString() : 'N/A'}
Amount: ${inv.currency || 'USD'} ${inv.total_amount?.toFixed(2) || '0.00'}
Paid: ${inv.currency || 'USD'} ${inv.amount_paid?.toFixed(2) || '0.00'}
Balance: ${inv.currency || 'USD'} ${inv.balance_due?.toFixed(2) || '0.00'}
Status: ${inv.status || 'N/A'}
Due: ${inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}
`).join('\n\n');

      const statement = `ACCOUNT STATEMENT

Client: ${client.name}
Statement Date: ${new Date().toLocaleDateString()}
Period: All Time

SUMMARY:
Total Invoiced: ${clientInvoices[0]?.currency || 'USD'} ${totalInvoiced.toFixed(2)}
Total Paid: ${clientInvoices[0]?.currency || 'USD'} ${totalPaid.toFixed(2)}
Outstanding Balance: ${clientInvoices[0]?.currency || 'USD'} ${outstandingBalance.toFixed(2)}

INVOICE DETAILS:
${invoiceDetails}

Thank you for your business!
Your Travel Agency`;

      setStatementContent(statement);

    } catch (error) {
      console.error("Error generating client statement:", error);
      setStatementContent("Error: Could not generate the client statement.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(statementContent);
    alert('Statement copied to clipboard! You can paste this into your email client.');
  };

  const handleDownloadAsText = () => {
    const blob = new Blob([statementContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement-${client?.name?.replace(/\s/g, '_') || 'client'}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-amber-900 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Client Statement for {client?.name}
            </DialogTitle>
            <Button variant="ghost" onClick={onClose} className="text-amber-800 hover:bg-amber-800/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">📧 Email Options</h4>
            <p className="text-sm text-blue-800">Use the copy or download options to send this statement via your own email client.</p>
          </div>
          
          <pre className="w-full min-h-[300px] p-4 font-mono text-sm bg-amber-100/30 border-amber-300/50 rounded-lg backdrop-blur-sm overflow-auto">
            {loading ? <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-amber-700"/></div> : statementContent}
          </pre>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCopyToClipboard}
              disabled={loading}
              className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
            <Button
              onClick={handleDownloadAsText}
              disabled={loading}
              className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Download as .txt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}