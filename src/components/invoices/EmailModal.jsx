import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Send } from "lucide-react";
import { SendEmail } from "@/api/integrations"; // Import the integration

export default function EmailModal({ invoice, onClose, onSent }) {
  if (!invoice) return null;

  const [subject, setSubject] = useState(`Invoice ${invoice.invoice_number} from TravelHub`);
  const [body, setBody] = useState(`Dear ${invoice.client_name},

Please find your invoice attached.

Total Amount: ${invoice.currency} ${invoice.total_amount?.toFixed(2)}
Due Date: ${new Date(invoice.due_date).toLocaleDateString()}

Thank you for your business.

Best regards,
TravelHub Agency`);
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      await SendEmail({
        to: invoice.client_email,
        subject: subject,
        body: body,
      });
      alert('Email sent successfully!');
      onSent();
      onClose();
    } catch (error) {
      console.error("Failed to send email:", error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Send Invoice to {invoice.client_name}</CardTitle>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input id="to" value={invoice.client_email} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSendEmail} disabled={isSending}>
              <Send className="w-4 h-4 mr-2" />
              {isSending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}