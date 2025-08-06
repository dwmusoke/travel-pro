
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BSPReport, BSPReconciliation, GDSTicket } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, RefreshCw, GitCompare, CheckCircle, AlertTriangle, Clock, XCircle, BarChart } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { reconcileBSP } from '@/api/functions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function BSPReconciliationPage() {
  const [reports, setReports] = useState([]);
  const [reconciliationData, setReconciliationData] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [filter, setFilter] = useState('all'); // State for filtering reconciliation results

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const reportList = await BSPReport.list('-created_date', 20);
    setReports(reportList);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndProcess = async () => {
    if (!file) return;

    setProcessing(true);
    setReconciliationData([]); // Clear previous reconciliation data
    setSelectedReport(null); // Clear selected report when starting new process

    try {
      // Create initial report with 'uploading' status
      const newReport = await BSPReport.create({
        report_period_start: new Date().toISOString(), // Placeholder
        report_period_end: new Date().toISOString(), // Placeholder
        file_name: file.name,
        status: 'uploading' // Initial status
      });
      await loadReports(); // Reload to show the new 'uploading' report
      setSelectedReport(newReport); // Select this new report

      const { file_url } = await UploadFile({ file, report_id: newReport.id });
      await BSPReport.update(newReport.id, { file_url: file_url, status: 'processing' }); // Update report with file_url and 'processing' status
      await loadReports(); // Reload to show 'processing' status

      // Call the backend reconciliation function
      const { data: reconResults } = await reconcileBSP({ report_id: newReport.id, file_url });
      setReconciliationData(reconResults);

      await BSPReport.update(newReport.id, { status: 'processed' }); // Update to 'processed' on success

    } catch (error) {
      console.error("Error processing BSP report:", error);
      // Optionally update report status to failed here
      if (selectedReport && selectedReport.id) {
          await BSPReport.update(selectedReport.id, { status: 'failed' });
      }
    } finally {
      setProcessing(false);
      setFile(null); // Clear the file input
      await loadReports(); // Reload reports to show updated status (processed/failed)
    }
  };

  const reconciliationSummary = useMemo(() => {
    const matched = reconciliationData.filter(r => r.status === 'matched').length;
    const discrepancies = reconciliationData.filter(r => r.status === 'discrepancy').length;
    const systemOnly = reconciliationData.filter(r => r.status === 'system_only').length;
    const bspOnly = reconciliationData.filter(r => r.status === 'bsp_only').length;
    const unmatched = systemOnly + bspOnly; // Total unmatched items

    return {
        matched,
        discrepancies,
        system_only: systemOnly,
        bsp_only: bspOnly,
        unmatched,
    };
  }, [reconciliationData]);

  const filteredReconciliationData = useMemo(() => {
    if (filter === 'all') {
        return reconciliationData;
    }
    return reconciliationData.filter(item => item.status === filter);
  }, [reconciliationData, filter]);


  return (
    <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">BSP Reconciliation</h1>
            <p className="text-amber-800/80">Upload BSP reports and automatically reconcile with your GDS tickets.</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg"
              disabled={processing}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload BSP Report
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700/80">Matched Tickets</p>
                  <p className="text-2xl font-bold text-green-700">{reconciliationSummary.matched}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700/80">Discrepancies</p>
                  <p className="text-2xl font-bold text-orange-700">{reconciliationSummary.discrepancies}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700/80">Unmatched</p>
                  <p className="text-2xl font-bold text-red-700">{reconciliationSummary.unmatched}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Area */}
        <Card className="mb-8 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <FileText className="w-5 h-5" />
              BSP Report Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive ? 'border-amber-400 bg-amber-100/50' : 'border-amber-300/50 hover:border-amber-400 bg-amber-50/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-amber-800">
                  <FileText className="w-5 h-5" />
                  <span>{file.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-red-500 hover:text-red-700">
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-amber-700/80">Drag & drop your BSP report here, or <span className="text-amber-800 font-medium cursor-pointer" onClick={() => fileInputRef.current?.click()}>browse</span></p>
              )}
              {processing && (
                <Progress value={50} className="w-full mt-4 bg-amber-200/50" indicatorClassName="bg-amber-600" />
              )}
            </div>
            <Button
              onClick={handleUploadAndProcess}
              disabled={processing || !file}
              className="mt-4 w-full bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg"
            >
              {processing ? 'Processing...' : 'Start Reconciliation'}
            </Button>
          </CardContent>
        </Card>

        {/* Reconciliation Results */}
        <Card className="mt-8 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <BarChart className="w-5 h-5" />
                    Reconciliation Results
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="w-40 bg-amber-100/50 border-amber-300/50 text-amber-800">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-amber-50 border-amber-200">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="matched">Matched</SelectItem>
                        <SelectItem value="discrepancy">Discrepancies</SelectItem>
                        <SelectItem value="system_only">System Only</SelectItem>
                        <SelectItem value="bsp_only">BSP Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="space-y-2 text-amber-900">
                    <div className="grid grid-cols-5 font-bold p-2">
                        <span>Ticket #</span>
                        <span>Status</span>
                        <span>System Fare</span>
                        <span>BSP Fare</span>
                        <span>Discrepancy</span>
                    </div>
                    {filteredReconciliationData.length === 0 && !processing && (
                        <p className="text-center text-amber-700/70 py-4">No reconciliation data to display. Upload a report to start!</p>
                    )}
                    {filteredReconciliationData.map(item => (
                        <div key={item.id || item.ticket_number} className="grid grid-cols-5 p-2 border-t border-amber-200/50">
                            <span>{item.ticket_number}</span>
                            <span>
                                <Badge className={`
                                    ${item.status === 'matched' && 'bg-green-100 text-green-700 border-green-200'}
                                    ${item.status === 'discrepancy' && 'bg-orange-100 text-orange-700 border-orange-200'}
                                    ${item.status === 'bsp_only' && 'bg-blue-100 text-blue-700 border-blue-200'}
                                    ${item.status === 'system_only' && 'bg-red-100 text-red-700 border-red-200'}
                                    bg-amber-100/50 text-amber-800 border-amber-300/50
                                `}>
                                    {item.status.replace(/_/g, ' ')}
                                </Badge>
                            </span>
                            <span>{item.system_fare?.toFixed(2)}</span>
                            <span>{item.bsp_fare?.toFixed(2)}</span>
                            <span className={item.fare_discrepancy !== 0 ? 'text-red-600 font-bold' : ''}>{item.fare_discrepancy?.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
