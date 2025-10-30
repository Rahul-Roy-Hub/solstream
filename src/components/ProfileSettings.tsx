"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { editProfileAction, fetchProfileAction } from "@/actions/userActions";
import { 
  ArrowLeft, 
  Cpu, 
  User, 
  Mail, 
  Key, 
  Shield, 
  Bell, 
  CreditCard, 
  Globe, 
  Save,
  Eye,
  EyeOff,
  Copy,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

type Profile = {
  _id: string;
  userId: string;
  email: string;
  username: string;
  cryptId: string;
};

export default function ProfileSettings({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCryptId, setShowCryptId] = useState(false);
  const [copied, setCopied] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [updating2FA, setUpdating2FA] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetchProfileAction(userId);
        console.log(res);
        if (!res.success) throw new Error("Failed to load profile");
        const data = res.profile;
        setProfile(data);
      } catch {
        toast.error("Failed to fetch profile");
      }
    }
    loadProfile();
  }, [userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const res = await editProfileAction(profile.userId, {
        username: profile.username,
        cryptId: profile.cryptId,
      });

      if (!res.success) throw new Error("Update failed");

      const updated = res.profile;
      setProfile(updated);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleToggle2FA = async () => {
    setUpdating2FA(true);
    try {
      // Simulate API call for 2FA toggle
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(twoFactorEnabled ? "Two-Factor Authentication disabled" : "Two-Factor Authentication enabled");
    } catch {
      toast.error("Failed to update Two-Factor Authentication");
    } finally {
      setUpdating2FA(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-6">
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-foreground font-medium">Settings</span>
              </div>
            </div>

            {/* Title Section */}
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Cpu className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Settings
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage your account and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <User className="h-6 w-6 mr-3 text-primary" />
                  Profile Information
                </CardTitle>
                <p className="text-muted-foreground">Update your personal information and account details</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Address
                      </Label>
                      <Input 
                        id="email" 
                        value={profile.email} 
                        disabled 
                        className="cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="font-medium flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) =>
                          setProfile((p) => p && { ...p, username: e.target.value })
                        }
                        placeholder="Enter your username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cryptId" className="font-medium flex items-center">
                        <Key className="h-4 w-4 mr-2" />
                        Crypt ID
                      </Label>
                      <div className="relative">
                        <Input
                          id="cryptId"
                          type={showCryptId ? "text" : "password"}
                          value={profile.cryptId}
                          onChange={(e) =>
                            setProfile((p) => p && { ...p, cryptId: e.target.value })
                          }
                          className="pr-20 font-mono"
                          placeholder="Enter your Crypt ID"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCryptId(!showCryptId)}
                            className="h-8 w-8 p-0"
                          >
                            {showCryptId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(profile.cryptId)}
                            className="h-8 w-8 p-0"
                          >
                            {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Your unique identifier for crypto transactions</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Shield className="h-6 w-6 mr-3 text-muted-foreground" />
                  Security Settings
                </CardTitle>
                <p className="text-muted-foreground">Manage your account security and privacy</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-medium">Two-Factor Authentication</h3>
                      <p className="text-muted-foreground text-sm">
                        {twoFactorEnabled ? 'Add an extra layer of security' : 'Enable for enhanced security'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={twoFactorEnabled ? "bg-green-500/20 text-green-600 border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30" : ""}>
                      {twoFactorEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      {updating2FA && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      )}
                      <button
                        onClick={handleToggle2FA}
                        disabled={updating2FA}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          twoFactorEnabled ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                      <Key className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-medium">API Keys</h3>
                      <p className="text-muted-foreground text-sm">Manage your API access keys</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Account Type</span>
                  <Badge>
                    Pro
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-500 text-sm">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="text-foreground text-sm">2024</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Methods
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Language & Region
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Having trouble with your account? We&apos;re here to help.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}