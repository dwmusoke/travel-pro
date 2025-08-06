import React, { useState } from "react";
import { Invoice } from "@/api/entities";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, MessageSquare, Copy, ExternalLink } from "lucide-react";

export default function WhatsAppShareModal({ invoice, isOpen, onClose, onSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState(invoice?.client_phone || '');
  const [message, setMessage] = useState(`Hi ${invoice?.client_name || 'there'}!

Your invoice is ready:

📄 Invoice: ${invoice?.invoice_number}
💰 Amount Due: ${invoice?.currency || 'USD'} ${invoice?.balance_due?.toFixed(2) || '0.00'}
📅 Due Date: ${invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}

${invoice?.items?.map(item => `• ${item.description}: ${invoice?.currency || 'USD'} ${item.total?.toFixed(2) || '0.00'}`).join('\n') || ''}

Total: ${invoice?.currency || 'USD'} ${invoice?.total_amount?.toFixed(2) || '0.00'}
Paid: ${invoice?.currency || 'USD'} ${invoice?.amount_paid?.toFixed(2) || '0.00'}
Balance: ${invoice?.currency || 'USD'} ${invoice?.balance_due?.toFixed(2) || '0.00'}

Thank you for choosing our travel services! 🌍✈️`);

  const handleWhatsAppShare = async () => {
    try {
        // Update invoice status if it was a draft
        if (invoice.status === 'draft') {
            await Invoice.update(invoice.id, { status: 'sent' });
        }

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = phoneNumber 
          ? `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`
          : `https://wa.me/?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
        
        // Notify parent component to reload data
        if (onSuccess) {
            onSuccess();
        }
        onClose(); // Close the modal after opening WhatsApp
    } catch (error) {
        console.error("Failed to update invoice status:", error);
        alert("Failed to update invoice status. Please try again.");
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    alert('Message copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-amber-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Share Invoice via WhatsApp
            </DialogTitle>
            <Button variant="ghost" onClick={onClose} className="text-amber-800 hover:bg-amber-800/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-amber-900">Phone Number (Optional)</Label>
            <Input 
              id="phone" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="bg-amber-100/50 border-amber-300/50 text-amber-900"
            />
            <p className="text-xs text-amber-700">Include country code. Leave empty to share without specific recipient.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-amber-900">Message</Label>
            <Textarea 
              id="message" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="bg-amber-100/50 border-amber-300/50 text-amber-900 font-mono text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCopyMessage} className="bg-amber-100/50 text-amber-900 border-amber-300/50">
              <Copy className="w-4 h-4 mr-2" />
              Copy Message
            </Button>
            <Button variant="outline" onClick={onClose} className="bg-amber-100/50 text-amber-900 border-amber-300/50">
              Cancel
            </Button>
            <Button onClick={handleWhatsAppShare} className="bg-green-600 text-white hover:bg-green-700">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}