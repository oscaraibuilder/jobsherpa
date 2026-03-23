import { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HOW_TO_BANNER_KEY = "ke-has-dismissed-how-to-banner";

export function HowToBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(HOW_TO_BANNER_KEY) === "true";
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    localStorage.setItem(HOW_TO_BANNER_KEY, "true");
    setVisible(false);
  };

  return (
    <Card 
      className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 border-blue-200/50 dark:border-blue-800/50"
      data-testid="banner-how-to"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-sm">Next steps to build your career companion</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            You're connected to LinkedIn. To unlock auto-fill, export your LinkedIn profile as a PDF and upload it.
          </p>
          <ol className="list-decimal list-inside text-sm space-y-1 mb-3 text-muted-foreground">
            <li>Go to your LinkedIn profile.</li>
            <li>In the "More" / "Resources" menu, click <strong className="text-foreground">Save to PDF</strong>.</li>
            <li>Upload that PDF in <strong className="text-foreground">Documents & Links</strong> so we can auto-fill your profile, work history, and skills.</li>
          </ol>
          <p className="text-xs text-muted-foreground">
            We'll parse your resume/LinkedIn PDF and update modules like Profile Snapshot, Work History, and Skills & Tools.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          aria-label="Dismiss instructions"
          className="text-muted-foreground shrink-0"
          data-testid="button-dismiss-banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
