import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download, Database, CheckCircle, Clock, AlertTriangle, XCircle, Search } from "lucide-react";

// Mock data structure
const mockLogs = [
    { id: 1, level: 'SUCCESS', type: 'agency_activation', message: 'Agency "Travel Options" was activated', timestamp: '2025-08-02T09:06:42Z', user: 'Super Admin', details: { agencyId: 'abc-123', agencyName: 'Travel Options'} },
    { id: 2, level: 'INFO', type: 'agency_creation', message: 'New agency "Premier World Travels" registered', timestamp: '2025-08-02T08:19:49Z', user: 'dwmusoke@gmail.com', details: { agencyId: 'def-456'} },
    { id: 3, level: 'ERROR', type: 'payment_failure', message: 'Payment failed for agency "Test Travel"', timestamp: '2025-08-01T14:30:11Z', user: 'System', details: { agencyId: 'ghi-789', amount: 99, reason: 'Insufficient funds'} }
];

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    setLoading(true);
    // Simulating API call
    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 500);
  };

  const filteredLogs = logs.filter(log => {
    const searchMatch = searchTerm === "" || log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const levelMatch = levelFilter === "all" || log.level.toLowerCase() === levelFilter;
    const typeMatch = typeFilter === "all" || log.type === typeFilter;
    return searchMatch && levelMatch && typeMatch;
  });

  const levelInfo = {
    'SUCCESS': { icon: CheckCircle, color: 'text-emerald-700 bg-emerald-100/50 border-emerald-300' },
    'INFO': { icon: Clock, color: 'text-blue-700 bg-blue-100/50 border-blue-300' },
    'WARNING': { icon: AlertTriangle, color: 'text-orange-700 bg-orange-100/50 border-orange-300' },
    'ERROR': { icon: XCircle, color: 'text-red-700 bg-red-100/50 border-red-300' },
  };

  return (
    <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">System Logs</h1>
            <p className="text-amber-800/80">Monitor platform activities and system events</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadLogs} className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        <Card className="mb-8 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-amber-600" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-amber-100/50 border-amber-300/50 text-amber-900 placeholder:text-amber-700/70"
                />
              </div>
              <div className="flex items-center gap-4">
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-40 bg-amber-100/50 border-amber-300/50 text-amber-800"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-amber-50 border-amber-200"><SelectItem value="all">All Levels</SelectItem><SelectItem value="success">Success</SelectItem><SelectItem value="info">Info</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="error">Error</SelectItem></SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48 bg-amber-100/50 border-amber-300/50 text-amber-800"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-amber-50 border-amber-200"><SelectItem value="all">All Types</SelectItem><SelectItem value="agency_creation">Agency Creation</SelectItem><SelectItem value="agency_activation">Agency Activation</SelectItem><SelectItem value="payment_failure">Payment Failure</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-amber-900">
              <span className="flex items-center gap-2"><Database className="w-5 h-5" />Recent Activity</span>
              <Badge variant="outline" className="bg-amber-100/50 text-amber-800 border-amber-300/50">{filteredLogs.length} entries</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => {
                const Icon = levelInfo[log.level]?.icon || Clock;
                const color = levelInfo[log.level]?.color || 'bg-stone-100/50 text-stone-800 border-stone-300';
                return (
                  <div key={log.id} className={`p-4 rounded-lg border ${color}`}>
                    <div className="flex items-start gap-4">
                      <Icon className="w-5 h-5 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{log.message}</p>
                          <p className="text-xs">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="text-sm mt-1">
                          <span className="mr-4">User: {log.user}</span>
                          <Badge variant="outline" className={`${color} capitalize`}>{log.type.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}