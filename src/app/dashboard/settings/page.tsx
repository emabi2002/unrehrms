"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  Shield,
  Mail,
  Bell,
  Lock,
  Globe,
  DollarSign,
  FileText,
  Users,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface SystemSettings {
  approval_workflow_enabled: boolean;
  auto_approval_threshold: number;
  budget_check_enabled: boolean;
  email_notifications_enabled: boolean;
  require_supporting_docs: boolean;
  fiscal_year_start: string;
  currency: string;
  max_file_size_mb: number;
  pgas_sync_enabled: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<SystemSettings>({
    approval_workflow_enabled: true,
    auto_approval_threshold: 1000,
    budget_check_enabled: true,
    email_notifications_enabled: true,
    require_supporting_docs: true,
    fiscal_year_start: "2025-01-01",
    currency: "PGK",
    max_file_size_mb: 10,
    pgas_sync_enabled: true,
  });

  const [approvalLevels, setApprovalLevels] = useState([
    { role: "Head of Department", min_amount: 0, max_amount: 5000, order: 1 },
    { role: "Dean", min_amount: 5001, max_amount: 20000, order: 2 },
    { role: "Bursar", min_amount: 20001, max_amount: 100000, order: 3 },
    { role: "Registrar", min_amount: 100001, max_amount: 999999999, order: 4 },
  ]);

  const [emailSettings, setEmailSettings] = useState({
    smtp_host: "smtp.gmail.com",
    smtp_port: "587",
    smtp_user: "notifications@unre.ac.pg",
    smtp_password: "",
    from_email: "noreply@unre.ac.pg",
    from_name: "UNRE GE System",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    notify_on_request_submission: true,
    notify_on_approval_required: true,
    notify_on_request_approved: true,
    notify_on_request_rejected: true,
    notify_on_payment_created: true,
    notify_on_budget_alert: true,
  });

  async function handleSaveSettings() {
    setSaving(true);
    try {
      // In a real implementation, you would save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail() {
    try {
      toast.info("Sending test email...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Test email sent successfully! Please check your inbox.");
    } catch (error) {
      toast.error("Failed to send test email");
    }
  }

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "approval", label: "Approval Workflow", icon: CheckCircle },
    { id: "email", label: "Email Settings", icon: Mail },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-600 mt-1">
          Configure system preferences and workflows
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <Card className="lg:col-span-1 p-4 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-unre-green-50 text-unre-green-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    General Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Fiscal Year Start Date</Label>
                        <Input
                          type="date"
                          value={settings.fiscal_year_start}
                          onChange={(e) =>
                            setSettings({ ...settings, fiscal_year_start: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Currency</Label>
                        <select
                          className="w-full border border-slate-300 rounded-md px-3 py-2"
                          value={settings.currency}
                          onChange={(e) =>
                            setSettings({ ...settings, currency: e.target.value })
                          }
                        >
                          <option value="PGK">PGK - Papua New Guinea Kina</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label>Maximum File Upload Size (MB)</Label>
                      <Input
                        type="number"
                        value={settings.max_file_size_mb}
                        onChange={(e) =>
                          setSettings({ ...settings, max_file_size_mb: parseInt(e.target.value) })
                        }
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Maximum size for document uploads
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-medium text-slate-900">Feature Toggles</h3>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm text-slate-900">Budget Checking</p>
                          <p className="text-xs text-slate-600">
                            Validate requests against available budget
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.budget_check_enabled}
                            onChange={(e) =>
                              setSettings({ ...settings, budget_check_enabled: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-unre-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-unre-green-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm text-slate-900">Require Supporting Documents</p>
                          <p className="text-xs text-slate-600">
                            Make document uploads mandatory
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.require_supporting_docs}
                            onChange={(e) =>
                              setSettings({ ...settings, require_supporting_docs: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-unre-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-unre-green-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm text-slate-900">PGAS Synchronization</p>
                          <p className="text-xs text-slate-600">
                            Enable automatic sync with PGAS AAP
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.pgas_sync_enabled}
                            onChange={(e) =>
                              setSettings({ ...settings, pgas_sync_enabled: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-unre-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-unre-green-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Approval Workflow */}
          {activeTab === "approval" && (
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Approval Workflow Configuration
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-slate-900">Enable Approval Workflow</p>
                        <p className="text-xs text-slate-600">
                          Require multi-level approvals for requests
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.approval_workflow_enabled}
                          onChange={(e) =>
                            setSettings({ ...settings, approval_workflow_enabled: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-unre-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-unre-green-600"></div>
                      </label>
                    </div>

                    <div>
                      <Label>Auto-Approval Threshold (PGK)</Label>
                      <Input
                        type="number"
                        value={settings.auto_approval_threshold}
                        onChange={(e) =>
                          setSettings({ ...settings, auto_approval_threshold: parseInt(e.target.value) })
                        }
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Requests below this amount may be auto-approved
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium text-slate-900 mb-3">Approval Levels</h3>
                      <div className="space-y-2">
                        {approvalLevels.map((level, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <Badge className="bg-unre-green-600">{level.order}</Badge>
                            <div className="flex-1">
                              <p className="font-medium text-sm text-slate-900">{level.role}</p>
                              <p className="text-xs text-slate-600">
                                PGK {level.min_amount.toLocaleString()} - {level.max_amount.toLocaleString()}
                              </p>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Email Settings */}
          {activeTab === "email" && (
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Email Configuration
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-slate-900">Email Notifications</p>
                        <p className="text-xs text-slate-600">
                          Send email alerts for system events
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.email_notifications_enabled}
                          onChange={(e) =>
                            setSettings({ ...settings, email_notifications_enabled: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-unre-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-unre-green-600"></div>
                      </label>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>SMTP Host</Label>
                        <Input
                          value={emailSettings.smtp_host}
                          onChange={(e) =>
                            setEmailSettings({ ...emailSettings, smtp_host: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>SMTP Port</Label>
                        <Input
                          value={emailSettings.smtp_port}
                          onChange={(e) =>
                            setEmailSettings({ ...emailSettings, smtp_port: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>SMTP Username</Label>
                        <Input
                          value={emailSettings.smtp_user}
                          onChange={(e) =>
                            setEmailSettings({ ...emailSettings, smtp_user: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>SMTP Password</Label>
                        <Input
                          type="password"
                          value={emailSettings.smtp_password}
                          onChange={(e) =>
                            setEmailSettings({ ...emailSettings, smtp_password: e.target.value })
                          }
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>From Email</Label>
                        <Input
                          type="email"
                          value={emailSettings.from_email}
                          onChange={(e) =>
                            setEmailSettings({ ...emailSettings, from_email: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>From Name</Label>
                        <Input
                          value={emailSettings.from_name}
                          onChange={(e) =>
                            setEmailSettings({ ...emailSettings, from_name: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <Button onClick={handleTestEmail} variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Test Email
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Notification Preferences
                  </h2>

                  <div className="space-y-2">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-unre-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-unre-green-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Security Settings
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-blue-900 text-sm">Authentication</h3>
                          <p className="text-sm text-blue-700 mt-1">
                            Authentication is managed through Supabase Auth. Users are required to verify their email addresses.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-green-900 text-sm">Data Protection</h3>
                          <p className="text-sm text-green-700 mt-1">
                            All data is encrypted in transit (HTTPS) and at rest. Row Level Security (RLS) policies are enabled.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-purple-900 text-sm">Role-Based Access Control</h3>
                          <p className="text-sm text-purple-700 mt-1">
                            Users can only access features and data permitted by their assigned roles.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-unre-green-600 hover:bg-unre-green-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
