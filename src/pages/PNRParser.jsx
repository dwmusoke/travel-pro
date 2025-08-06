import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import PNRParser from "../components/gds/PNRParser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Target,
  Layers
} from "lucide-react";

export default function PNRParserPage() {
  const [user, setUser] = useState(null);
  const [parsedCount, setParsedCount] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleParsedData = (data) => {
    setParsedCount(prev => prev + 1);
    console.log("Parsed PNR data:", data);
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">PNR Parser</h1>
            <p className="text-amber-800/80 dark:text-amber-200/80">
              Extract structured data from passenger name records (PNRs)
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="bg-amber-100/50 text-amber-800 border-amber-300/50">
              {parsedCount} Parsed Today
            </Badge>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-amber-900">Multi-GDS Support</h3>
              </div>
              <p className="text-sm text-amber-700">
                Parse PNRs from Amadeus, Sabre, and Galileo with intelligent format detection.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-amber-900">Smart Extraction</h3>
              </div>
              <p className="text-sm text-amber-700">
                Automatically extract flight segments, passenger details, payment info, and remarks.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-amber-900">Auto-Save</h3>
              </div>
              <p className="text-sm text-amber-700">
                Optionally save parsed data directly to your ticket management system.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <BookOpen className="w-5 h-5" />
              How to Use the PNR Parser
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-900 mb-3">Supported Elements:</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>Header:</strong> PNR, Office ID, Agent ID, Ticket No.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>Flight Segments:</strong> Origin, destination, dates, class, airline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>Passenger Info:</strong> Names, contact details, agency info</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>Payment:</strong> Form of payment, fare details</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>Remarks:</strong> Cost center, FID, special requirements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>Ticketing:</strong> TKOK dates, ticket status</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-900 mb-3">Usage Tips:</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <span>Copy the entire PNR text including all segments and remarks</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <span>Select the correct GDS source for optimal parsing accuracy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <span>Enable "Save to database" to automatically create ticket records</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <span>Use the export function to save parsed data as JSON</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Parser Component */}
        <PNRParser onParsedData={handleParsedData} />

        {/* Sample PNR Format */}
        <Card className="bg-slate-50/50 backdrop-blur-sm border border-slate-200/50 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <FileText className="w-5 h-5" />
              Sample PNR Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`RP/LON1A2345/LON1A2345            WS/SU   1NOV24/1426Z   VWXYZ1
1.SMITH/JOHN MR
2  EK 234 Y 15NOV 3 LONORD HK1   0800 1445+1
3  EK 205 Y 28NOV 1 ORDLON HK1   2200 1635+1
4 FM*M*1A
5 FP CASH
6 RM COST CENTER 12345
7 RM FID EK1234567890
8 TKOK15NOV/LON1A2345
9 TKT/TIME LIMIT
   1.T-15NOV-LON1A2345*VWXYZ1
   TKT/TL 15NOV/24JAN`}</pre>
            </div>
            <p className="text-sm text-slate-600 mt-3">
              This sample shows a typical PNR structure with flight segments, passenger information, 
              payment details, remarks, and ticketing information that the parser can extract.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}