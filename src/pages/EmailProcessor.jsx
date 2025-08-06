
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, Zap, CheckCircle, AlertTriangle, Loader2, Clock, Users } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { GDSTicket, Client, Booking, Invoice, User } from '@/api/entities';
import { executeWorkflow } from '@/api/functions';
import rateLimitManager from '../components/common/RateLimitManager';

const ticketSchema = {
    type: "object",
    properties: {
        tickets: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    pnr: { type: "string" },
                    ticket_number: { type: "string" },
                    passenger_name: { type: "string" },
                    passenger_email: { type: "string" },
                    passenger_phone: { type: "string" },
                    total_amount: { type: "number" },
                    currency: { type: "string" },
                    base_fare: { type: "number" },
                    taxes: { type: "number" },
                    booking_reference: { type: "string" },
                    flight_segments: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                airline: { type: "string" },
                                flight_number: { type: "string" },
                                origin: { type: "string" },
                                destination: { type: "string" },
                                departure_date: { type: "string", format: "date-time" },
                                arrival_date: { type: "string", format: "date-time" }
                            }
                        }
                    }
                }
            }
        }
    }
};

export default function EmailProcessor() {
    const [emailContent, setEmailContent] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [queueStatus, setQueueStatus] = useState({ queueLength: 0, processing: false });
    const [lastProcessTime, setLastProcessTime] = useState(0);

    const handleProcessEmail = async () => {
        if (!emailContent.trim()) {
            setError("Email content cannot be empty.");
            return;
        }

        // Enforce minimum time between requests (30 seconds)
        const now = Date.now();
        const timeSinceLastProcess = now - lastProcessTime;
        if (timeSinceLastProcess < 30000) {
            const waitTime = Math.ceil((30000 - timeSinceLastProcess) / 1000);
            setError(`Please wait ${waitTime} more seconds before processing another email to avoid rate limits.`);
            return;
        }

        // Check if content is too long (helps avoid rate limits)
        if (emailContent.length > 8000) {
            setError("Email content is too long (max 8,000 characters). Please remove unnecessary content and try again.");
            return;
        }

        setIsProcessing(true);
        setError(null);
        setSuccess(null);
        setLastProcessTime(now);

        try {
            const user = await User.me();
            if (!user || !user.agency_id) {
                throw new Error("User agency information not found.");
            }

            // Show queue status
            const updateQueueStatus = () => {
                setQueueStatus(rateLimitManager.getStatus());
            };
            
            const queueInterval = setInterval(updateQueueStatus, 1000);
            updateQueueStatus();

            try {
                // Use rate limit manager for AI call with more conservative prompt
                const result = await rateLimitManager.executeWithRateLimit(async () => {
                    return await InvokeLLM({
                        prompt: `Extract flight ticket information from this e-ticket email. Focus on essential details only.

IMPORTANT: Only extract actual flight tickets, ignore other content.

Email Content (truncated for processing):
---
${emailContent.substring(0, 4000)}
---`,
                        response_json_schema: ticketSchema,
                    });
                });

                clearInterval(queueInterval);

                if (result && result.tickets && result.tickets.length > 0) {
                    let totalProcessed = 0;
                    let clientsCreated = 0;
                    let bookingsCreated = 0;
                    let invoicesCreated = 0;

                    // Process each ticket with longer delays
                    for (let i = 0; i < result.tickets.length; i++) {
                        const ticketData = result.tickets[i];
                        
                        try {
                            // Create the ticket
                            const ticket = await GDSTicket.create({
                                ...ticketData,
                                gds_source: 'email',
                                status: 'active',
                                processing_status: 'pending',
                                agency_id: user.agency_id,
                                agent_email: user.email,
                                passenger_email: ticketData.passenger_email || `${ticketData.passenger_name?.replace(/\s+/g, '').toLowerCase()}@example.com`,
                                booking_reference: ticketData.booking_reference || `BKG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                                total_amount: ticketData.total_amount || ticketData.base_fare || 100
                            });
                            totalProcessed++;

                            // Longer delay between operations
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            
                            try {
                                const workflowResponse = await executeWorkflow({
                                    workflow_type: 'auto_process_ticket',
                                    trigger_data: ticket
                                });

                                if (workflowResponse?.data?.created_records) {
                                    const records = workflowResponse.data.created_records;
                                    if (records.client_id) clientsCreated++;
                                    if (records.booking_id) bookingsCreated++;
                                    if (records.invoice_id) invoicesCreated++;
                                }
                            } catch (workflowError) {
                                console.warn("Workflow failed, using manual creation:", workflowError);

                                // Manual fallback with longer delays
                                await new Promise(resolve => setTimeout(resolve, 1000));

                                const existingClients = await Client.filter({ 
                                    email: ticket.passenger_email,
                                    agency_id: user.agency_id 
                                });
                                
                                let client;
                                if (existingClients.length > 0) {
                                    client = existingClients[0];
                                } else {
                                    client = await Client.create({
                                        name: ticket.passenger_name,
                                        email: ticket.passenger_email,
                                        phone: ticket.passenger_phone || '',
                                        agency_id: user.agency_id,
                                        total_bookings: 1
                                    });
                                    clientsCreated++;
                                }

                                await new Promise(resolve => setTimeout(resolve, 1000));

                                const booking = await Booking.create({
                                    booking_reference: ticket.booking_reference,
                                    client_name: ticket.passenger_name,
                                    client_email: ticket.passenger_email,
                                    booking_type: 'flight',
                                    status: 'confirmed',
                                    total_amount: ticket.total_amount,
                                    currency: ticket.currency || 'USD',
                                    agency_id: user.agency_id,
                                    agent_email: user.email
                                });
                                bookingsCreated++;

                                await new Promise(resolve => setTimeout(resolve, 1000));

                                const invoice = await Invoice.create({
                                    invoice_number: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                                    ticket_id: ticket.id,
                                    client_name: ticket.passenger_name,
                                    client_email: ticket.passenger_email,
                                    total_amount: ticket.total_amount,
                                    balance_due: ticket.total_amount,
                                    currency: ticket.currency || 'USD',
                                    status: 'draft',
                                    agency_id: user.agency_id,
                                    agent_email: user.email,
                                    items: [{
                                        description: `Flight Ticket - ${ticket.ticket_number}`,
                                        quantity: 1,
                                        unit_price: ticket.total_amount,
                                        total: ticket.total_amount
                                    }]
                                });
                                invoicesCreated++;

                                await GDSTicket.update(ticket.id, {
                                    client_id: client.id,
                                    booking_id: booking.id,
                                    invoice_id: invoice.id,
                                    processing_status: 'completed'
                                });
                            }
                        } catch (ticketError) {
                            console.error("Error processing individual ticket:", ticketError);
                        }
                        
                        // Longer delay between tickets
                        if (i < result.tickets.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 3000));
                        }
                    }

                    const successMessage = [
                        `Successfully processed ${totalProcessed} ticket(s)!`,
                        `📋 ${totalProcessed} tickets created`,
                        `👥 ${clientsCreated} clients created/updated`,
                        `🎫 ${bookingsCreated} bookings generated`,
                        `📄 ${invoicesCreated} invoices created`
                    ].join('\n');

                    setSuccess(successMessage);
                    setEmailContent('');
                } else {
                    throw new Error("Could not extract valid ticket information from the email content. Please ensure the email contains flight ticket details and try shortening the content.");
                }
            } catch (aiError) {
                clearInterval(queueInterval);
                throw aiError;
            }
        } catch (e) {
            console.error("Email processing failed:", e);
            let errorMessage = e.message || "An unexpected error occurred during processing.";
            
            if (e.message.includes('Rate limit') || e.message.includes('overloaded') || e.message.includes('request queue') || e.message.includes('Service currently unavailable')) {
                errorMessage = "The system is currently overloaded or experiencing high demand. Please wait 15-20 minutes and try again with shorter, cleaner content. If the issue persists, contact support.";
            }
            
            setError(errorMessage);
        } finally {
            setIsProcessing(false);
            setQueueStatus({ queueLength: 0, processing: false });
        }
    };

    return (
        <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
            <div className="max-w-4xl mx-auto">
                <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-amber-900">
                            <Mail className="w-6 h-6 text-amber-800" />
                            <span>E-Ticket Email Processor</span>
                        </CardTitle>
                        <p className="text-amber-800/80">
                            Paste the content of an e-ticket email below. <strong>Maximum 8,000 characters.</strong> Remove signatures and forwarding history for best results.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <Alert variant="destructive" className="bg-red-100/50 border-red-200/50 text-red-800">
                                <AlertTriangle className="h-4 w-4 text-red-700" />
                                <AlertTitle>Processing Failed</AlertTitle>
                                <AlertDescription>
                                    {error}
                                    {(error.includes('overloaded') || error.includes('15-20 minutes') || error.includes('high demand')) && (
                                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                            <strong>🛡️ System Protection Tips:</strong>
                                            <ul className="list-disc list-inside ml-4 mt-2 text-sm">
                                                <li>Wait at least 30 seconds between email submissions</li>
                                                <li>Keep content under 4,000 characters when possible</li>
                                                <li>Remove all email signatures, headers, and forwarding history</li>
                                                <li>Focus only on the actual ticket information</li>
                                                <li>Process one email at a time</li>
                                            </ul>
                                        </div>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        {success && (
                            <Alert variant="default" className="bg-green-100/50 border-green-200/50 text-green-800">
                                <CheckCircle className="h-4 w-4 text-green-700" />
                                <AlertTitle className="text-green-900">Success</AlertTitle>
                                <AlertDescription className="whitespace-pre-line">{success}</AlertDescription>
                            </Alert>
                        )}

                        {queueStatus.queueLength > 0 && (
                            <Alert className="bg-blue-50/50 border-blue-200/50 text-blue-800">
                                <Users className="h-4 w-4 text-blue-700" />
                                <AlertTitle>Processing Queue</AlertTitle>
                                <AlertDescription>
                                    Your request is being processed with extended delays to prevent system overload.<br/>
                                    Queue position: {queueStatus.queueLength} | 
                                    Estimated wait: {Math.ceil(queueStatus.estimatedWaitTime / 1000)}s
                                    {queueStatus.backoffMultiplier > 1 && ` | System load factor: ${queueStatus.backoffMultiplier}x`}
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-amber-900">Email Content</label>
                                <span className={`text-xs ${emailContent.length > 8000 ? 'text-red-600 font-bold' : 'text-amber-700'}`}>
                                    {emailContent.length} / 8,000 characters
                                </span>
                            </div>
                            <Textarea
                                placeholder="Paste ONLY the ticket information here. Remove signatures, forwarding history, and other unnecessary content..."
                                className="min-h-[300px] font-mono text-sm bg-amber-100/30 border-amber-300/50 rounded-lg backdrop-blur-sm"
                                value={emailContent}
                                onChange={(e) => setEmailContent(e.target.value)}
                                disabled={isProcessing}
                                maxLength={8000}
                            />
                        </div>
                        
                        <Button
                            onClick={handleProcessEmail}
                            disabled={isProcessing || !emailContent.trim() || emailContent.length > 8000}
                            className="w-full bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing Email...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 mr-2" />
                                    Process & Create All Records
                                </>
                            )}
                        </Button>
                        
                        {/* Enhanced Guidelines Card */}
                        <Card className="bg-blue-50/50 border-blue-200/50">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-blue-900 mb-1">System Protection Guidelines</h4>
                                        <p className="text-sm text-blue-800 mb-2">
                                            Our system has enhanced protection to ensure stability:
                                        </p>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• <strong>30-second minimum</strong> between email submissions</li>
                                            <li>• <strong>8,000 character limit</strong> - shorter is better</li>
                                            <li>• Remove all email headers, signatures, and forwarding chains</li>
                                            <li>• Keep only the actual flight ticket information</li>
                                            <li>• Process one email at a time for best results</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
