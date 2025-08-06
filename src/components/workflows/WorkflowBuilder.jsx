import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  X, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Clock, 
  Mail, 
  MessageSquare,
  FileText,
  Bell,
  Settings,
  Zap,
  Users,
  CreditCard,
  TrendingUp,
  Database,
  Target,
  DollarSign
} from "lucide-react";

const TRIGGER_TYPES = [
  { value: 'ticket_created', label: 'When New Ticket Created', icon: FileText, category: 'operations' },
  { value: 'invoice_overdue', label: 'When Invoice Overdue', icon: Clock, category: 'financial' },
  { value: 'ticket_near_expiry', label: 'When Ticket Near Expiry', icon: Bell, category: 'operations' },
  { value: 'payment_received', label: 'When Payment Received', icon: CreditCard, category: 'financial' },
  { value: 'lead_created', label: 'When New Lead Created', icon: Target, category: 'sales' },
  { value: 'booking_confirmed', label: 'When Booking Confirmed', icon: FileText, category: 'sales' },
  { value: 'client_registered', label: 'When New Client Registered', icon: Users, category: 'client_management' },
  { value: 'scheduled', label: 'Scheduled (Daily/Weekly/Monthly)', icon: Clock, category: 'operations' },
  { value: 'manual', label: 'Manual Execution Only', icon: Settings, category: 'operations' }
];

const STEP_TYPES = [
  // Client & CRM Management
  { value: 'create_client', label: 'Create/Update Client', icon: Users, category: 'crm' },
  { value: 'create_lead', label: 'Create Sales Lead', icon: Target, category: 'sales' },
  { value: 'update_client_status', label: 'Update Client Status', icon: Users, category: 'crm' },
  { value: 'check_credit_limit', label: 'Check Credit Limit', icon: CreditCard, category: 'financial' },
  
  // Sales Pipeline
  { value: 'create_estimate', label: 'Create Estimate', icon: FileText, category: 'sales' },
  { value: 'create_booking', label: 'Create Booking', icon: FileText, category: 'sales' },
  { value: 'update_sales_pipeline', label: 'Update Pipeline Stage', icon: TrendingUp, category: 'sales' },
  
  // Financial Management
  { value: 'create_invoice', label: 'Create Invoice', icon: FileText, category: 'financial' },
  { value: 'record_payment', label: 'Record Payment', icon: CreditCard, category: 'financial' },
  { value: 'create_transaction', label: 'Create Transaction Record', icon: DollarSign, category: 'financial' },
  { value: 'apply_service_rules', label: 'Apply Service/Markup Rules', icon: Settings, category: 'financial' },
  { value: 'create_recurring_billing', label: 'Setup Recurring Billing', icon: CreditCard, category: 'financial' },
  
  // Communications
  { value: 'send_email', label: 'Send Email', icon: Mail, category: 'communication' },
  { value: 'send_whatsapp', label: 'Send WhatsApp', icon: MessageSquare, category: 'communication' },
  { value: 'send_payment_reminder', label: 'Send Payment Reminder', icon: Bell, category: 'communication' },
  
  // Analytics & Reporting
  { value: 'log_analytics_event', label: 'Log Analytics Event', icon: Database, category: 'analytics' },
  { value: 'update_kpi_metrics', label: 'Update KPI Metrics', icon: TrendingUp, category: 'analytics' },
  
  // Operations
  { value: 'mark_for_review', label: 'Mark for Review', icon: Bell, category: 'operations' },
  { value: 'notify_agent', label: 'Notify Agent', icon: Bell, category: 'operations' },
  { value: 'create_task', label: 'Create Task', icon: Bell, category: 'operations' }
];

const WORKFLOW_CATEGORIES = [
  { value: 'sales', label: 'Sales Pipeline', color: 'bg-blue-100 text-blue-800' },
  { value: 'financial', label: 'Financial Management', color: 'bg-green-100 text-green-800' },
  { value: 'client_management', label: 'Client Management', color: 'bg-purple-100 text-purple-800' },
  { value: 'operations', label: 'Operations', color: 'bg-orange-100 text-orange-800' },
  { value: 'analytics', label: 'Analytics & Reporting', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'compliance', label: 'Compliance', color: 'bg-red-100 text-red-800' }
];

export default function WorkflowBuilder({ workflow, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "operations",
    is_active: true,
    trigger: { type: "", conditions: {}, schedule: "" },
    steps: [],
    integration_settings: {
      email_notifications: true,
      slack_webhook: "",
      teams_webhook: ""
    }
  });

  useEffect(() => {
    if (workflow) {
      setFormData({
        name: workflow.name || "",
        description: workflow.description || "",
        category: workflow.category || "operations",
        is_active: workflow.is_active ?? true,
        trigger: workflow.trigger || { type: "", conditions: {}, schedule: "" },
        steps: workflow.steps || [],
        integration_settings: workflow.integration_settings || {
          email_notifications: true,
          slack_webhook: "",
          teams_webhook: ""
        }
      });
    }
  }, [workflow]);

  const handleAddStep = () => {
    const newStep = {
      id: `step_${Date.now()}`,
      type: "",
      config: {},
      conditions: {}
    };
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const handleRemoveStep = (stepId) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const handleStepChange = (stepId, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId 
          ? { ...step, [field]: value }
          : step
      )
    }));
  };

  const handleStepConfigChange = (stepId, configKey, configValue) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId 
          ? { ...step, config: { ...step.config, [configKey]: configValue } }
          : step
      )
    }));
  };

  const handleTriggerConditionChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      trigger: {
        ...prev.trigger,
        conditions: { ...prev.trigger.conditions, [key]: value }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const getStepIcon = (stepType) => {
    const step = STEP_TYPES.find(s => s.value === stepType);
    return step?.icon || Settings;
  };

  const getStepsByCategory = (category) => {
    return STEP_TYPES.filter(step => step.category === category);
  };

  const renderStepConfig = (step, stepIndex) => {
    const stepConfig = step.config || {};
    
    switch (step.type) {
      case 'send_email':
        return (
          <div className="space-y-3 mt-3 p-3 bg-amber-50 rounded-lg">
            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input
                value={stepConfig.subject || ''}
                onChange={(e) => handleStepConfigChange(step.id, 'subject', e.target.value)}
                placeholder="e.g., Your booking confirmation - {{ticket_number}}"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea
                value={stepConfig.body || ''}
                onChange={(e) => handleStepConfigChange(step.id, 'body', e.target.value)}
                placeholder="Dear {{client_name}}, your booking has been confirmed..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>From Name</Label>
              <Input
                value={stepConfig.from_name || ''}
                onChange={(e) => handleStepConfigChange(step.id, 'from_name', e.target.value)}
                placeholder="Your Travel Agent"
              />
            </div>
          </div>
        );

      case 'create_invoice':
        return (
          <div className="space-y-3 mt-3 p-3 bg-green-50 rounded-lg">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Service Fee</Label>
                <Input
                  type="number"
                  value={stepConfig.service_fee || 0}
                  onChange={(e) => handleStepConfigChange(step.id, 'service_fee', parseFloat(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={stepConfig.tax_rate || 0}
                  onChange={(e) => handleStepConfigChange(step.id, 'tax_rate', parseFloat(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Days</Label>
              <Input
                type="number"
                value={stepConfig.due_days || 30}
                onChange={(e) => handleStepConfigChange(step.id, 'due_days', parseInt(e.target.value))}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label>Invoice Notes</Label>
              <Textarea
                value={stepConfig.notes || ''}
                onChange={(e) => handleStepConfigChange(step.id, 'notes', e.target.value)}
                placeholder="Payment terms and conditions..."
                rows={2}
              />
            </div>
          </div>
        );

      case 'create_booking':
        return (
          <div className="space-y-3 mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="space-y-2">
              <Label>Booking Type</Label>
              <Select
                value={stepConfig.booking_type || 'flight'}
                onValueChange={(value) => handleStepConfigChange(step.id, 'booking_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                  <SelectItem value="car_rental">Car Rental</SelectItem>
                  <SelectItem value="travel_insurance">Travel Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Initial Status</Label>
              <Select
                value={stepConfig.initial_status || 'confirmed'}
                onValueChange={(value) => handleStepConfigChange(step.id, 'initial_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'create_lead':
        return (
          <div className="space-y-3 mt-3 p-3 bg-purple-50 rounded-lg">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Lead Source</Label>
                <Select
                  value={stepConfig.source || 'workflow'}
                  onValueChange={(value) => handleStepConfigChange(step.id, 'source', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="workflow">Workflow</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Initial Status</Label>
                <Select
                  value={stepConfig.initial_status || 'new'}
                  onValueChange={(value) => handleStepConfigChange(step.id, 'initial_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Follow-up Days</Label>
              <Input
                type="number"
                value={stepConfig.follow_up_days || 3}
                onChange={(e) => handleStepConfigChange(step.id, 'follow_up_days', parseInt(e.target.value))}
                placeholder="3"
              />
            </div>
          </div>
        );

      case 'create_transaction':
        return (
          <div className="space-y-3 mt-3 p-3 bg-green-50 rounded-lg">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <Select
                  value={stepConfig.transaction_type || 'income'}
                  onValueChange={(value) => handleStepConfigChange(step.id, 'transaction_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={stepConfig.category || 'ticket_sale'}
                  onValueChange={(value) => handleStepConfigChange(step.id, 'category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ticket_sale">Ticket Sale</SelectItem>
                    <SelectItem value="service_fee">Service Fee</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'log_analytics_event':
        return (
          <div className="space-y-3 mt-3 p-3 bg-indigo-50 rounded-lg">
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Input
                value={stepConfig.event_type || ''}
                onChange={(e) => handleStepConfigChange(step.id, 'event_type', e.target.value)}
                placeholder="e.g., booking_created, payment_received"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl max-h-[90vh] overflow-y-auto w-full">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-xl">
          <h2 className="text-xl font-bold">
            {workflow ? 'Edit Workflow' : 'Create New Workflow'}
          </h2>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-900">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workflow Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Complete Booking to Invoice Process"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKFLOW_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this workflow accomplishes and when it should be used..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          {/* Trigger Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Trigger - When should this workflow run?
            </h3>
            <div className="space-y-4">
              <Select
                value={formData.trigger.type}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  trigger: { ...prev.trigger, type: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose when this workflow should trigger" />
                </SelectTrigger>
                <SelectContent>
                  {Object.groupBy ? (
                    Object.entries(
                      TRIGGER_TYPES.reduce((groups, trigger) => {
                        groups[trigger.category] = groups[trigger.category] || [];
                        groups[trigger.category].push(trigger);
                        return groups;
                      }, {})
                    ).map(([category, triggers]) => (
                      <div key={category}>
                        <div className="px-2 py-1 text-xs font-semibold text-amber-700 uppercase">
                          {category.replace('_', ' ')}
                        </div>
                        {triggers.map(trigger => {
                          const IconComponent = trigger.icon;
                          return (
                            <SelectItem key={trigger.value} value={trigger.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4" />
                                {trigger.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </div>
                    ))
                  ) : (
                    TRIGGER_TYPES.map(trigger => {
                      const IconComponent = trigger.icon;
                      return (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            {trigger.label}
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>

              {/* Trigger Conditions */}
              {formData.trigger.type === 'invoice_overdue' && (
                <div className="space-y-2">
                  <Label>Days overdue</Label>
                  <Input
                    type="number"
                    value={formData.trigger.conditions.days || 7}
                    onChange={(e) => handleTriggerConditionChange('days', parseInt(e.target.value))}
                    placeholder="7"
                  />
                </div>
              )}

              {formData.trigger.type === 'ticket_near_expiry' && (
                <div className="space-y-2">
                  <Label>Days before expiry</Label>
                  <Input
                    type="number"
                    value={formData.trigger.conditions.days_before || 3}
                    onChange={(e) => handleTriggerConditionChange('days_before', parseInt(e.target.value))}
                    placeholder="3"
                  />
                </div>
              )}

              {formData.trigger.type === 'scheduled' && (
                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <Select
                    value={formData.trigger.schedule || ''}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      trigger: { ...prev.trigger, schedule: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose schedule frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0 9 * * *">Daily at 9 AM</SelectItem>
                      <SelectItem value="0 9 * * 1">Weekly on Monday at 9 AM</SelectItem>
                      <SelectItem value="0 9 1 * *">Monthly on 1st at 9 AM</SelectItem>
                      <SelectItem value="0 9 1 1,4,7,10 *">Quarterly at 9 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Steps Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Actions - What should happen?
              </h3>
              <Button type="button" onClick={handleAddStep} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>

            <div className="space-y-4">
              {formData.steps.map((step, index) => {
                const StepIcon = getStepIcon(step.type);
                const stepType = STEP_TYPES.find(s => s.value === step.type);
                
                return (
                  <Card key={step.id} className="border-2 border-dashed border-amber-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-amber-600">{index + 1}</span>
                          </div>
                          {index < formData.steps.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-amber-400 mt-2 rotate-90" />
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <Select
                                value={step.type}
                                onValueChange={(value) => handleStepChange(step.id, 'type', value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Choose an action" />
                                </SelectTrigger>
                                <SelectContent>
                                  {['crm', 'sales', 'financial', 'communication', 'analytics', 'operations'].map(category => (
                                    <div key={category}>
                                      <div className="px-2 py-1 text-xs font-semibold text-amber-700 uppercase">
                                        {category.replace('_', ' ')}
                                      </div>
                                      {getStepsByCategory(category).map(stepType => {
                                        const IconComponent = stepType.icon;
                                        return (
                                          <SelectItem key={stepType.value} value={stepType.value}>
                                            <div className="flex items-center gap-2">
                                              <IconComponent className="w-4 h-4" />
                                              {stepType.label}
                                            </div>
                                          </SelectItem>
                                        );
                                      })}
                                    </div>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveStep(step.id)}
                              className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {stepType && (
                            <Badge className={`${stepType.category === 'crm' ? 'bg-purple-100 text-purple-800' :
                              stepType.category === 'sales' ? 'bg-blue-100 text-blue-800' :
                              stepType.category === 'financial' ? 'bg-green-100 text-green-800' :
                              stepType.category === 'communication' ? 'bg-orange-100 text-orange-800' :
                              stepType.category === 'analytics' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-gray-100 text-gray-800'}`}>
                              {stepType.category.replace('_', ' ')}
                            </Badge>
                          )}

                          {/* Step-specific configuration */}
                          {renderStepConfig(step, index)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {formData.steps.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-amber-200 rounded-lg">
                  <p className="text-amber-500">No actions added yet. Click "Add Step" to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Integration Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-900">Integration Settings</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="email_notifications"
                  checked={formData.integration_settings.email_notifications}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    integration_settings: { ...prev.integration_settings, email_notifications: checked }
                  }))}
                />
                <Label htmlFor="email_notifications">Send email notifications on execution</Label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              disabled={!formData.name || !formData.trigger.type}
            >
              {workflow ? 'Update Workflow' : 'Create Workflow'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}