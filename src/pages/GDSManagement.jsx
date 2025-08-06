
import React, { useState, useCallback, useRef, useEffect } from "react";
import { GDSTicket, User, Client, Booking, Invoice } from "@/api/entities";
import { InvokeLLM, UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  Plane,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  ArrowRight,
  Cloud,
  Zap,
  X
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import GoogleDriveSetup from "../components/gds/GoogleDriveSetup";
import { executeWorkflow } from "@/api/functions";
import rateLimitManager from "../components/common/RateLimitManager";

export default function GDSManagement() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("manual");
  const [processingProgress, setProcessingProgress] = useState({});
  const [jobSummary, setJobSummary] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const fileInputRef = useRef(null);
  const [queueStatus, setQueueStatus] = useState({ queueLength: 0, processing: false, estimatedWaitTime: 0, backoffMultiplier: 1 });
  const [cooldownActive, setCooldownActive] = useState(false);

  useEffect(() => {
    loadTickets();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const loadTickets = async () => {
    try {
      const user = await User.me();
      
      if (!user?.agency_id) {
        console.error("User has no agency_id - cannot load tickets");
        setTickets([]);
        return;
      }

      console.log(`Loading tickets for agency: ${user.agency_id}`);
      
      const ticketList = await GDSTicket.filter({ agency_id: user.agency_id }, '-created_date', 50);
      
      console.log(`Loaded ${ticketList.length} tickets for agency ${user.agency_id}`);
      setTickets(ticketList);
    } catch (error) {
      console.error("Error loading tickets:", error);
      setTickets([]);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.xml')
    );

    if (droppedFiles.length === 0) {
      setError("Please upload .txt, .csv, or .xml files only");
      return;
    }

    const existingFileNames = files.map(f => f.name);
    const newFiles = droppedFiles.filter(file => !existingFileNames.includes(file.name));

    if (newFiles.length < droppedFiles.length) {
      setError(`${droppedFiles.length - newFiles.length} file(s) already selected. Added ${newFiles.length} new file(s).`);
    } else {
      setError(null);
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, [files]);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      file => file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.xml')
    );
    
    if (selectedFiles.length === 0) {
      setError("Please select .txt, .csv, or .xml files only");
      return;
    }

    const existingFileNames = files.map(f => f.name);
    const newFiles = selectedFiles.filter(file => !existingFileNames.includes(file.name));
    
    if (newFiles.length < selectedFiles.length) {
      setError(`${selectedFiles.length - newFiles.length} file(s) already selected. Added ${newFiles.length} new file(s).`);
    } else {
      setError(null);
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = null; 
  };

  const detectGDSSource = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('amadeus') || lower.includes('1a')) return 'amadeus';
    if (lower.includes('sabre') || lower.includes('aa')) return 'sabre';
    if (lower.includes('galileo') || lower.includes('1g')) return 'galileo';
    return 'amadeus';
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    if (!currentUser?.agency_id) {
      setError("Agency information not found. Please contact support.");
      return;
    }

    // More restrictive file limits
    if (files.length > 2) {
      setError("Please process maximum 2 files at a time to avoid system overload. Select fewer files and try again.");
      return;
    }

    // Check if we're in cooldown
    if (cooldownActive) {
      setError("System is in cooldown mode. Please wait a few minutes before processing more files.");
      return;
    }

    setProcessing(true);
    setError(null);
    setProcessingProgress({});
    setJobSummary(null);

    // Queue status updater
    const queueInterval = setInterval(() => {
      setQueueStatus(rateLimitManager.getStatus());
    }, 1000);

    try {
      let totalTicketsCreated = 0;
      let totalClientsCreated = 0;
      let totalBookingsCreated = 0;
      let totalInvoicesCreated = 0;

      // Process files one by one with much longer delays
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Add mandatory delay between files
        if (i > 0) {
          setProcessingProgress(prev => ({
            ...prev,
            [file.name]: { status: 'waiting', progress: 10, message: 'Waiting to prevent rate limits...' }
          }));
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay between files
        }

        try {
          setProcessingProgress(prev => ({
            ...prev,
            [file.name]: { status: 'uploading', progress: 20 }
          }));

          const { file_url } = await UploadFile({ file });
          const gdsSource = detectGDSSource(file.name);

          // Add delay after upload
          await new Promise(resolve => setTimeout(resolve, 2000));

          setProcessingProgress(prev => ({
            ...prev,
            [file.name]: { status: 'extracting_data', progress: 40 }
          }));

          const json_schema = {
            type: "object",
            properties: {
              tickets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    pnr: { type: "string" },
                    booking_reference: { type: "string" },
                    ticket_number: { type: "string" },
                    passenger_name: { type: "string" },
                    passenger_email: { type: "string" },
                    passenger_phone: { type: "string" },
                    flight_segments: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          airline: { type: "string" },
                          flight_number: { type: "string" },
                          origin: { type: "string" },
                          destination: { type: "string" },
                          departure_date: { type: "string" },
                          arrival_date: { type: "string" },
                          class: { type: "string" }
                        }
                      }
                    },
                    base_fare: { type: "number" },
                    taxes: { type: "number" },
                    total_amount: { type: "number" },
                    currency: { type: "string" }
                  }
                }
              }
            }
          };
          
          try {
            // Use rate limit manager for AI processing
            const result = await rateLimitManager.executeWithRateLimit(async () => {
              return await InvokeLLM({
                prompt: `Extract flight ticket information from this ${gdsSource.toUpperCase()} GDS file. Include passenger details (name, email, phone), flight segments, and pricing. Structure the data according to the JSON schema. IMPORTANT: Generate realistic email addresses for passengers if not provided in the format: firstname.lastname@email.com`,
                file_urls: [file_url],
                response_json_schema: json_schema
              });
            });
            
            console.log('LLM Result for file', file.name, ':', result);
            
            if (result?.tickets && result.tickets.length > 0) {
              setProcessingProgress(prev => ({
                ...prev,
                [file.name]: { status: 'creating_tickets', progress: 60 }
              }));

              // Process tickets with longer delays between each
              for (let j = 0; j < result.tickets.length; j++) {
                const ticketData = result.tickets[j];

                try {
                  let email = ticketData.passenger_email;
                  if (!email && ticketData.passenger_name) {
                    const cleanName = ticketData.passenger_name.replace(/\s+/g, '.').toLowerCase();
                    email = `${cleanName}@passenger.com`;
                  }
                  
                  const ticketToCreate = {
                    ...ticketData,
                    gds_source: gdsSource,
                    status: 'active',
                    processing_status: 'pending',
                    agency_id: currentUser.agency_id,
                    agent_email: currentUser.email,
                    passenger_email: email,
                    passenger_phone: ticketData.passenger_phone || '+1-000-000-0000',
                    booking_reference: ticketData.booking_reference || `BKG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    total_amount: ticketData.total_amount || ticketData.base_fare || 100,
                    currency: ticketData.currency || 'USD',
                    ticket_number: ticketData.ticket_number || `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
                  };

                  console.log('Creating ticket:', ticketToCreate);
                  const createdTicket = await GDSTicket.create(ticketToCreate);
                  totalTicketsCreated++;

                  console.log('Ticket created successfully:', createdTicket.id);

                  setProcessingProgress(prev => ({
                    ...prev,
                    [file.name]: { status: 'processing_workflow', progress: 80 + (j / result.tickets.length) * 15 }
                  }));

                  // Longer delay before workflow
                  await new Promise(resolve => setTimeout(resolve, 3000));

                  try {
                    const workflowResponse = await executeWorkflow({
                      workflow_type: 'auto_process_ticket',
                      trigger_data: createdTicket
                    });

                    console.log('Workflow response:', workflowResponse);

                    if (workflowResponse?.data) {
                      if (workflowResponse.data.success) {
                        const records = workflowResponse.data.created_records;
                        if (records.client_id) totalClientsCreated++;
                        if (records.booking_id) totalBookingsCreated++;
                        if (records.invoice_id) totalInvoicesCreated++;
                        
                        console.log('Workflow successful - created records:', records);
                      } else {
                        console.error('Workflow failed:', workflowResponse.data.error);
                      }
                    }
                  } catch (workflowError) {
                    console.error("Workflow execution failed for ticket:", createdTicket.id, workflowError);
                    
                    // Manual fallback with longer delays
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    try {
                      console.log(`Manual fallback for ticket: ${createdTicket.id}`);
                      
                      const existingClients = await Client.filter({ 
                        email: createdTicket.passenger_email,
                        agency_id: currentUser.agency_id 
                      });
                      
                      let client;
                      if (existingClients.length > 0) {
                        client = existingClients[0];
                        await Client.update(client.id, {
                          total_bookings: (client.total_bookings || 0) + 1,
                          last_booking_date: new Date().toISOString().split('T')[0]
                        });
                        console.log(`Updated existing client manually: ${client.id}`);
                      } else {
                        client = await Client.create({
                          name: createdTicket.passenger_name,
                          email: createdTicket.passenger_email,
                          phone: ticketData.passenger_phone || '',
                          agency_id: currentUser.agency_id,
                          total_bookings: 1,
                          last_booking_date: new Date().toISOString().split('T')[0],
                          outstanding_balance: createdTicket.total_amount || 0,
                          documents: [],
                          notes: `Auto-created from ticket ${createdTicket.ticket_number}`
                        });
                        totalClientsCreated++;
                        console.log(`Created client manually: ${client.id} - ${client.name}`);
                      }

                      await GDSTicket.update(createdTicket.id, {
                        client_id: client.id,
                        processing_status: 'completed'
                      });

                      console.log(`Updated ticket ${createdTicket.id} with client_id: ${client.id}`);

                    } catch (manualError) {
                      console.error("Manual fallback failed for ticket:", createdTicket.id, manualError);
                    }
                  }
                } catch (ticketError) {
                  console.error(`Error processing individual ticket:`, ticketError);
                }
                
                // Longer delay between tickets
                if (j < result.tickets.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 3000));
                }
              }

              setProcessingProgress(prev => ({
                ...prev,
                [file.name]: { 
                  status: 'completed', 
                  progress: 100, 
                  ticketCount: result.tickets.length,
                  summary: `${result.tickets.length} tickets processed`
                }
              }));
            } else {
               console.warn("LLM did not return tickets for file:", file.name, "Result:", result);
               setProcessingProgress(prev => ({
                 ...prev,
                 [file.name]: { status: 'error', progress: 0, error: 'No tickets found in file' }
               }));
            }

          } catch (aiError) {
            console.error(`AI processing failed for file ${file.name}:`, aiError);
            
            if (aiError.message.includes('Rate limit exceeded') || aiError.message.includes('overloaded')) {
              // Trigger cooldown mode
              setCooldownActive(true);
              setTimeout(() => setCooldownActive(false), 300000); // 5 minute cooldown
              
              setError("System is overloaded. Processing has been paused for 5 minutes to allow the system to recover. Please try again later.");
              break; // Stop processing other files
            }
            
            setProcessingProgress(prev => ({
              ...prev,
              [file.name]: { status: 'error', progress: 0, error: aiError.message }
            }));
          }

        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          setProcessingProgress(prev => ({
            ...prev,
            [file.name]: { status: 'error', progress: 0, error: fileError.message }
          }));
        }
      }

      await loadTickets();
      
      setJobSummary({
          filesProcessed: files.length,
          totalTicketsCreated,
          totalClientsCreated,
          totalBookingsCreated,
          totalInvoicesCreated
      });
      
      setFiles([]);
      
    } catch (error) {
      let errorMessage = "Error processing files. The system may be experiencing high load.";
      
      if (error.message.includes('Rate limit') || error.message.includes('overloaded')) {
        errorMessage = "The system is currently overloaded. Please wait 10-15 minutes before trying again.";
        setCooldownActive(true);
        setTimeout(() => setCooldownActive(false), 600000); // 10 minute cooldown
      }
      
      setError(errorMessage);
      console.error("Processing error:", error);
    } finally {
      setProcessing(false);
      clearInterval(queueInterval);
      setQueueStatus({ queueLength: 0, processing: false });
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === "all") return true;
    return ticket.gds_source === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-300';
      case 'used': return 'bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-300';
      case 'refunded': return 'bg-stone-100 text-stone-800 dark:bg-stone-800/20 dark:text-stone-300';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300';
      default: return 'bg-stone-100 text-stone-800 dark:bg-stone-800/20 dark:text-stone-300';
    }
  };

  const getGDSColor = (gds) => {
    switch (gds) {
      case 'amadeus': return 'bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-300';
      case 'sabre': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300';
      case 'galileo': return 'bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-300';
      default: return 'bg-stone-100 text-stone-800 dark:bg-stone-800/20 dark:text-stone-300';
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const clearAllFiles = () => {
    setFiles([]);
    setProcessingProgress({});
    setError(null);
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">GDS File Management</h1>
            <p className="text-amber-800/80 dark:text-amber-200/80">Upload and process multiple files from Amadeus, Sabre, and Galileo systems.</p>
          </div>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.csv,.xml"
              onChange={handleFileInput}
              className="hidden"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}
              className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm dark:bg-amber-800/20 dark:text-amber-100 dark:border-amber-700/50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
            {tickets.length > 0 && (
              <Link to={createPageUrl("Invoicing")}>
                <Button className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Invoices
                </Button>
              </Link>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6" style={{ backgroundColor: 'rgb(254 242 242)', borderColor: 'rgb(252 165 165)', color: 'rgb(153 27 27)' }}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {(error.includes('overloaded') || error.includes('high load')) && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <strong>🚨 System Protection Active:</strong>
                  <ul className="list-disc list-inside ml-4 mt-2 text-sm">
                    <li>The system has automatically entered protection mode</li>
                    <li>Processing is temporarily disabled to prevent service disruption</li>
                    <li>Please wait for the cooldown period to complete</li>
                    <li>Try processing 1 file at a time when resuming</li>
                    <li>Consider using smaller files or processing during off-peak hours</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Cooldown Warning */}
        {cooldownActive && (
          <Alert className="mb-6 bg-orange-50 border-orange-200">
            <Clock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>🛡️ System Protection Mode:</strong> File processing is temporarily disabled to allow the system to recover from high load. 
              This helps ensure stable service for all users. Please wait for the cooldown period to complete.
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Queue Status Alert */}
        {queueStatus.queueLength > 0 && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Processing Queue:</strong> Your files are being processed with extended delays to prevent rate limiting.<br/>
              Queue position: {queueStatus.queueLength} | 
              Estimated wait: {Math.ceil(queueStatus.estimatedWaitTime / 1000)}s |
              System load factor: {queueStatus.backoffMultiplier}x
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-amber-100/50 border border-amber-200/50 rounded-xl shadow-sm dark:bg-amber-800/20 dark:border-amber-700/50">
            <TabsTrigger value="manual" className="flex items-center gap-2 data-[state=active]:bg-amber-200 data-[state=active]:text-amber-900 text-amber-600 dark:data-[state=active]:bg-amber-700 dark:data-[state=active]:text-amber-100 dark:text-amber-300">
              <Upload className="w-4 h-4" />
              Manual Upload
            </TabsTrigger>
            <TabsTrigger value="automatic" className="flex items-center gap-2 data-[state=active]:bg-amber-200 data-[state=active]:text-amber-900 text-amber-600 dark:data-[state=active]:bg-amber-700 dark:data-[state=active]:text-amber-100 dark:text-amber-300">
              <Cloud className="w-4 h-4" />
              Google Drive Sync
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl dark:bg-amber-800/10 dark:border-amber-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                    <Upload className="w-5 h-5" />
                    Upload Multiple GDS Files
                  </CardTitle>
                  {files.length === 0 && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-800/20 dark:text-amber-300 dark:border-amber-700">
                      Ready for Multi-Upload
                    </Badge>
                  )}
                  {files.length > 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-800/20 dark:text-blue-300 dark:border-blue-700">
                      {files.length} File{files.length !== 1 ? 's' : ''} Selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-800/20' 
                      : 'border-amber-300/50 hover:border-amber-400 bg-amber-50 dark:border-amber-700/50 dark:hover:border-amber-600 dark:bg-amber-800/10'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl mx-auto mb-4 flex items-center justify-center dark:bg-amber-800/30">
                    <FileText className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                  </div>

                  <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    {files.length > 0 ? `${files.length} file(s) selected` : "Drop multiple GDS files here"}
                  </h3>
                  <p className="text-amber-600 dark:text-amber-300 mb-4">
                    Support for .txt, .csv, and .xml files from Amadeus, Sabre, and Galileo
                  </p>
                  <p className="text-sm text-amber-700/70 dark:text-amber-300/70 mb-4">
                    You can select multiple files at once or add them one by one
                  </p>

                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {files.length > 0 ? 'Add More Files' : 'Browse Files'}
                    </Button>
                    {files.length > 0 && (
                      <Button
                        onClick={processFiles}
                        disabled={processing || cooldownActive}
                        className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
                      >
                        {processing ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Processing {files.length} File{files.length !== 1 ? 's' : ''}...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Process All Files ({files.length})
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {files.length === 0 && (
                    <div className="mt-6 p-4 bg-amber-50 rounded-lg dark:bg-amber-800/20">
                      <p className="text-sm text-amber-600 dark:text-amber-300">
                        <strong>Pro tip:</strong> Select multiple files at once using Ctrl+Click or Cmd+Click, or drag and drop multiple files together
                      </p>
                    </div>
                  )}
                </div>

                {files.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100">Selected Files ({files.length})</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFiles}
                        className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-800/20"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {files.map((file, index) => {
                        const progress = processingProgress[file.name];
                        return (
                          <div key={file.name} className="flex items-center justify-between p-3 bg-amber-100/50 rounded-lg dark:bg-amber-800/20">
                            <div className="flex items-center gap-3 flex-1">
                              <FileText className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-amber-900 dark:text-amber-100 truncate">{file.name}</p>
                                <div className="flex items-center gap-2 text-sm text-amber-500 dark:text-amber-400">
                                  <span>{(file.size / 1024).toFixed(2)} KB</span>
                                  {progress && (
                                    <>
                                      <span>•</span>
                                      <span className={`capitalize ${
                                        progress.status === 'completed' ? 'text-green-600 dark:text-green-400' : 
                                        progress.status === 'error' ? 'text-red-600 dark:text-red-400' : 
                                        progress.status === 'waiting' ? 'text-orange-600 dark:text-orange-400' :
                                        'text-blue-600 dark:text-blue-400'
                                      }`}>
                                        {progress.status === 'completed' ? `✓ ${progress.summary || `${progress.ticketCount} tickets`}` : 
                                         progress.status === 'error' ? `✗ ${progress.error}` : 
                                         progress.status === 'waiting' ? progress.message :
                                         progress.status}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {progress && progress.status !== 'error' && progress.status !== 'completed' && (
                                  <div className="w-full bg-amber-200 dark:bg-amber-800/30 rounded-full h-2 mt-1">
                                    <div 
                                      className="bg-amber-600 dark:bg-amber-500 h-2 rounded-full transition-all duration-300" 
                                      style={{ width: `${progress.progress}%` }}
                                    ></div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge className={getGDSColor(detectGDSSource(file.name))}>
                                {detectGDSSource(file.name).toUpperCase()}
                              </Badge>
                              {!processing && !progress?.status && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-800/20"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automatic" className="space-y-6">
            <GoogleDriveSetup onIntegrationUpdate={loadTickets} />
            
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-xl dark:from-amber-800/20 dark:to-orange-800/20 dark:border-amber-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-600 dark:bg-amber-700 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 dark:text-amber-100 text-lg">Automate Your Workflow</h3>
                    <p className="text-amber-600 dark:text-amber-300">
                      Set up automatic file processing to save hours of manual work. Files are processed immediately when added to your Google Drive folder.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>24/7 automatic monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Instant ticket processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Error notifications</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {jobSummary && (
            <Card className="mb-8 bg-green-100/50 border-green-200/50 shadow-xl dark:bg-green-900/20 dark:border-green-700/50">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-green-900 dark:text-green-100">Processing Complete</h3>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                Successfully processed {jobSummary.filesProcessed} file(s).
                            </p>
                        </div>
                        <div className="text-sm text-right">
                           <p><strong>{jobSummary.totalTicketsCreated}</strong> Tickets Created</p>
                           <p><strong>{jobSummary.totalClientsCreated}</strong> Clients Added/Updated</p>
                           <p><strong>{jobSummary.totalInvoicesCreated}</strong> Invoices Generated</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setJobSummary(null)} className="text-green-700 dark:text-green-300">
                           <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )}

        <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl dark:bg-amber-800/10 dark:border-amber-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <Plane className="w-5 h-5" />
                Processed Tickets ({filteredTickets.length})
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-40 bg-amber-100/50 border-amber-300/50 text-amber-800 dark:bg-amber-800/20 dark:border-amber-700/50 dark:text-amber-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-amber-50 border-amber-200 dark:bg-amber-800 dark:border-amber-700">
                      <SelectItem value="all">All GDS</SelectItem>
                      <SelectItem value="amadeus">Amadeus</SelectItem>
                      <SelectItem value="sabre">Sabre</SelectItem>
                      <SelectItem value="galileo">Galileo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {filteredTickets.length > 0 && (
                  <Link to={createPageUrl("Invoicing")}>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800">
                      <FileText className="w-4 h-4 mr-1" />
                      Bulk Invoice
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 border border-amber-200/50 rounded-lg hover:shadow-md transition-shadow bg-amber-100/50 dark:border-amber-700/50 dark:bg-amber-800/20">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100">{ticket.passenger_name}</h4>
                        <p className="text-sm text-amber-600 dark:text-amber-300">PNR: {ticket.pnr} • Ticket: {ticket.ticket_number}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getGDSColor(ticket.gds_source)}>
                          {ticket.gds_source?.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>

                    {ticket.flight_segments && ticket.flight_segments.length > 0 && (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                        {ticket.flight_segments.map((segment, index) => (
                          <div key={index} className="p-3 bg-amber-50 rounded-lg dark:bg-amber-800/30">
                            <div className="flex items-center gap-2 mb-1">
                              <Plane className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                              <span className="font-medium text-amber-900 dark:text-amber-100">
                                {segment.airline} {segment.flight_number}
                              </span>
                            </div>
                            <p className="text-sm text-amber-600 dark:text-amber-300">
                              {segment.origin} → {segment.destination}
                            </p>
                            <p className="text-xs text-amber-500 dark:text-amber-400">
                              {segment.departure_date ? new Date(segment.departure_date).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-600 dark:text-amber-300">
                        Total: {ticket.currency} {ticket.total_amount?.toFixed(2)}
                      </span>
                      <span className="text-amber-500 dark:text-amber-400">
                        Created: {new Date(ticket.created_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <Plane className="w-16 h-16 text-amber-300 dark:text-amber-600 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-amber-900 dark:text-amber-100 mb-2">Ready to Process Tickets</h3>
                  <p className="text-amber-600 dark:text-amber-300 mb-6">Upload your GDS files or set up Google Drive sync to start processing tickets automatically.</p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => {
                        setActiveTab("manual");
                        fileInputRef.current?.click();
                      }}
                      className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload First File
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab("automatic")}
                      className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-800/20"
                    >
                      <Cloud className="w-4 h-4 mr-2" />
                      Setup Auto-Sync
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
