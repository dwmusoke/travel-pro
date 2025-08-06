import React, { useState, useEffect } from "react";
import { ServiceRule, RuleApplication } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Plane,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  History
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BLANK_RULE = {
  rule_name: "",
  rule_type: "service_fee",
  calculation_type: "fixed",
  value: 0,
  priority: 1,
  is_active: true,
  conditions: {
    supplier: [],
    route_origin: [],
    route_destination: [],
    agent_email: [],
    client_type: [],
    booking_class: [],
    currency: []
  },
  override_settings: {
    allow_agent_override: false,
    require_approval: false,
    max_override_percentage: 0
  },
  effective_date: new Date().toISOString().split('T')[0],
  expiry_date: ""
};

export default function ServiceRules() {
  const [rules, setRules] = useState([]);
  const [applications, setApplications] = useState([]);
  const [editingRule, setEditingRule] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rules");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ruleList, applicationList] = await Promise.all([
        ServiceRule.list('-created_date', 100),
        RuleApplication.list('-application_date', 200)
      ]);
      setRules(ruleList);
      setApplications(applicationList);
    } catch (error) {
      console.error("Error loading service rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRule = async (ruleData) => {
    try {
      if (editingRule) {
        await ServiceRule.update(editingRule.id, ruleData);
      } else {
        await ServiceRule.create(ruleData);
      }
      await loadData();
      setShowForm(false);
      setEditingRule(null);
    } catch (error) {
      console.error("Error saving rule:", error);
      alert("Failed to save rule");
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (confirm("Are you sure you want to delete this rule?")) {
      try {
        await ServiceRule.delete(ruleId);
        await loadData();
      } catch (error) {
        console.error("Error deleting rule:", error);
        alert("Failed to delete rule");
      }
    }
  };

  const getRuleTypeIcon = (type) => {
    switch (type) {
      case 'service_fee': return <DollarSign className="w-4 h-4" />;
      case 'markup': return <TrendingUp className="w-4 h-4" />;
      case 'commission': return <Users className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getRuleTypeColor = (type) => {
    switch (type) {
      case 'service_fee': return 'bg-blue-100 text-blue-800';
      case 'markup': return 'bg-green-100 text-green-800';
      case 'commission': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8">Loading Service Rules...</div>;
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Service Fee & Commission Rules</h1>
            <p className="text-slate-600">Manage automated pricing rules and commission structures</p>
          </div>
          <Button onClick={() => { setEditingRule(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Rule
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Active Rules ({rules.filter(r => r.is_active).length})</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail ({applications.length})</TabsTrigger>
            <TabsTrigger value="analytics">Rule Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-6">
            {/* Rule Statistics */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Service Fee Rules</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {rules.filter(r => r.rule_type === 'service_fee' && r.is_active).length}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Markup Rules</p>
                      <p className="text-2xl font-bold text-green-600">
                        {rules.filter(r => r.rule_type === 'markup' && r.is_active).length}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Commission Rules</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {rules.filter(r => r.rule_type === 'commission' && r.is_active).length}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Applications</p>
                      <p className="text-2xl font-bold text-slate-900">{applications.length}</p>
                    </div>
                    <History className="w-8 h-8 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rules List */}
            <Card>
              <CardHeader>
                <CardTitle>Service Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rules.length > 0 ? (
                    rules.map((rule) => (
                      <div key={rule.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2">
                              {getRuleTypeIcon(rule.rule_type)}
                              <h4 className="font-semibold text-slate-900">{rule.rule_name}</h4>
                            </div>
                            <Badge className={getRuleTypeColor(rule.rule_type)}>
                              {rule.rule_type.replace('_', ' ')}
                            </Badge>
                            {!rule.is_active && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingRule(rule); setShowForm(true); }}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteRule(rule.id)}>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
                          <div>
                            <p><strong>Value:</strong> {rule.calculation_type === 'percentage' ? `${rule.value}%` : `$${rule.value}`}</p>
                            <p><strong>Priority:</strong> {rule.priority}</p>
                          </div>
                          <div>
                            <p><strong>Effective:</strong> {rule.effective_date ? new Date(rule.effective_date).toLocaleDateString() : 'Immediate'}</p>
                            <p><strong>Expires:</strong> {rule.expiry_date ? new Date(rule.expiry_date).toLocaleDateString() : 'Never'}</p>
                          </div>
                        </div>

                        {(rule.conditions.supplier?.length > 0 || rule.conditions.route_origin?.length > 0) && (
                          <div className="mt-3 p-3 bg-slate-50 rounded">
                            <p className="text-sm font-medium text-slate-700 mb-2">Conditions:</p>
                            {rule.conditions.supplier?.length > 0 && (
                              <p className="text-xs text-slate-600">Airlines: {rule.conditions.supplier.join(', ')}</p>
                            )}
                            {rule.conditions.route_origin?.length > 0 && (
                              <p className="text-xs text-slate-600">Origins: {rule.conditions.route_origin.join(', ')}</p>
                            )}
                            {rule.conditions.route_destination?.length > 0 && (
                              <p className="text-xs text-slate-600">Destinations: {rule.conditions.route_destination.join(', ')}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No Service Rules Yet</h3>
                      <p className="text-slate-600 mb-4">Create your first rule to automate service fees and commissions</p>
                      <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Rule
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rule Application Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.length > 0 ? (
                    applications.slice(0, 50).map((app) => (
                      <div key={app.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900">{app.rule_name}</h4>
                            <p className="text-sm text-slate-600">
                              Applied to {app.applied_to_type} #{app.applied_to_id}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(app.application_date).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${app.final_amount.toFixed(2)}</p>
                            {app.override_applied && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs">Override Applied</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Original: <span className="font-medium">${app.original_amount.toFixed(2)}</span></p>
                          </div>
                          <div>
                            <p className="text-slate-600">Calculated: <span className="font-medium">${app.calculated_amount.toFixed(2)}</span></p>
                          </div>
                          <div>
                            <p className="text-slate-600">Final: <span className="font-medium">${app.final_amount.toFixed(2)}</span></p>
                          </div>
                        </div>
                        
                        {app.override_applied && app.override_reason && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                            <p><strong>Override Reason:</strong> {app.override_reason}</p>
                            <p><strong>Override By:</strong> {app.override_by}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No Applications Yet</h3>
                      <p className="text-slate-600">Rule applications will appear here as they are processed</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total Service Fees Applied</span>
                      <span className="font-bold text-green-600">
                        ${applications.filter(a => a.rule_name.includes('Service')).reduce((sum, a) => sum + (a.final_amount - a.original_amount), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total Markups Applied</span>
                      <span className="font-bold text-blue-600">
                        ${applications.filter(a => a.rule_name.includes('Markup')).reduce((sum, a) => sum + (a.final_amount - a.original_amount), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Override Rate</span>
                      <span className="font-bold text-orange-600">
                        {applications.length > 0 ? ((applications.filter(a => a.override_applied).length / applications.length) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Rule Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rules.slice(0, 5).map((rule) => {
                      const ruleApplications = applications.filter(a => a.rule_id === rule.id);
                      return (
                        <div key={rule.id} className="flex justify-between items-center">
                          <span className="text-slate-600 text-sm">{rule.rule_name}</span>
                          <Badge variant="secondary">{ruleApplications.length} applications</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Rule Form Modal */}
        {showForm && (
          <RuleFormModal
            rule={editingRule || BLANK_RULE}
            onSave={handleSaveRule}
            onClose={() => { setShowForm(false); setEditingRule(null); }}
          />
        )}
      </div>
    </div>
  );
}

// Rule Form Modal Component
function RuleFormModal({ rule, onSave, onClose }) {
  const [formData, setFormData] = useState(rule);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConditionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      conditions: { ...prev.conditions, [field]: value.split(',').map(v => v.trim()).filter(v => v) }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{rule.id ? 'Edit Rule' : 'Create New Rule'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Rule Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Rule Name</Label>
                <Input
                  value={formData.rule_name}
                  onChange={(e) => handleInputChange('rule_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Rule Type</Label>
                <Select value={formData.rule_type} onValueChange={(value) => handleInputChange('rule_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service_fee">Service Fee</SelectItem>
                    <SelectItem value="markup">Markup</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Calculation Type</Label>
                <Select value={formData.calculation_type} onValueChange={(value) => handleInputChange('calculation_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value</Label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rule Conditions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Suppliers/Airlines (comma-separated)</Label>
                  <Input
                    value={formData.conditions.supplier?.join(', ') || ''}
                    onChange={(e) => handleConditionChange('supplier', e.target.value)}
                    placeholder="AA, DL, UA"
                  />
                </div>
                <div>
                  <Label>Origin Cities (comma-separated)</Label>
                  <Input
                    value={formData.conditions.route_origin?.join(', ') || ''}
                    onChange={(e) => handleConditionChange('route_origin', e.target.value)}
                    placeholder="NYC, LAX, MIA"
                  />
                </div>
                <div>
                  <Label>Destination Cities (comma-separated)</Label>
                  <Input
                    value={formData.conditions.route_destination?.join(', ') || ''}
                    onChange={(e) => handleConditionChange('route_destination', e.target.value)}
                    placeholder="LHR, CDG, FRA"
                  />
                </div>
                <div>
                  <Label>Agent Emails (comma-separated)</Label>
                  <Input
                    value={formData.conditions.agent_email?.join(', ') || ''}
                    onChange={(e) => handleConditionChange('agent_email', e.target.value)}
                    placeholder="agent1@agency.com, agent2@agency.com"
                  />
                </div>
              </div>
            </div>

            {/* Override Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Override Settings</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.override_settings?.allow_agent_override || false}
                    onCheckedChange={(checked) => handleInputChange('override_settings', 
                      { ...formData.override_settings, allow_agent_override: checked })}
                  />
                  <Label>Allow Agent Override</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.override_settings?.require_approval || false}
                    onCheckedChange={(checked) => handleInputChange('override_settings', 
                      { ...formData.override_settings, require_approval: checked })}
                  />
                  <Label>Require Approval</Label>
                </div>
                <div>
                  <Label>Max Override %</Label>
                  <Input
                    type="number"
                    value={formData.override_settings?.max_override_percentage || 0}
                    onChange={(e) => handleInputChange('override_settings', 
                      { ...formData.override_settings, max_override_percentage: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Dates and Status */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => handleInputChange('effective_date', e.target.value)}
                />
              </div>
              <div>
                <Label>Expiry Date (optional)</Label>
                <Input
                  type="date"
                  value={formData.expiry_date || ''}
                  onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label>Active</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Save Rule
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}