import React, { useState } from 'react';
import { Payment, Invoice } from "@/api/entities";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DollarSign } from 'lucide-react';

export default function RecordPaymentModal({ invoice, isOpen, onClose, onPaymentSuccess }) {
  const [amount, setAmount] = useState(invoice?.balance_due || 0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // 1. Create the payment record
      await Payment.create({
        invoice_id: invoice.id,
        client_name: invoice.client_name,
        amount: parseFloat(amount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference_number: referenceNumber,
        agency_id: invoice.agency_id
      });

      // 2. Update the invoice status and balance
      const newAmountPaid = (invoice.amount_paid || 0) + parseFloat(amount);
      const newBalanceDue = invoice.total_amount - newAmountPaid;
      const newStatus = newBalanceDue <= 0 ? 'paid' : 'partial';

      await Invoice.update(invoice.id, {
        amount_paid: newAmountPaid,
        balance_due: newBalanceDue,
        status: newStatus
      });

      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to record payment:", error);
      alert("There was an error recording the payment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-amber-50/80 backdrop-blur-md border-amber-200/50 dark:bg-gray-800/80 dark:border-gray-700/50">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-100">Record Payment for Invoice #{invoice.invoice_number}</DialogTitle>
          <DialogDescription>
            Record a payment received from {invoice.client_name}. Balance due: ${invoice.balance_due?.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-amber-800 dark:text-amber-200">Payment Amount</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentDate" className="text-amber-800 dark:text-amber-200">Payment Date</Label>
            <Input id="paymentDate" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-amber-800 dark:text-amber-200">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="BSP Settlement">BSP Settlement</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referenceNumber" className="text-amber-800 dark:text-amber-200">Reference / Note</Label>
            <Input id="referenceNumber" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="e.g., Transaction ID, Check #" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
            <DollarSign className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}