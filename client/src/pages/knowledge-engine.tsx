import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileUp,
  Pencil,
  Briefcase,
  Settings,
  Target,
  User,
  Linkedin,
  RefreshCw,
  Link2Off,
  CheckCircle2,
  Circle,
  Loader2,
  Hammer,
  FileUser,
} from "lucide-react";
import { useKnowledgeEngine } from "@/context/KnowledgeEngineContext";
import { getModuleStatus, calculateProfileCompleteness, type ModuleId } from "@/types/knowledgeEngine";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { IdentityForm } from "@/components/knowledge/IdentityForm";
import { WorkHistoryForm } from "@/components/knowledge/WorkHistoryForm";
import { SkillsForm } from "@/components/knowledge/SkillsForm";
import { GoalsForm } from "@/components/knowledge/GoalsForm";
import { PreferencesForm } from "@/components/knowledge/PreferencesForm";
import { DocumentsForm } from "@/components/knowledge/DocumentsForm";
import { InstructionsForm } from "@/components/knowledge/InstructionsForm";
import { BaseResumeForm } from "@/components/knowledge/BaseResumeForm";
import { HowToBanner } from "@/components/knowledge/HowToBanner";

interface ModuleCardData {
  id: ModuleId;
  title: string;
  subtitle: string;
  icon: typeof FileUp;
}

const moduleCards: ModuleCardData[] = [
  {
    id: "baseResume",
    title: "Base Resume",
    subtitle: "Your starting point for tailored resumes",
    icon: FileUser,
  },
  {
    id: "identity",
    title: "Profile Snapshot",
    subtitle: "Name, headline, location, work authorization",
    icon: User,
  },
  {
    id: "workHistory",
    title: "Work History",
    subtitle: "Roles, companies, and quantifiable impact",
    icon: Briefcase,
  },
  {
    id: "skills",
    title: "Skills & Tools",
    subtitle: "Technical, tools, domain, and soft skills",
    icon: Hammer,
  },
  {
    id: "goals",
    title: "Career Goals",
    subtitle: "Target roles, industries, and time horizon",
    icon: Target,
  },
  {
    id: "preferences",
    title: "Preferences",
    subtitle: "Salary, location, and non-negotiables",
    icon: Settings,
  },
  {
    id: "documents",
    title: "Documents & Links",
    subtitle: "Base resume, portfolio, writing samples",
    icon: FileUp,
  },
  {
    id: "instructions",
    title: "Custom Instructions",
    subtitle: "How JobSherpa writes for you",
    icon: Pencil,
  },
];

function StatusBadge({ status }: { status: "not_started" | "in_progress" | "complete" }) {
  if (status === "complete") {
    return (
      <Badge variant="default" className="bg-green-600 dark:bg-green-700 text-white gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Complete
      </Badge>
    );
  }
  if (status === "in_progress") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Circle className="h-3 w-3" />
        In Progress
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <Circle className="h-3 w-3" />
      Not Started
    </Badge>
  );
}

export default function KnowledgeEngine() {
  const { state, updateState, isInitialized, setLinkedInUser, disconnectLinkedIn, refreshLinkedIn } = useKnowledgeEngine();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);

  const linkedIn = state.linkedInProfile;
  const completeness = calculateProfileCompleteness(state);

  useEffect(() => {
    if (!isInitialized) return;
    
    const initAndFetch = async () => {
      // Initialize session on page load to ensure we have a consistent session
      try {
        await fetch("/api/auth/init-session", { 
          method: "POST", 
          credentials: "include" 
        });
      } catch (error) {
        console.error("Failed to initialize session:", error);
      }
      
      // Then fetch LinkedIn user if already authenticated
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setLinkedInUser(data.user);
          }
        }
      } catch (error) {
        console.error("Failed to fetch LinkedIn user:", error);
      }
    };
    initAndFetch();
  }, [isInitialized, setLinkedInUser]);

  const handleLinkedInConnect = async () => {
    setIsConnecting(true);
    
    // Initialize session BEFORE opening popup to ensure both windows share the same session
    try {
      await fetch("/api/auth/init-session", { 
        method: "POST", 
        credentials: "include" 
      });
    } catch (error) {
      console.error("Failed to initialize session:", error);
    }
    
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      "/api/auth/linkedin",
      "linkedin-auth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );
    
    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup);
        setIsConnecting(false);
        const fetchUser = async () => {
          try {
            const res = await fetch("/api/auth/me", { credentials: "include" });
            if (res.ok) {
              const data = await res.json();
              if (data.user) {
                setLinkedInUser(data.user);
              }
            }
          } catch (error) {
            console.error("Failed to fetch LinkedIn user:", error);
          }
        };
        fetchUser();
      }
    }, 500);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshLinkedIn();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleModuleClick = (moduleId: ModuleId) => {
    setActiveModule(moduleId);
  };

  const closeModal = () => {
    setActiveModule(null);
  };

  const getModalTitle = (moduleId: ModuleId): string => {
    const titles: Record<ModuleId, string> = {
      baseResume: "Base Resume",
      identity: "Profile Snapshot",
      workHistory: "Work History & Achievements",
      skills: "Skills & Tools",
      goals: "Career Goals",
      preferences: "Preferences & Constraints",
      documents: "Documents & Links",
      instructions: "Custom Instructions",
    };
    return titles[moduleId];
  };

  const getModalDescription = (moduleId: ModuleId): string => {
    const descriptions: Record<ModuleId, string> = {
      baseResume: "Your starting point for tailored resumes",
      identity: "Your basic profile information",
      workHistory: "Your work experience and key achievements",
      skills: "Technical skills, tools, and competencies",
      goals: "Your career aspirations and target roles",
      preferences: "Work preferences and requirements",
      documents: "Upload documents and add portfolio links",
      instructions: "Customize how JobSherpa writes for you",
    };
    return descriptions[moduleId];
  };

  const openIdentityModal = () => {
    setActiveModule("identity");
  };

  const renderModalContent = () => {
    switch (activeModule) {
      case "baseResume":
        return <BaseResumeForm onClose={closeModal} onOpenIdentity={openIdentityModal} />;
      case "identity":
        return <IdentityForm onClose={closeModal} />;
      case "workHistory":
        return <WorkHistoryForm onClose={closeModal} />;
      case "skills":
        return <SkillsForm onClose={closeModal} />;
      case "goals":
        return <GoalsForm onClose={closeModal} />;
      case "preferences":
        return <PreferencesForm onClose={closeModal} />;
      case "documents":
        return <DocumentsForm onClose={closeModal} />;
      case "instructions":
        return <InstructionsForm onClose={closeModal} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">
          Knowledge Engine
        </h1>
        <p className="text-muted-foreground">
          Let's build your personal career companion
        </p>
      </div>

      {linkedIn && <HowToBanner />}

      <Card className="overflow-visible">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2]/10 shrink-0">
                <Linkedin className="h-5 w-5 text-[#0A66C2]" />
              </div>
              {linkedIn ? (
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                    <AvatarImage src={linkedIn.picture || ""} />
                    <AvatarFallback className="text-lg">{(linkedIn.name || "U").split(' ').filter(n => n).map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-semibold" data-testid="text-linkedin-name">{linkedIn.name || "LinkedIn User"}</p>
                      <Badge variant="secondary" className="bg-[#0A66C2]/10 text-[#0A66C2] text-xs">
                        Connected via LinkedIn
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid="text-linkedin-email">
                      {linkedIn.email || ""}
                    </p>
                    <div className="text-xs text-muted-foreground mt-0.5" data-testid="text-linkedin-meta">
                      {linkedIn.locale && typeof linkedIn.locale === 'object' && linkedIn.locale.language && (
                        <span>{linkedIn.locale.language.toUpperCase()}{linkedIn.locale.country ? `-${linkedIn.locale.country}` : ''} &bull; </span>
                      )}
                      <span>Last synced: {linkedIn.lastSynced}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-sm">Sign in with LinkedIn</p>
                  <p className="text-xs text-muted-foreground">Fetches your name, picture, and email</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {linkedIn ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    data-testid="button-refresh-linkedin"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={disconnectLinkedIn}
                    className="text-muted-foreground"
                    data-testid="button-disconnect-linkedin"
                  >
                    <Link2Off className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleLinkedInConnect}
                  disabled={isConnecting}
                  className="bg-[#0A66C2]"
                  data-testid="button-connect-linkedin"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Linkedin className="h-4 w-4 mr-2" />
                      Sign in with LinkedIn
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4 flex-wrap">
        <span className="text-sm text-muted-foreground" data-testid="text-completeness">
          {completeness.completed} of {completeness.total} modules complete
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {moduleCards.map((module) => {
          const status = getModuleStatus(state, module.id);
          const IconComponent = module.icon;
          
          return (
            <Card 
              key={module.id}
              className="hover-elevate active-elevate-2 cursor-pointer overflow-visible"
              onClick={() => handleModuleClick(module.id)}
              data-testid={`card-module-${module.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium" data-testid={`text-module-title-${module.id}`}>
                        {module.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {module.subtitle}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={status} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={activeModule !== null} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {activeModule && (
            <>
              <DialogHeader>
                <DialogTitle data-testid="text-modal-title">{getModalTitle(activeModule)}</DialogTitle>
                <DialogDescription data-testid="text-modal-description">{getModalDescription(activeModule)}</DialogDescription>
              </DialogHeader>
              {renderModalContent()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
