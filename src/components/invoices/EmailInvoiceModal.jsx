import React, { useState } from "react";
import { Invoice } from "@/api/entities";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Mail, Copy, Download } from "lucide-react";

export default function EmailInvoiceModal({ invoice, isOpen, onClose, onSuccess }) {
  const [emailData, setEmailData] = useState({
    to: invoice?.client_email || '',
    subject: `Invoice ${invoice?.invoice_number} from Your Travel Agency`,
    body: `Dear ${invoice?.client_name || 'Valued Client'},

Please find your invoice details below:

Invoice Number: ${invoice?.invoice_number}
Amount Due: ${invoice?.currency || 'USD'} ${invoice?.balance_due?.toFixed(2) || '0.00'}
Due Date: ${invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}

Invoice Details:
${invoice?.items?.map(item => `• ${item.description}: ${invoice?.currency || 'USD'} ${item.total?.toFixed(2) || '0.00'}`).join('\n') || ''}

Total Amount: ${invoice?.currency || 'USD'} ${invoice?.total_amount?.toFixed(2) || '0.00'}
Amount Paid: ${invoice?.currency || 'USD'} ${invoice?.amount_paid?.toFixed(2) || '0.00'}
Balance Due: ${invoice?.currency || 'USD'} ${invoice?.balance_due?.toFixed(2) || '0.00'}

${invoice?.notes ? `\nNotes: ${invoice.notes}` : ''}

Thank you for choosing our travel services. Please don't hesitate to contact us if you have any questions.

Best regards,
Your Travel Agency Team`
  });

  const handleCopyToClipboard = () => {
    const emailContent = `To: ${emailData.to}
Subject: ${emailData.subject}

${emailData.body}`;
    
    navigator.clipboard.writeText(emailContent);
    alert('Email content copied to clipboard! You can paste this into your email client.');
  };

  const handleDownloadAsText = () => {
    const emailContent = `To: ${emailData.to}
Subject: ${emailData.subject}
Date: ${new Date().toLocaleString()}

${emailData.body}`;
    
    const blob = new Blob([emailContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice?.invoice_number || 'email'}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleMarkAsSent = async () => {
    try {
      if (invoice.status === 'draft') {
        await Invoice.update(invoice.id, { status: 'sent' });
      }
      
      alert('Invoice marked as sent! Use the copy or download options to send via your email client.');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to update invoice status:", error);
      alert('Failed to update invoice status. Please try again.');
    }
  };

  if (!isOpen || !invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-amber-900 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Invoice to {invoice?.client_name}
            </DialogTitle>
            <Button variant="ghost" onClick={onClose} className="text-amber-800 hover:bg-amber-800/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">📧 Email Options</h4>
            <p className="text-sm text-blue-800">Choose how you'd like to send this invoice to your client:</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="to" className="text-amber-900">To</Label>
            <Input 
              id="to" 
              value={emailData.to} 
              onChange={(e) => setEmailData({...emailData, to: e.target.value})}
              className="bg-amber-100/50 border-amber-300/50 text-amber-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-amber-900">Subject</Label>
            <Input 
              id="subject" 
              value={emailData.subject} 
              onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              className="bg-amber-100/50 border-amber-300/50 text-amber-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body" className="text-amber-900">Message</Label>
            <Textarea 
              id="body" 
              value={emailData.body} 
              onChange={(e) => setEmailData({...emailData, body: e.target.value})}
              rows={12}
              className="bg-amber-100/50 border-amber-300/50 text-amber-900"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-amber-200/50">
            <Button variant="outline" onClick={onClose} className="bg-amber-100/50 text-amber-900 border-amber-300/50">
              Cancel
            </Button>
            <Button onClick={handleDownloadAsText} variant="outline" className="bg-blue-100/50 text-blue-900 border-blue-300/50">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleCopyToClipboard} variant="outline" className="bg-green-100/50 text-green-900 border-green-300/50">
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
            <Button onClick={handleMarkAsSent} className="bg-amber-800 text-white hover:bg-amber-900">
              <Send className="w-4 h-4 mr-2" />
              Mark as Sent
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}