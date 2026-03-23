import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { KnowledgeEngineProvider } from "@/context/KnowledgeEngineContext";
import { PasswordGate } from "@/components/password-gate";

import Dashboard from "@/pages/dashboard";
import KnowledgeEngine from "@/pages/knowledge-engine";
import Jobs from "@/pages/jobs";
import AITailor from "@/pages/ai-tailor";
import ApplyAgent from "@/pages/apply-agent";
import Tracker from "@/pages/tracker";
import Outreach from "@/pages/outreach";
import Insights from "@/pages/insights";
import Settings from "@/pages/settings";
import ResumeTemplates from "@/pages/resume-templates";
import ResumeEditor from "@/pages/resume-editor";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between gap-4 border-b border-border px-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-screen-2xl">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppRouter() {
  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/knowledge" component={KnowledgeEngine} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/tailor" component={AITailor} />
        <Route path="/resume-templates" component={ResumeTemplates} />
        <Route path="/resume-editor" component={ResumeEditor} />
        <Route path="/apply" component={ApplyAgent} />
        <Route path="/tracker" component={Tracker} />
        <Route path="/outreach" component={Outreach} />
        <Route path="/insights" component={Insights} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="jobsherpa-theme">
        <KnowledgeEngineProvider>
          <TooltipProvider>
            <Toaster />
            <PasswordGate>
              <Switch>
                <Route path="/" component={Landing} />
                <Route>
                  <AppRouter />
                </Route>
              </Switch>
            </PasswordGate>
          </TooltipProvider>
        </KnowledgeEngineProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
