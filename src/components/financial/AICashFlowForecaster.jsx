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
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  AlertCircle
} from 'lucide-react';

export default function AICashFlowForecaster({ 
  historicalData = {},
  onForecastUpdate,
  onScenarioAnalysis 
}) {
  const [activeTab, setActiveTab] = useState('forecast');
  const [forecastPeriod, setForecastPeriod] = useState('90d');
  const [confidenceLevel, setConfidenceLevel] = useState(0.85);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('baseline');

  // Mock historical data
  const mockHistoricalData = {
    revenue: [
      { date: '2024-01-01', value: 125000, trend: 'up' },
      { date: '2024-01-15', value: 132000, trend: 'up' },
      { date: '2024-02-01', value: 118000, trend: 'down' },
      { date: '2024-02-15', value: 145000, trend: 'up' },
      { date: '2024-03-01', value: 138000, trend: 'down' },
      { date: '2024-03-15', value: 152000, trend: 'up' }
    ],
    expenses: [
      { date: '2024-01-01', value: 85000, trend: 'up' },
      { date: '2024-01-15', value: 88000, trend: 'up' },
      { date: '2024-02-01', value: 82000, trend: 'down' },
      { date: '2024-02-15', value: 92000, trend: 'up' },
      { date: '2024-03-01', value: 89000, trend: 'down' },
      { date: '2024-03-15', value: 95000, trend: 'up' }
    ],
    cashFlow: [
      { date: '2024-01-01', value: 40000, trend: 'up' },
      { date: '2024-01-15', value: 44000, trend: 'up' },
      { date: '2024-02-01', value: 36000, trend: 'down' },
      { date: '2024-02-15', value: 53000, trend: 'up' },
      { date: '2024-03-01', value: 49000, trend: 'down' },
      { date: '2024-03-15', value: 57000, trend: 'up' }
    ]
  };

  // AI-generated forecasts
  const [forecasts, setForecasts] = useState({
    optimistic: {
      '30d': { revenue: 165000, expenses: 98000, cashFlow: 67000, confidence: 0.78 },
      '60d': { revenue: 340000, expenses: 195000, cashFlow: 145000, confidence: 0.72 },
      '90d': { revenue: 520000, expenses: 295000, cashFlow: 225000, confidence: 0.68 }
    },
    baseline: {
      '30d': { revenue: 158000, expenses: 95000, cashFlow: 63000, confidence: 0.85 },
      '60d': { revenue: 325000, expenses: 190000, cashFlow: 135000, confidence: 0.82 },
      '90d': { revenue: 495000, expenses: 285000, cashFlow: 210000, confidence: 0.79 }
    },
    pessimistic: {
      '30d': { revenue: 145000, expenses: 92000, cashFlow: 53000, confidence: 0.81 },
      '60d': { revenue: 295000, expenses: 185000, cashFlow: 110000, confidence: 0.78 },
      '90d': { revenue: 445000, expenses: 275000, cashFlow: 170000, confidence: 0.75 }
    }
  });

  // Risk factors and insights
  const [riskFactors, setRiskFactors] = useState([
    {
      factor: 'Seasonal Tourism Fluctuations',
      impact: 'high',
      probability: 0.85,
      description: 'Expected 15-20% revenue increase during peak travel season',
      mitigation: 'Diversify into business travel and year-round destinations'
    },
    {
      factor: 'Currency Exchange Rate Volatility',
      impact: 'medium',
      probability: 0.65,
      description: 'Potential 5-8% impact on international transaction margins',
      mitigation: 'Implement hedging strategies and multi-currency pricing'
    },
    {
      factor: 'Fuel Price Increases',
      impact: 'medium',
      probability: 0.70,
      description: 'Could increase operational costs by 3-5%',
      mitigation: 'Negotiate fixed-rate contracts with suppliers'
    },
    {
      factor: 'Economic Downturn',
      impact: 'high',
      probability: 0.35,
      description: 'Potential 20-30% reduction in discretionary travel spending',
      mitigation: 'Focus on essential business travel and cost optimization'
    }
  ]);

  // AI insights
  const [aiInsights, setAiInsights] = useState([
    {
      type: 'opportunity',
      title: 'Revenue Growth Opportunity',
      description: 'Historical data shows 12% average monthly growth. AI predicts 15% growth potential with optimized pricing strategy.',
      confidence: 0.88,
      action: 'Implement dynamic pricing model for peak seasons',
      impact: 'high'
    },
    {
      type: 'warning',
      title: 'Cash Flow Risk',
      description: 'Expense growth rate (8%) exceeds revenue growth rate (6%) in recent months. This trend could impact cash flow by Q3.',
      confidence: 0.82,
      action: 'Review and optimize operational costs',
      impact: 'medium'
    },
    {
      type: 'optimization',
      title: 'Working Capital Optimization',
      description: 'Current cash conversion cycle is 45 days. AI suggests it can be reduced to 32 days with improved processes.',
      confidence: 0.91,
      action: 'Implement automated payment processing and vendor management',
      impact: 'high'
    }
  ]);

  const generateForecast = async () => {
    setIsProcessing(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In production, this would call an AI/ML API
      const newForecasts = {
        optimistic: {
          '30d': { revenue: 168000, expenses: 99000, cashFlow: 69000, confidence: 0.80 },
          '60d': { revenue: 345000, expenses: 198000, cashFlow: 147000, confidence: 0.75 },
          '90d': { revenue: 525000, expenses: 298000, cashFlow: 227000, confidence: 0.70 }
        },
        baseline: {
          '30d': { revenue: 160000, expenses: 96000, cashFlow: 64000, confidence: 0.87 },
          '60d': { revenue: 328000, expenses: 192000, cashFlow: 136000, confidence: 0.84 },
          '90d': { revenue: 498000, expenses: 287000, cashFlow: 211000, confidence: 0.81 }
        },
        pessimistic: {
          '30d': { revenue: 148000, expenses: 93000, cashFlow: 55000, confidence: 0.83 },
          '60d': { revenue: 298000, expenses: 187000, cashFlow: 111000, confidence: 0.80 },
          '90d': { revenue: 448000, expenses: 277000, cashFlow: 171000, confidence: 0.77 }
        }
      };
      
      setForecasts(newForecasts);
      
      if (onForecastUpdate) {
        onForecastUpdate(newForecasts);
      }
    } catch (error) {
      console.error('Forecast generation failed:', error);
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

  const getTrendIcon = (trend) => {
    return trend === 'up' ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : trend === 'down' ? (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    ) : (
      <Minus className="w-4 h-4 text-gray-600" />
    );
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ForecastTab = () => (
    <div className="space-y-6">
      {/* Forecast Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Cash Flow Forecast
            </span>
            <div className="flex gap-2">
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="60d">60 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={generateForecast} 
                disabled={isProcessing}
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                {isProcessing ? 'Generating...' : 'Update Forecast'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['optimistic', 'baseline', 'pessimistic'].map((scenario) => {
              const data = forecasts[scenario][forecastPeriod];
              return (
                <Card key={scenario} className="border-2 border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg capitalize flex items-center gap-2">
                      {scenario === 'optimistic' && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {scenario === 'baseline' && <Target className="w-4 h-4 text-blue-600" />}
                      {scenario === 'pessimistic' && <TrendingDown className="w-4 h-4 text-red-600" />}
                      {scenario} Scenario
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Revenue</span>
                        <span className="font-bold">{formatCurrency(data.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Expenses</span>
                        <span className="font-bold">{formatCurrency(data.expenses)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium">Cash Flow</span>
                        <span className={`font-bold ${data.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(data.cashFlow)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Confidence</span>
                      <Badge className={getConfidenceColor(data.confidence)}>
                        {(data.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'opportunity' ? 'bg-green-100 text-green-600' :
                    insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {insight.type === 'opportunity' && <TrendingUp className="w-4 h-4" />}
                    {insight.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                    {insight.type === 'optimization' && <Zap className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Recommended Action:</span>
                      <span className="text-sm text-blue-600">{insight.action}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <Badge variant="outline" className="text-xs">
                        {(insight.confidence * 100).toFixed(0)}%
                      </Badge>
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

  const RiskAnalysisTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Risk Factor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Factor</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Mitigation Strategy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskFactors.map((risk, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{risk.factor}</TableCell>
                  <TableCell>
                    <Badge className={getImpactColor(risk.impact)}>
                      {risk.impact}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${risk.probability * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{(risk.probability * 100).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{risk.description}</TableCell>
                  <TableCell className="text-sm text-blue-600">{risk.mitigation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Risk Mitigation Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Exposure Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>High Risk Factors</span>
                <Badge variant="destructive">2</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Medium Risk Factors</span>
                <Badge variant="outline">2</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Low Risk Factors</span>
                <Badge variant="outline">0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mitigation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Implemented</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-sm">60%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>In Progress</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  <span className="text-sm">30%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Not Started</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  <span className="text-sm">10%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const HistoricalDataTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Historical Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(mockHistoricalData).map(([metric, data]) => (
              <div key={metric} className="border rounded-lg p-4">
                <h3 className="font-semibold capitalize mb-4">{metric} Trends</h3>
                <div className="space-y-3">
                  {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                        {getTrendIcon(item.trend)}
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(item.value)}</div>
                        <div className="text-xs text-gray-500 capitalize">{item.trend} trend</div>
                      </div>
                    </div>
                  ))}
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
          <h2 className="text-2xl font-bold">AI-Powered Cash Flow Forecasting</h2>
          <p className="text-muted-foreground">
            Machine learning predictions with scenario analysis and risk assessment
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowScenarioModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Scenario Settings
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="historical">Historical Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="forecast">
          <ForecastTab />
        </TabsContent>
        
        <TabsContent value="risks">
          <RiskAnalysisTab />
        </TabsContent>
        
        <TabsContent value="historical">
          <HistoricalDataTab />
        </TabsContent>
      </Tabs>

      {/* Scenario Settings Modal */}
      <Dialog open={showScenarioModal} onOpenChange={setShowScenarioModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Forecast Scenario Settings</DialogTitle>
            <DialogDescription>
              Configure AI forecasting parameters and scenario assumptions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Confidence Level</Label>
              <Select value={confidenceLevel.toString()} onValueChange={(value) => setConfidenceLevel(parseFloat(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.95">95% (Very High)</SelectItem>
                  <SelectItem value="0.90">90% (High)</SelectItem>
                  <SelectItem value="0.85">85% (Medium-High)</SelectItem>
                  <SelectItem value="0.80">80% (Medium)</SelectItem>
                  <SelectItem value="0.75">75% (Medium-Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Data Points Used</Label>
              <div className="text-sm text-gray-600">
                Using last 12 months of data with seasonal adjustments and trend analysis
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>AI Model Version</Label>
              <div className="text-sm text-gray-600">
                Advanced Neural Network v2.1 with LSTM layers for time series prediction
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScenarioModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowScenarioModal(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 