import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Bell, Save } from "lucide-react";

export default function ReminderSettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    enableReminders: true,
    firstReminderDays: 3,
    secondReminderDays: 7,
    finalReminderDays: 14,
    reminderMethod: 'email',
    autoMarkOverdue: true,
    overdueDays: 30
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Here you would save the settings to your backend
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Reminder settings saved successfully!');
      onClose();
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-amber-50/80 backdrop-blur-md border-amber-200/50 rounded-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-amber-900 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Payment Reminder Settings
            </DialogTitle>
            <Button variant="ghost" onClick={onClose} className="text-amber-800 hover:bg-amber-800/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enableReminders" className="text-amber-900">Enable Automatic Reminders</Label>
            <Switch
              id="enableReminders"
              checked={settings.enableReminders}
              onCheckedChange={(checked) => setSettings({...settings, enableReminders: checked})}
            />
          </div>

          {settings.enableReminders && (
            <>
              <div className="space-y-4">
                <div>
                  <Label className="text-amber-900">First Reminder (days before due)</Label>
                  <Input
                    type="number"
                    value={settings.firstReminderDays}
                    onChange={(e) => setSettings({...settings, firstReminderDays: parseInt(e.target.value)})}
                    className="bg-amber-100/50 border-amber-300/50 text-amber-900"
                  />
                </div>
                <div>
                  <Label className="text-amber-900">Second Reminder (days after due)</Label>
                  <Input
                    type="number"
                    value={settings.secondReminderDays}
                    onChange={(e) => setSettings({...settings, secondReminderDays: parseInt(e.target.value)})}
                    className="bg-amber-100/50 border-amber-300/50 text-amber-900"
                  />
                </div>
                <div>
                  <Label className="text-amber-900">Final Reminder (days after due)</Label>
                  <Input
                    type="number"
                    value={settings.finalReminderDays}
                    onChange={(e) => setSettings({...settings, finalReminderDays: parseInt(e.target.value)})}
                    className="bg-amber-100/50 border-amber-300/50 text-amber-900"
                  />
                </div>
                <div>
                  <Label className="text-amber-900">Reminder Method</Label>
                  <Select value={settings.reminderMethod} onValueChange={(value) => setSettings({...settings, reminderMethod: value})}>
                    <SelectTrigger className="bg-amber-100/50 border-amber-300/50 text-amber-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="both">Email + WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-amber-200/50">
                <Label htmlFor="autoMarkOverdue" className="text-amber-900">Auto-mark as Overdue</Label>
                <Switch
                  id="autoMarkOverdue"
                  checked={settings.autoMarkOverdue}
                  onCheckedChange={(checked) => setSettings({...settings, autoMarkOverdue: checked})}
                />
              </div>

              {settings.autoMarkOverdue && (
                <div>
                  <Label className="text-amber-900">Mark Overdue After (days)</Label>
                  <Input
                    type="number"
                    value={settings.overdueDays}
                    onChange={(e) => setSettings({...settings, overdueDays: parseInt(e.target.value)})}
                    className="bg-amber-100/50 border-amber-300/50 text-amber-900"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="bg-amber-100/50 text-amber-900 border-amber-300/50">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-amber-800 text-white hover:bg-amber-900">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}