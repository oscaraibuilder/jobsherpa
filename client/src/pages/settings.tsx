import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Bell,
  Palette,
  Download,
  Trash2,
  CheckCircle,
  Link2,
  Calendar,
  Globe,
  CreditCard,
  Shield,
  Beaker,
  LogOut,
  ExternalLink,
  HardDrive,
  Cloud,
} from "lucide-react";
import { SiGoogle, SiLinkedin, SiDropbox } from "react-icons/si";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";

type ConnectionStatus = {
  gmail: boolean;
  outlook: boolean;
  googleCalendar: boolean;
  outlookCalendar: boolean;
  linkedin: boolean;
  googleDrive: boolean;
  dropbox: boolean;
};

type NotificationSettings = {
  applicationUpdates: boolean;
  interviewReminders: boolean;
  newJobMatches: boolean;
  applyAgentActivity: boolean;
  autoDetectStatus: boolean;
  autoCaptureInterviews: boolean;
};

type AppSettings = {
  density: "comfortable" | "compact";
  timezone: string;
  betaFeatures: boolean;
};

const TIMEZONES = [
  { value: "auto", label: "Auto-detect (recommended)" },
  { value: "America/New_York", label: "America/New_York (EST)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
  { value: "America/Chicago", label: "America/Chicago (CST)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
];

function ProfileSection() {
  const { user, isLoading } = useAuth();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile & Account
        </CardTitle>
        <CardDescription>
          Your core account details are managed through your Replit profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={user?.profileImageUrl || undefined}
                  alt={user?.firstName || "User"}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold" data-testid="text-user-name">
                  {user?.firstName
                    ? `${user.firstName} ${user.lastName || ""}`.trim()
                    : "User"}
                </p>
                <p className="text-sm text-muted-foreground" data-testid="text-user-email">
                  {user?.email || ""}
                </p>
                <Badge variant="secondary" className="mt-2" data-testid="badge-plan">
                  Free Plan
                </Badge>
              </div>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          To update your name, email, or password, visit your Replit account settings.
        </p>

        <Separator />

        <div className="flex flex-wrap gap-3 justify-end">
          <a href="/api/logout">
            <Button variant="outline" data-testid="button-sign-out">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </a>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            data-testid="button-delete-account"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-right">
          Deleting your account will permanently remove your JobSherpa data.
        </p>
      </CardContent>
    </Card>
  );
}

interface ConnectionTileProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  connected: boolean;
  onToggle: () => void;
}

function ConnectionTile({ icon, name, description, connected, onToggle }: ConnectionTileProps) {
  return (
    <div className="flex flex-col h-full rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>
          <div>
            <p className="font-medium">{name}</p>
            <Badge
              variant={connected ? "default" : "secondary"}
              className="mt-1"
              data-testid={`badge-${name.toLowerCase().replace(/\s+/g, "-")}-status`}
            >
              {connected ? "Connected" : "Not connected"}
            </Badge>
          </div>
        </div>
      </div>
      <p className="flex-1 text-sm text-muted-foreground mt-3">{description}</p>
      <Button
        variant={connected ? "outline" : "default"}
        size="sm"
        onClick={onToggle}
        className="mt-3"
        data-testid={`button-${name.toLowerCase().replace(/\s+/g, "-")}-${connected ? "manage" : "connect"}`}
      >
        {connected ? "Manage" : "Connect"}
      </Button>
    </div>
  );
}

interface ConnectionsSectionProps {
  connections: ConnectionStatus;
  onToggleConnection: (key: keyof ConnectionStatus) => void;
  notifications: NotificationSettings;
  onToggleNotification: (key: keyof NotificationSettings) => void;
}

function ConnectionsSection({
  connections,
  onToggleConnection,
  notifications,
  onToggleNotification,
}: ConnectionsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Connections
        </CardTitle>
        <CardDescription>
          Connect your inbox and calendar so JobSherpa can track applications and interviews.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <ConnectionTile
            icon={<SiGoogle className="h-5 w-5" />}
            name="Gmail"
            description="Use Gmail to detect application confirmations and recruiter emails."
            connected={connections.gmail}
            onToggle={() => onToggleConnection("gmail")}
          />
          <ConnectionTile
            icon={<Mail className="h-5 w-5" />}
            name="Outlook"
            description="Use Outlook to track responses from employers."
            connected={connections.outlook}
            onToggle={() => onToggleConnection("outlook")}
          />
          <ConnectionTile
            icon={<Calendar className="h-5 w-5 text-blue-500" />}
            name="Google Calendar"
            description="Sync interviews and reminders to your Google Calendar."
            connected={connections.googleCalendar}
            onToggle={() => onToggleConnection("googleCalendar")}
          />
          <ConnectionTile
            icon={<Calendar className="h-5 w-5 text-sky-600" />}
            name="Outlook Calendar"
            description="Sync interviews to your Outlook calendar."
            connected={connections.outlookCalendar}
            onToggle={() => onToggleConnection("outlookCalendar")}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="auto-detect-status">Auto-detect application status from email</Label>
              <p className="text-sm text-muted-foreground">
                Automatically update application status based on email content.
              </p>
            </div>
            <Switch
              id="auto-detect-status"
              checked={notifications.autoDetectStatus}
              onCheckedChange={() => onToggleNotification("autoDetectStatus")}
              data-testid="switch-auto-detect-status"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="auto-capture-interviews">Auto-capture interview invites from calendar</Label>
              <p className="text-sm text-muted-foreground">
                Automatically add interview events to your tracker.
              </p>
            </div>
            <Switch
              id="auto-capture-interviews"
              checked={notifications.autoCaptureInterviews}
              onCheckedChange={() => onToggleNotification("autoCaptureInterviews")}
              data-testid="switch-auto-capture-interviews"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface NotificationsSectionProps {
  notifications: NotificationSettings;
  onToggle: (key: keyof NotificationSettings) => void;
}

function NotificationsSection({ notifications, onToggle }: NotificationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Control how often JobSherpa contacts you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="application-updates">Application updates</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when an application moves to a new stage.
            </p>
          </div>
          <Switch
            id="application-updates"
            checked={notifications.applicationUpdates}
            onCheckedChange={() => onToggle("applicationUpdates")}
            data-testid="switch-application-updates"
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="interview-reminders">Interview reminders</Label>
            <p className="text-sm text-muted-foreground">
              Remind me 24 hours before any scheduled interview.
            </p>
          </div>
          <Switch
            id="interview-reminders"
            checked={notifications.interviewReminders}
            onCheckedChange={() => onToggle("interviewReminders")}
            data-testid="switch-interview-reminders"
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="new-job-matches">New job matches</Label>
            <p className="text-sm text-muted-foreground">
              Email me when strong new matches are found.
            </p>
          </div>
          <Switch
            id="new-job-matches"
            checked={notifications.newJobMatches}
            onCheckedChange={() => onToggle("newJobMatches")}
            data-testid="switch-new-job-matches"
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="apply-agent-activity">Apply Agent activity</Label>
            <p className="text-sm text-muted-foreground">
              Get a summary when the Apply Agent submits applications on your behalf.
            </p>
          </div>
          <Switch
            id="apply-agent-activity"
            checked={notifications.applyAgentActivity}
            onCheckedChange={() => onToggle("applyAgentActivity")}
            data-testid="switch-apply-agent-activity"
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface AppearanceRegionSectionProps {
  settings: AppSettings;
  onDensityChange: (value: "comfortable" | "compact") => void;
  onTimezoneChange: (value: string) => void;
}

function AppearanceRegionSection({
  settings,
  onDensityChange,
  onTimezoneChange,
}: AppearanceRegionSectionProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Appearance & Region
        </CardTitle>
        <CardDescription>
          Customize how JobSherpa looks and how times are displayed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Theme</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-2 rounded-lg border p-4 hover-elevate active-elevate-2 ${
                theme === "light" ? "border-primary bg-primary/5" : "border-border"
              }`}
              data-testid="button-theme-light"
            >
              <div className="h-10 w-10 rounded-lg bg-white border border-border" />
              <span className="text-sm font-medium">Light</span>
              {theme === "light" && (
                <CheckCircle className="h-4 w-4 text-primary" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-2 rounded-lg border p-4 hover-elevate active-elevate-2 ${
                theme === "dark" ? "border-primary bg-primary/5" : "border-border"
              }`}
              data-testid="button-theme-dark"
            >
              <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-700" />
              <span className="text-sm font-medium">Dark</span>
              {theme === "dark" && (
                <CheckCircle className="h-4 w-4 text-primary" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center gap-2 rounded-lg border p-4 hover-elevate active-elevate-2 ${
                theme === "system" ? "border-primary bg-primary/5" : "border-border"
              }`}
              data-testid="button-theme-system"
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-white to-zinc-900 border border-border" />
              <span className="text-sm font-medium">System</span>
              {theme === "system" && (
                <CheckCircle className="h-4 w-4 text-primary" />
              )}
            </button>
          </div>
        </div>

        <Separator />

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <Label>Density</Label>
            <Select value={settings.density} onValueChange={onDensityChange}>
              <SelectTrigger data-testid="select-density">
                <SelectValue placeholder="Select density" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">Comfortable (default)</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Time Zone
            </Label>
            <Select value={settings.timezone} onValueChange={onTimezoneChange}>
              <SelectTrigger data-testid="select-timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used for interview reminders and application timelines.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface IntegrationsSectionProps {
  connections: ConnectionStatus;
  onToggleConnection: (key: keyof ConnectionStatus) => void;
}

function IntegrationsSection({ connections, onToggleConnection }: IntegrationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Integrations
        </CardTitle>
        <CardDescription>
          Connect other tools you use in your job search.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <ConnectionTile
            icon={<SiLinkedin className="h-5 w-5 text-[#0A66C2]" />}
            name="LinkedIn"
            description="Use your LinkedIn profile to enrich your Knowledge Engine and profile page."
            connected={connections.linkedin}
            onToggle={() => onToggleConnection("linkedin")}
          />
          <ConnectionTile
            icon={<HardDrive className="h-5 w-5 text-yellow-500" />}
            name="Google Drive"
            description="Store and sync resumes and cover letters from Google Drive."
            connected={connections.googleDrive}
            onToggle={() => onToggleConnection("googleDrive")}
          />
          <ConnectionTile
            icon={<SiDropbox className="h-5 w-5 text-[#0061FF]" />}
            name="Dropbox"
            description="Sync documents from your Dropbox folder."
            connected={connections.dropbox}
            onToggle={() => onToggleConnection("dropbox")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function BillingSection() {
  const { toast } = useToast();

  const handleViewBillingHistory = () => {
    toast({
      title: "Coming soon",
      description: "Billing history will be available in a future update.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Billing
        </CardTitle>
        <CardDescription>
          Manage your JobSherpa plan and payments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" data-testid="badge-current-plan">Free Plan</Badge>
              <Badge variant="outline">Current</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              5 tailored resumes/month · Basic match scoring · Application tracker
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Tailored resumes used</span>
              <span className="font-medium">2 / 5</span>
            </div>
            <Progress value={40} className="h-2" data-testid="progress-resumes-used" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Apply Agent actions this month</span>
              <span className="font-medium">0 / 20</span>
            </div>
            <Progress value={0} className="h-2" data-testid="progress-agent-actions" />
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap gap-3">
          <Button data-testid="button-upgrade-to-pro">
            Upgrade to Pro
          </Button>
          <Button variant="outline" onClick={handleViewBillingHistory} data-testid="button-view-billing">
            View billing history
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DataPrivacySection() {
  const { toast } = useToast();

  const handleExport = (type: string) => {
    toast({
      title: "Export started",
      description: `Your ${type} export is being prepared. This feature is in demo mode.`,
    });
  };

  const handleClearHistory = () => {
    toast({
      title: "Coming soon",
      description: "Clear history will be available in a future update.",
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Data & Privacy
        </CardTitle>
        <CardDescription>
          Control how your data is stored and exported.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Exports</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => handleExport("resumes")}
                data-testid="button-export-resumes"
              >
                <Download className="h-4 w-4" />
                Export Resumes
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => handleExport("applications")}
                data-testid="button-export-applications"
              >
                <Download className="h-4 w-4" />
                Export Applications
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => handleExport("full profile")}
                data-testid="button-export-profile"
              >
                <Download className="h-4 w-4" />
                Export Full Profile
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Exports your data as a downloadable file for backup or portability.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Data Control</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                onClick={handleClearHistory}
                data-testid="button-clear-history"
              >
                <Trash2 className="h-4 w-4" />
                Clear Application History
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                data-testid="button-delete-account-data"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Deleting your account will permanently remove all your data.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LabsSectionProps {
  betaEnabled: boolean;
  onToggle: () => void;
}

function LabsSection({ betaEnabled, onToggle }: LabsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker className="h-5 w-5" />
          Labs
        </CardTitle>
        <CardDescription>
          Try experimental features before they're generally available.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="beta-features">Enable beta features</Label>
            <p className="text-sm text-muted-foreground">
              Turn on early previews like new match scoring and Apply Agent capabilities.
            </p>
          </div>
          <Switch
            id="beta-features"
            checked={betaEnabled}
            onCheckedChange={onToggle}
            data-testid="switch-beta-features"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const { toast } = useToast();

  const [connections, setConnections] = useState<ConnectionStatus>(() => {
    const saved = localStorage.getItem("jobsherpa-connections");
    return saved
      ? JSON.parse(saved)
      : {
          gmail: false,
          outlook: false,
          googleCalendar: false,
          outlookCalendar: false,
          linkedin: false,
          googleDrive: false,
          dropbox: false,
        };
  });

  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem("jobsherpa-notifications");
    return saved
      ? JSON.parse(saved)
      : {
          applicationUpdates: true,
          interviewReminders: true,
          newJobMatches: true,
          applyAgentActivity: false,
          autoDetectStatus: false,
          autoCaptureInterviews: false,
        };
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("jobsherpa-app-settings");
    return saved
      ? JSON.parse(saved)
      : {
          density: "comfortable",
          timezone: "auto",
          betaFeatures: false,
        };
  });

  useEffect(() => {
    localStorage.setItem("jobsherpa-connections", JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem("jobsherpa-notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("jobsherpa-app-settings", JSON.stringify(appSettings));
  }, [appSettings]);

  const handleToggleConnection = (key: keyof ConnectionStatus) => {
    setConnections((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      toast({
        title: newState[key] ? "Connected" : "Disconnected",
        description: `Connection saved (demo mode - no live OAuth yet).`,
      });
      return newState;
    });
  };

  const handleToggleNotification = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDensityChange = (value: "comfortable" | "compact") => {
    setAppSettings((prev) => ({ ...prev, density: value }));
  };

  const handleTimezoneChange = (value: string) => {
    setAppSettings((prev) => ({ ...prev, timezone: value }));
  };

  const handleBetaToggle = () => {
    setAppSettings((prev) => ({ ...prev, betaFeatures: !prev.betaFeatures }));
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl space-y-8 py-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-settings-title">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account, integrations, and preferences.
          </p>
        </div>

        <div className="space-y-6">
          <ProfileSection />

          <ConnectionsSection
            connections={connections}
            onToggleConnection={handleToggleConnection}
            notifications={notifications}
            onToggleNotification={handleToggleNotification}
          />

          <NotificationsSection
            notifications={notifications}
            onToggle={handleToggleNotification}
          />

          <AppearanceRegionSection
            settings={appSettings}
            onDensityChange={handleDensityChange}
            onTimezoneChange={handleTimezoneChange}
          />

          <IntegrationsSection
            connections={connections}
            onToggleConnection={handleToggleConnection}
          />

          <BillingSection />

          <DataPrivacySection />

          <LabsSection
            betaEnabled={appSettings.betaFeatures}
            onToggle={handleBetaToggle}
          />
        </div>
      </div>
    </div>
  );
}
