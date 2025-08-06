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
  DollarSign, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Globe,
  Calculator,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Supported currencies with symbols and names
const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', flag: '🇵🇱' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', flag: '🇨🇿' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', flag: '🇭🇺' }
];

// Mock exchange rates (in production, this would come from a real API)
const MOCK_EXCHANGE_RATES = {
  USD: 1.0000,
  EUR: 0.9200,
  GBP: 0.7900,
  CAD: 1.3500,
  AUD: 1.5200,
  JPY: 150.0000,
  CHF: 0.8800,
  CNY: 7.2000,
  INR: 83.0000,
  BRL: 4.9500,
  MXN: 17.5000,
  SGD: 1.3400,
  HKD: 7.8200,
  NZD: 1.6500,
  SEK: 10.5000,
  NOK: 10.8000,
  DKK: 6.9000,
  PLN: 4.0500,
  CZK: 23.2000,
  HUF: 360.0000
};

export default function MultiCurrencyManager({ 
  baseCurrency = 'USD', 
  onCurrencyChange, 
  onExchangeRateUpdate,
  showSettings = true 
}) {
  const [activeTab, setActiveTab] = useState('converter');
  const [exchangeRates, setExchangeRates] = useState(MOCK_EXCHANGE_RATES);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Currency conversion state
  const [fromCurrency, setFromCurrency] = useState(baseCurrency);
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  
  // Settings state
  const [selectedCurrencies, setSelectedCurrencies] = useState(['USD', 'EUR', 'GBP', 'CAD']);
  const [autoUpdateRates, setAutoUpdateRates] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(3600); // 1 hour in seconds

  // Calculate converted amount
  useEffect(() => {
    if (amount && fromCurrency && toCurrency && exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
      const fromRate = exchangeRates[fromCurrency];
      const toRate = exchangeRates[toCurrency];
      const converted = (parseFloat(amount) / fromRate) * toRate;
      setConvertedAmount(converted.toFixed(4));
    } else {
      setConvertedAmount('');
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  // Auto-update exchange rates
  useEffect(() => {
    if (autoUpdateRates) {
      const interval = setInterval(() => {
        updateExchangeRates();
      }, updateInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [autoUpdateRates, updateInterval]);

  const updateExchangeRates = async () => {
    setIsUpdating(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would be a real API call
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      // const data = await response.json();
      
      // For now, we'll simulate some rate changes
      const newRates = { ...MOCK_EXCHANGE_RATES };
      Object.keys(newRates).forEach(currency => {
        if (currency !== 'USD') {
          // Simulate small random changes
          const change = (Math.random() - 0.5) * 0.02; // ±1% change
          newRates[currency] = newRates[currency] * (1 + change);
        }
      });
      
      setExchangeRates(newRates);
      setLastUpdated(new Date());
      
      if (onExchangeRateUpdate) {
        onExchangeRateUpdate(newRates);
      }
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount, currencyCode) => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    if (!currency) return `${currencyCode} ${amount}`;
    
    return `${currency.symbol}${parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    })}`;
  };

  const getCurrencyInfo = (currencyCode) => {
    return SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || {};
  };

  const getRateChange = (currencyCode) => {
    // Simulate rate change (in production, this would be calculated from historical data)
    const currentRate = exchangeRates[currencyCode];
    const previousRate = MOCK_EXCHANGE_RATES[currencyCode];
    const change = ((currentRate - previousRate) / previousRate) * 100;
    return change;
  };

  const CurrencyConverter = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Currency Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fromCurrency">From</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span>{currency.flag}</span>
                        <span>{currency.code}</span>
                        <span className="text-muted-foreground">({currency.name})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toCurrency">To</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span>{currency.flag}</span>
                        <span>{currency.code}</span>
                        <span className="text-muted-foreground">({currency.name})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {convertedAmount && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Converted Amount</div>
              <div className="text-2xl font-bold">
                {formatCurrency(convertedAmount, toCurrency)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Exchange Rate: 1 {fromCurrency} = {formatCurrency(exchangeRates[toCurrency] / exchangeRates[fromCurrency], toCurrency)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const ExchangeRatesTable = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Live Exchange Rates</h3>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <Button 
          onClick={updateExchangeRates} 
          disabled={isUpdating}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
          Update Rates
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Rate (USD)</TableHead>
                <TableHead>Change (24h)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedCurrencies.map(currencyCode => {
                const currency = getCurrencyInfo(currencyCode);
                const rate = exchangeRates[currencyCode];
                const change = getRateChange(currencyCode);
                
                return (
                  <TableRow key={currencyCode}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{currency.flag}</span>
                        <div>
                          <div className="font-medium">{currency.code}</div>
                          <div className="text-sm text-muted-foreground">{currency.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono">{rate?.toFixed(4)}</div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${
                        change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {change > 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : change < 0 ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <span className="w-4 h-4" />
                        )}
                        <span className="font-mono">{change.toFixed(2)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFromCurrency('USD');
                          setToCurrency(currencyCode);
                          setAmount('1');
                        }}
                      >
                        Convert
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const CurrencySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Currency Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Base Currency</Label>
            <Select value={baseCurrency} onValueChange={onCurrencyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span>{currency.flag}</span>
                      <span>{currency.code}</span>
                      <span className="text-muted-foreground">({currency.name})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Auto-update Exchange Rates</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoUpdate"
                checked={autoUpdateRates}
                onChange={(e) => setAutoUpdateRates(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="autoUpdate">Automatically update rates</Label>
            </div>
          </div>
          
          {autoUpdateRates && (
            <div className="space-y-2">
              <Label>Update Interval</Label>
              <Select value={updateInterval.toString()} onValueChange={(value) => setUpdateInterval(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="900">Every 15 minutes</SelectItem>
                  <SelectItem value="1800">Every 30 minutes</SelectItem>
                  <SelectItem value="3600">Every hour</SelectItem>
                  <SelectItem value="7200">Every 2 hours</SelectItem>
                  <SelectItem value="14400">Every 4 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Multi-Currency Management</h2>
          <p className="text-muted-foreground">
            Manage multiple currencies, track exchange rates, and convert between currencies
          </p>
        </div>
        {showSettings && (
          <Button
            variant="outline"
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="converter">Currency Converter</TabsTrigger>
          <TabsTrigger value="rates">Exchange Rates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="converter">
          <CurrencyConverter />
        </TabsContent>
        
        <TabsContent value="rates">
          <ExchangeRatesTable />
        </TabsContent>
        
        <TabsContent value="settings">
          <CurrencySettings />
        </TabsContent>
      </Tabs>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Currency Settings</DialogTitle>
            <DialogDescription>
              Configure your currency preferences and exchange rate settings
            </DialogDescription>
          </DialogHeader>
          <CurrencySettings />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettingsModal(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 