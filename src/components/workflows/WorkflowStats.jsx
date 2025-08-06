import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function WorkflowStats({ workflows }) {
  const stats = {
    total: workflows.length,
    active: workflows.filter(w => w.is_active).length,
    totalExecutions: workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0),
    successRate: workflows.length > 0 
      ? workflows.reduce((sum, w) => sum + (w.successful_executions || 0), 0) / 
        Math.max(workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0), 1) * 100
      : 0
  };

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Workflows</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Workflows</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Executions</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalExecutions}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Success Rate</p>
              <p className="text-2xl font-bold text-orange-600">{stats.successRate.toFixed(1)}%</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}