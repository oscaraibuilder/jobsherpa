import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function Outreach() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">Outreach</h1>
        <p className="text-muted-foreground">Manage your professional networking and outreach</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>Your networking command center</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The Outreach feature will help you craft personalized connection requests, 
            follow-up emails, and thank you notes. AI-powered templates and 
            scheduling to maximize your networking effectiveness.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
