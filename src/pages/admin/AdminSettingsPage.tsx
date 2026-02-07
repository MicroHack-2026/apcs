import { useState } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { PlatformSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

const timeZones = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

const slotDurations = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const [localSettings, setLocalSettings] = useState<PlatformSettings | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  if (settings && !localSettings) {
    setLocalSettings(settings);
  }

  const handleSave = () => {
    if (!localSettings) return;

    updateMutation.mutate(localSettings, {
      onSuccess: () => {
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 3000);
      },
    });
  };

  const handleReset = () => {
    if (settings) {
      setLocalSettings(settings);
    }
  };

  if (isLoading || !settings || !localSettings) {
    return (
      <LayoutShell showSidebar={true} role="ADMIN">
        <div className="py-12 text-center text-muted-foreground">
          Loading settings...
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell showSidebar={true} role="ADMIN">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure platform properties</p>
        </div>

        <div className="bg-white border border-border rounded-xl p-6 space-y-5 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">General</h2>
          
          <div className="space-y-2">
            <Label htmlFor="platformName">Platform Name</Label>
            <Input
              id="platformName"
              value={localSettings.platformName}
              onChange={(e) => setLocalSettings({ ...localSettings, platformName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Default Time Zone</Label>
            <Select
              value={localSettings.defaultTimeZone}
              onValueChange={(value) => setLocalSettings({ ...localSettings, defaultTimeZone: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeZones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6 space-y-5 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">Slot Configuration</h2>
          
          <div className="space-y-2">
            <Label htmlFor="slotDuration">Slot Duration Default</Label>
            <Select
              value={String(localSettings.slotDurationMinutes)}
              onValueChange={(value) => setLocalSettings({ ...localSettings, slotDurationMinutes: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {slotDurations.map((dur) => (
                  <SelectItem key={dur.value} value={dur.value}>
                    {dur.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultCapacity">Default Capacity</Label>
            <Input
              id="defaultCapacity"
              type="number"
              min={1}
              max={100}
              value={localSettings.defaultCapacity}
              onChange={(e) => setLocalSettings({ ...localSettings, defaultCapacity: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6 space-y-5 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Notify on Booking</Label>
              <p className="text-sm text-muted-foreground">Send notification when appointment is scheduled</p>
            </div>
            <Switch
              checked={localSettings.notifyOnBooking}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, notifyOnBooking: checked })}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Notify on Arrival</Label>
              <p className="text-sm text-muted-foreground">Send notification when container arrives</p>
            </div>
            <Switch
              checked={localSettings.notifyOnArrival}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, notifyOnArrival: checked })}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Notify on Cancellation</Label>
              <p className="text-sm text-muted-foreground">Send notification when appointment is cancelled</p>
            </div>
            <Switch
              checked={localSettings.notifyOnCancellation}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, notifyOnCancellation: checked })}
            />
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-5">Maintenance</h2>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Temporarily disable platform access</p>
            </div>
            <Switch
              checked={localSettings.maintenanceMode}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, maintenanceMode: checked })}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset} 
            disabled={updateMutation.isPending}
          >
            Reset
          </Button>
          {showSaved && (
            <span className="text-sm text-status-arrived animate-fade-in">
              Saved
            </span>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}
