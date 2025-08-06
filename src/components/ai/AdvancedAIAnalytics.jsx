import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Brain, 
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Star,
  Award,
  Lightbulb,
  Search,
  Filter,
  FileText,
  Database,
  Globe,
  Smartphone,
  CreditCard,
  Receipt,
  Calculator,
  Lock,
  Unlock,
  Key,
  Shield,
  AlertCircle,
  CheckSquare,
  Square,
  ExternalLink,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

export default function AdvancedAIAnalytics({ 
  onInsightGenerated,
  onModelTrained 
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModelModal, setShowModelModal] = useState(false);
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('revenue-prediction');
  const [timeRange, setTimeRange] = useState('30d');

  // AI Models
  const [aiModels, setAiModels] = useState([
    {
      id: 'model_001',
      name: 'Revenue Prediction Model',
      type: 'regression',
      status: 'active',
      accuracy: 94.2,
      lastTrained: '2024-01-15T10:30:00Z',
      trainingData: 125000,
      features: 45,
      performance: {
        precision: 0.942,
        recall: 0.938,
        f1Score: 0.940,
        mse: 0.023
      }
    },
    {
      id: 'model_002',
      name: 'Customer Churn Prediction',
      type: 'classification',
      status: 'active',
      accuracy: 91.8,
      lastTrained: '2024-01-14T15:45:00Z',
      trainingData: 89000,
      features: 32,
      performance: {
        precision: 0.918,
        recall: 0.915,
        f1Score: 0.916,
        auc: 0.934
      }
    },
    {
      id: 'model_003',
      name: 'Demand Forecasting',
      type: 'time-series',
      status: 'training',
      accuracy: 87.5,
      lastTrained: '2024-01-13T09:20:00Z',
      trainingData: 156000,
      features: 28,
      performance: {
        precision: 0.875,
        recall: 0.872,
        f1Score: 0.873,
        mape: 0.089
      }
    }
  ]);

  // AI Insights
  const [aiInsights, setAiInsights] = useState([
    {
      id: 'insight_001',
      type: 'opportunity',
      title: 'Revenue Growth Opportunity',
      description: 'AI analysis shows 23% revenue growth potential by optimizing pricing strategy for premium services.',
      confidence: 0.94,
      impact: 'high',
      category: 'revenue',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'active',
      actions: [
        'Implement dynamic pricing for premium services',
        'Focus marketing on high-value customer segments',
        'Optimize commission structures'
      ]
    },
    {
      id: 'insight_002',
      type: 'risk',
      title: 'Customer Churn Risk',
      description: '15% of premium customers show high churn probability in next 30 days.',
      confidence: 0.91,
      impact: 'high',
      category: 'customer',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'active',
      actions: [
        'Implement retention campaigns for at-risk customers',
        'Offer personalized incentives',
        'Improve customer service response times'
      ]
    },
    {
      id: 'insight_003',
      type: 'optimization',
      title: 'Operational Efficiency',
      description: 'AI suggests 18% cost reduction through automated booking processes.',
      confidence: 0.87,
      impact: 'medium',
      category: 'operations',
      timestamp: '2024-01-15T08:45:00Z',
      status: 'implementing',
      actions: [
        'Implement automated booking workflows',
        'Reduce manual intervention in standard processes',
        'Optimize resource allocation'
      ]
    }
  ]);

  // Predictive Analytics
  const [predictions, setPredictions] = useState([
    {
      id: 'pred_001',
      metric: 'Revenue',
      currentValue: 1250000,
      predictedValue: 1450000,
      confidence: 0.94,
      timeframe: '30d',
      trend: 'up',
      factors: ['seasonal growth', 'new services', 'market expansion']
    },
    {
      id: 'pred_002',
      metric: 'Customer Acquisition',
      currentValue: 450,
      predictedValue: 520,
      confidence: 0.91,
      timeframe: '30d',
      trend: 'up',
      factors: ['marketing campaigns', 'referral programs', 'market demand']
    },
    {
      id: 'pred_003',
      metric: 'Churn Rate',
      currentValue: 0.08,
      predictedValue: 0.06,
      confidence: 0.87,
      timeframe: '30d',
      trend: 'down',
      factors: ['retention programs', 'service improvements', 'customer satisfaction']
    }
  ]);

  // Model Performance Metrics
  const [modelMetrics, setModelMetrics] = useState({
    totalModels: 8,
    activeModels: 6,
    averageAccuracy: 91.2,
    totalPredictions: 156000,
    successfulPredictions: 142000,
    trainingTime: 45.5
  });

  const trainModel = async (modelData) => {
    setIsProcessing(true);
    try {
      // Simulate model training
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      const newModel = {
        id: `model_${Date.now()}`,
        name: modelData.name,
        type: modelData.type,
        status: 'active',
        accuracy: Math.random() * 10 + 85,
        lastTrained: new Date().toISOString(),
        trainingData: Math.floor(Math.random() * 100000) + 50000,
        features: Math.floor(Math.random() * 50) + 20,
        performance: {
          precision: 0.85 + Math.random() * 0.1,
          recall: 0.85 + Math.random() * 0.1,
          f1Score: 0.85 + Math.random() * 0.1,
          mse: 0.02 + Math.random() * 0.05
        }
      };
      
      setAiModels(prev => [...prev, newModel]);
      
      if (onModelTrained) {
        onModelTrained(newModel);
      }
    } catch (error) {
      console.error('Model training failed:', error);
    } finally {
      setIsProcessing(false);
      setShowModelModal(false);
    }
  };

  const generateInsight = async () => {
    setIsProcessing(true);
    try {
      // Simulate insight generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newInsight = {
        id: `insight_${Date.now()}`,
        type: ['opportunity', 'risk', 'optimization'][Math.floor(Math.random() * 3)],
        title: 'AI-Generated Insight',
        description: 'New AI analysis reveals optimization opportunities.',
        confidence: 0.85 + Math.random() * 0.1,
        impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        category: ['revenue', 'customer', 'operations'][Math.floor(Math.random() * 3)],
        timestamp: new Date().toISOString(),
        status: 'active',
        actions: ['Implement recommended actions', 'Monitor results', 'Adjust strategy']
      };
      
      setAiInsights(prev => [newInsight, ...prev]);
      
      if (onInsightGenerated) {
        onInsightGenerated(newInsight);
      }
    } catch (error) {
      console.error('Insight generation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      training: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      implementing: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={variants[status] || variants.inactive}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'risk': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'optimization': return <Zap className="w-4 h-4 text-blue-600" />;
      default: return <Lightbulb className="w-4 h-4 text-gray-600" />;
    }
  };

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* AI Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelMetrics.totalModels}</div>
            <p className="text-xs text-muted-foreground">
              {modelMetrics.activeModels} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelMetrics.averageAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              Across all models
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelMetrics.totalPredictions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((modelMetrics.successfulPredictions / modelMetrics.totalPredictions) * 100)}% success rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelMetrics.trainingTime}h</div>
            <p className="text-xs text-muted-foreground">
              Average per model
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Predictive Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{prediction.metric}</h3>
                  <div className="flex items-center gap-1">
                    {prediction.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">
                      {prediction.trend === 'up' ? '+' : '-'}
                      {Math.abs(((prediction.predictedValue - prediction.currentValue) / prediction.currentValue) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current</span>
                    <span className="font-medium">
                      {prediction.metric === 'Revenue' ? formatCurrency(prediction.currentValue) : 
                       prediction.metric === 'Churn Rate' ? `${(prediction.currentValue * 100).toFixed(1)}%` :
                       prediction.currentValue.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Predicted</span>
                    <span className="font-bold">
                      {prediction.metric === 'Revenue' ? formatCurrency(prediction.predictedValue) : 
                       prediction.metric === 'Churn Rate' ? `${(prediction.predictedValue * 100).toFixed(1)}%` :
                       prediction.predictedValue.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confidence</span>
                    <Badge variant="outline">
                      {(prediction.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ModelsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI Models</span>
            <Button onClick={() => setShowModelModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Train New Model
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiModels.map((model) => (
              <Card key={model.id} className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{model.name}</span>
                    {getStatusBadge(model.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Type</Label>
                        <div className="font-medium capitalize">{model.type.replace('-', ' ')}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Accuracy</Label>
                        <div className="font-bold text-green-600">{model.accuracy}%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Training Data</span>
                        <span className="font-medium">{model.trainingData.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Features</span>
                        <span className="font-medium">{model.features}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Trained</span>
                        <span className="font-medium">{new Date(model.lastTrained).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const InsightsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI Insights</span>
            <Button onClick={generateInsight} disabled={isProcessing}>
              <Brain className="w-4 h-4 mr-2" />
              {isProcessing ? 'Generating...' : 'Generate Insight'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-gray-100">
                    {getTypeIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="outline">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Recommended Actions:</Label>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {insight.actions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {new Date(insight.timestamp).toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Implement
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced AI Analytics</h2>
          <p className="text-muted-foreground">
            Deep learning analytics with predictive modeling and intelligent insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>
        
        <TabsContent value="models">
          <ModelsTab />
        </TabsContent>
        
        <TabsContent value="insights">
          <InsightsTab />
        </TabsContent>
      </Tabs>

      {/* Train Model Modal */}
      <Dialog open={showModelModal} onOpenChange={setShowModelModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Train New AI Model</DialogTitle>
            <DialogDescription>
              Configure and train a new machine learning model
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modelName">Model Name</Label>
              <Input id="modelName" placeholder="Enter model name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modelType">Model Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regression">Regression</SelectItem>
                  <SelectItem value="classification">Classification</SelectItem>
                  <SelectItem value="time-series">Time Series</SelectItem>
                  <SelectItem value="clustering">Clustering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="algorithm">Algorithm</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neural-network">Neural Network</SelectItem>
                  <SelectItem value="random-forest">Random Forest</SelectItem>
                  <SelectItem value="gradient-boosting">Gradient Boosting</SelectItem>
                  <SelectItem value="svm">Support Vector Machine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trainingData">Training Data Size</Label>
              <Input id="trainingData" type="number" placeholder="Enter data size" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModelModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => trainModel({
                name: 'New Model',
                type: 'regression',
                algorithm: 'neural-network',
                trainingData: 50000
              })}
              disabled={isProcessing}
            >
              {isProcessing ? 'Training...' : 'Train Model'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 