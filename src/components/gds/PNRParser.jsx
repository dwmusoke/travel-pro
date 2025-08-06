import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Plane, 
  User, 
  CreditCard, 
  MessageSquare, 
  Calendar,
  MapPin,
  Clock,
  Phone,
  Mail,
  Building,
  CheckCircle,
  AlertCircle,
  Copy,
  Download
} from 'lucide-react';
import { parsePNR } from '@/api/functions';

export default function PNRParser({ onParsedData }) {
  const [pnrText, setPnrText] = useState('');
  const [gdsSource, setGdsSource] = useState('amadeus');
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [saveToDatabase, setSaveToDatabase] = useState(false);

  const handleParse = async () => {
    if (!pnrText.trim()) {
      setError('Please enter PNR text to parse');
      return;
    }

    setParsing(true);
    setError(null);
    
    try {
      const response = await parsePNR({
        pnr_text: pnrText,
        gds_source: gdsSource,
        save_to_database: saveToDatabase
      });

      if (response.data.success) {
        setParsedData(response.data.parsed_data);
        if (onParsedData) {
          onParsedData(response.data.parsed_data);
        }
      } else {
        setError(response.data.error || 'Failed to parse PNR');
      }
    } catch (err) {
      console.error('PNR parsing error:', err);
      setError('Failed to parse PNR. Please check the format and try again.');
    } finally {
      setParsing(false);
    }
  };

  const handleClear = () => {
    setPnrText('');
    setParsedData(null);
    setError(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const exportParsedData = () => {
    if (!parsedData) return;
    
    const dataStr = JSON.stringify(parsedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parsed_pnr_${parsedData.header.pnr || 'data'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PNR Parser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">PNR Text</label>
              <Textarea
                placeholder="Paste your PNR text here..."
                value={pnrText}
                onChange={(e) => setPnrText(e.target.value)}
                className="h-32 font-mono text-sm"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">GDS Source</label>
                <Select value={gdsSource} onValueChange={setGdsSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amadeus">Amadeus</SelectItem>
                    <SelectItem value="sabre">Sabre</SelectItem>
                    <SelectItem value="galileo">Galileo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="saveToDb"
                  checked={saveToDatabase}
                  onChange={(e) => setSaveToDatabase(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="saveToDb" className="text-sm">Save to database</label>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleParse} 
                  disabled={parsing || !pnrText.trim()}
                  className="flex-1"
                >
                  {parsing ? 'Parsing...' : 'Parse PNR'}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {parsedData && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Parsed PNR Data
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={exportParsedData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(JSON.stringify(parsedData, null, 2))}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Data
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="header">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="header">Header</TabsTrigger>
                <TabsTrigger value="flights">Flights</TabsTrigger>
                <TabsTrigger value="passenger">Passenger</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
                <TabsTrigger value="remarks">Remarks</TabsTrigger>
                <TabsTrigger value="ticketing">Ticketing</TabsTrigger>
              </TabsList>

              {/* Header Tab */}
              <TabsContent value="header" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      PNR Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      {parsedData.header.pnr && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">PNR:</span>
                          <Badge variant="outline">{parsedData.header.pnr}</Badge>
                        </div>
                      )}
                      {parsedData.header.office_id && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Office ID:</span>
                          <span className="font-mono">{parsedData.header.office_id}</span>
                        </div>
                      )}
                      {parsedData.header.agent_id && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Agent ID:</span>
                          <span className="font-mono">{parsedData.header.agent_id}</span>
                        </div>
                      )}
                      {parsedData.header.ticket_number && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Ticket No:</span>
                          <span className="font-mono">{parsedData.header.ticket_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Creation Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      {parsedData.header.creation_date && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Created:</span>
                          <span>{parsedData.header.creation_date}</span>
                        </div>
                      )}
                      {parsedData.header.creation_time && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Time:</span>
                          <span>{parsedData.header.creation_time}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Flight Segments Tab */}
              <TabsContent value="flights" className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Flight Segments ({parsedData.flight_segments?.length || 0})
                </h4>
                <div className="space-y-3">
                  {parsedData.flight_segments?.length > 0 ? (
                    parsedData.flight_segments.map((segment, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-slate-50">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Plane className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold">{segment.airline} {segment.flight_number}</span>
                              {segment.class && (
                                <Badge className="bg-blue-100 text-blue-800">Class {segment.class}</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-slate-500" />
                              <span>{segment.origin} → {segment.destination}</span>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            {segment.departure_date && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Date:</span>
                                <span>{segment.departure_date}</span>
                              </div>
                            )}
                            {segment.departure_time && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Departure:</span>
                                <span>{segment.departure_time}</span>
                              </div>
                            )}
                            {segment.arrival_time && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Arrival:</span>
                                <span>{segment.arrival_time}</span>
                              </div>
                            )}
                            {segment.status && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Status:</span>
                                <Badge variant="outline">{segment.status}</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8">No flight segments found</p>
                  )}
                </div>
              </TabsContent>

              {/* Passenger Tab */}
              <TabsContent value="passenger" className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Passenger Information
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-medium">Passengers</h5>
                    {parsedData.passenger_info?.passengers?.length > 0 ? (
                      parsedData.passenger_info.passengers.map((passenger, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded border">
                          <div className="font-medium">{passenger.full_name}</div>
                          <div className="text-sm text-slate-600">
                            {passenger.last_name}, {passenger.first_name}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500">No passenger information found</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="font-medium">Contact Details</h5>
                    <div className="space-y-2 text-sm">
                      {parsedData.passenger_info?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <span>{parsedData.passenger_info.email}</span>
                        </div>
                      )}
                      {parsedData.passenger_info?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <span>{parsedData.passenger_info.phone}</span>
                        </div>
                      )}
                      {parsedData.passenger_info?.agency_name && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-500" />
                          <span>{parsedData.passenger_info.agency_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Payment Tab */}
              <TabsContent value="payment" className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Information
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-medium">Form of Payment</h5>
                    <div className="space-y-2 text-sm">
                      {parsedData.payment_info?.form_of_payment && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Method:</span>
                          <Badge variant="outline">{parsedData.payment_info.form_of_payment}</Badge>
                        </div>
                      )}
                      {parsedData.payment_info?.card_type && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Card Type:</span>
                          <span>{parsedData.payment_info.card_type}</span>
                        </div>
                      )}
                      {parsedData.payment_info?.card_number_masked && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Card Number:</span>
                          <span className="font-mono">{parsedData.payment_info.card_number_masked}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="font-medium">Fare Details</h5>
                    <div className="space-y-2 text-sm">
                      {parsedData.payment_info?.total_fare && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Amount:</span>
                          <span className="font-semibold text-lg">
                            {parsedData.payment_info.currency} {parsedData.payment_info.total_fare}
                          </span>
                        </div>
                      )}
                      {parsedData.payment_info?.currency && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Currency:</span>
                          <Badge className="bg-green-100 text-green-800">{parsedData.payment_info.currency}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Remarks Tab */}
              <TabsContent value="remarks" className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Remarks ({parsedData.remarks?.length || 0})
                </h4>
                <div className="space-y-3">
                  {parsedData.remarks?.length > 0 ? (
                    parsedData.remarks.map((remark, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="capitalize">{remark.type.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-sm font-mono text-slate-700">{remark.content}</p>
                            
                            {remark.cost_center && (
                              <div className="mt-2 text-xs">
                                <span className="text-slate-600">Cost Center: </span>
                                <span className="font-medium">{remark.cost_center}</span>
                              </div>
                            )}
                            {remark.frequent_flyer_number && (
                              <div className="mt-2 text-xs">
                                <span className="text-slate-600">FF Number: </span>
                                <span className="font-medium">{remark.frequent_flyer_number}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8">No remarks found</p>
                  )}
                </div>
              </TabsContent>

              {/* Ticketing Tab */}
              <TabsContent value="ticketing" className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Ticketing Information
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-medium">Ticketing Details</h5>
                    <div className="space-y-2 text-sm">
                      {parsedData.ticketing_info?.ticketed_date && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Ticketed Date:</span>
                          <span>{parsedData.ticketing_info.ticketed_date}</span>
                        </div>
                      )}
                      {parsedData.ticketing_info?.ticketing_office && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Office:</span>
                          <span className="font-mono">{parsedData.ticketing_info.ticketing_office}</span>
                        </div>
                      )}
                      {parsedData.ticketing_info?.ticket_status && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          <Badge variant="outline" className="capitalize">{parsedData.ticketing_info.ticket_status}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="font-medium">Ticket Numbers</h5>
                    {parsedData.ticketing_info?.ticket_numbers?.length > 0 ? (
                      <div className="space-y-2">
                        {parsedData.ticketing_info.ticket_numbers.map((ticketNum, index) => (
                          <div key={index} className="p-2 bg-slate-50 rounded border">
                            <span className="font-mono text-sm">{ticketNum}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">No ticket numbers found</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}