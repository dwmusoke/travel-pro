import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PlatformSettings } from "@/api/entities";
import { User } from "@/api/entities";
import { 
  Settings, 
  ArrowLeft, 
  Globe, 
  Mail, 
  Shield, 
  Database,
  Save,
  AlertCircle,
  Phone,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', or null
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Verify user is super admin
      const userData = await User.me();
      if (userData.app_role !== 'super_admin' && userData.email !== 'dwmusoke@gmail.com') {
        window.location.href = createPageUrl("Dashboard");
        return;
      }
      setUser(userData);

      // Try to get existing settings
      const existingSettings = await PlatformSettings.list();
      
      if (existingSettings.length > 0) {
        // Use existing settings
        setSettings(existingSettings[0]);
      } else {
        // Create default settings
        const defaultSettings = {
          platform_name: "TravelPro",
          support_email: "support@travelpro.com",
          support_phone: "",
          auto_approve_agencies: false,
          default_trial_days: 14,
          maintenance_mode: false,
          registration_enabled: true,
          max_agencies_per_plan: {
            basic: 1000,
            pro: 5000,
            enterprise: -1
          },
          security_settings: {
            session_timeout_minutes: 120,
            require_2fa: false,
            password_min_length: 8
          },
          integration_settings: {
            default_currency: "USD",
            allowed_file_types: ["txt", "csv", "xml", "pdf"]
          }
        };
        
        const createdSettings = await PlatformSettings.create(defaultSettings);
        setSettings(createdSettings);
      }
    } catch (error) {
      console.error("Error loading platform settings:", error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField, childField, value) => {
    setSettings(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    setSaveStatus(null);
    
    try {
      await PlatformSettings.update(settings.id, settings);
      setSaveStatus('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error saving platform settings:", error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 100%)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 100%)' }}>
        <Card className="max-w-lg bg-red-50/50 backdrop-blur-md border border-red-200/50 rounded-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-6 h-6" />
              Settings Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">Failed to load platform settings. Please refresh the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("SuperAdmin")}>
              <Button variant="outline" size="icon" className="bg-amber-100/50 backdrop-blur-sm text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-xl shadow-sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">Platform Settings</h1>
              <p className="text-amber-800/80">Manage global settings for the entire application.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === 'success' && (
              <Alert className="bg-green-100/50 border-green-200/50 p-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 ml-2">Settings saved successfully!</AlertDescription>
              </Alert>
            )}
            {saveStatus === 'error' && (
              <Alert className="bg-red-100/50 border-red-200/50 p-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 ml-2">Failed to save settings. Please try again.</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleSave} disabled={saving} className="bg-amber-800 text-white hover:bg-amber-900 rounded-xl shadow-lg">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-amber-200/50 backdrop-blur-sm border border-amber-300/50 rounded-xl text-amber-800">
            <TabsTrigger value="general" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">General</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Security</TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-amber-800/20 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-lg">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="mt-4 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Globe className="w-5 h-5" />
                  Platform Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Platform Name</Label>
                    <Input 
                      value={settings.platform_name || ''} 
                      onChange={e => handleInputChange('platform_name', e.target.value)}
                      placeholder="TravelPro"
                    />
                  </div>
                  <div>
                    <Label>Support Email</Label>
                    <Input 
                      type="email"
                      value={settings.support_email || ''} 
                      onChange={e => handleInputChange('support_email', e.target.value)}
                      placeholder="support@travelpro.com"
                    />
                  </div>
                </div>
                <div>
                  <Label>Support Phone</Label>
                  <Input 
                    type="tel"
                    value={settings.support_phone || ''} 
                    onChange={e => handleInputChange('support_phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-64"
                  />
                </div>
                <div>
                  <Label>Default Trial Period (Days)</Label>
                  <Input 
                    type="number"
                    value={settings.default_trial_days || 14} 
                    onChange={e => handleInputChange('default_trial_days', parseInt(e.target.value) || 14)}
                    className="w-32"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Settings className="w-5 h-5" />
                  System Toggles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Auto-Approve New Agencies</Label>
                    <p className="text-sm text-amber-800/70">Automatically approve agencies without manual review</p>
                  </div>
                  <Switch 
                    checked={settings.auto_approve_agencies || false} 
                    onCheckedChange={checked => handleInputChange('auto_approve_agencies', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Enable New Registrations</Label>
                    <p className="text-sm text-amber-800/70">Allow new agencies to sign up</p>
                  </div>
                  <Switch 
                    checked={settings.registration_enabled ?? true} 
                    onCheckedChange={checked => handleInputChange('registration_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-amber-800/70">Show maintenance page to all users</p>
                  </div>
                  <Switch 
                    checked={settings.maintenance_mode || false} 
                    onCheckedChange={checked => handleInputChange('maintenance_mode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="mt-4 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Session Timeout (Minutes)</Label>
                    <Input 
                      type="number"
                      value={settings.security_settings?.session_timeout_minutes || 120} 
                      onChange={e => handleNestedInputChange('security_settings', 'session_timeout_minutes', parseInt(e.target.value) || 120)}
                      className="w-32"
                    />
                  </div>
                  <div>
                    <Label>Minimum Password Length</Label>
                    <Input 
                      type="number"
                      value={settings.security_settings?.password_min_length || 8} 
                      onChange={e => handleNestedInputChange('security_settings', 'password_min_length', parseInt(e.target.value) || 8)}
                      className="w-32"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Require Two-Factor Authentication</Label>
                    <p className="text-sm text-amber-800/70">Force all users to enable 2FA</p>
                  </div>
                  <Switch 
                    checked={settings.security_settings?.require_2fa || false} 
                    onCheckedChange={checked => handleNestedInputChange('security_settings', 'require_2fa', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card className="mt-4 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Database className="w-5 h-5" />
                  Platform Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default Currency</Label>
                  <Input 
                    value={settings.integration_settings?.default_currency || 'USD'} 
                    onChange={e => handleNestedInputChange('integration_settings', 'default_currency', e.target.value)}
                    placeholder="USD"
                    className="w-32"
                  />
                </div>
                <div>
                  <Label>Allowed File Types</Label>
                  <Input 
                    value={settings.integration_settings?.allowed_file_types?.join(', ') || 'txt, csv, xml, pdf'} 
                    onChange={e => handleNestedInputChange('integration_settings', 'allowed_file_types', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="txt, csv, xml, pdf"
                  />
                  <p className="text-sm text-amber-700/70 mt-1">Comma-separated list of allowed file extensions</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}