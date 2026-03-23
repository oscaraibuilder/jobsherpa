import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ArrowRight, Sparkles } from "lucide-react";
import { RESUME_TEMPLATES, type ResumeTemplateKey, type ResumeTemplateInfo } from "@/types/resume";
import { getTemplateList, type TemplateInfo } from "@/utils/templateRenderer";

export default function ResumeTemplates() {
  const [, setLocation] = useLocation();
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredTemplate, setHoveredTemplate] = useState<ResumeTemplateKey | null>(null);

  useEffect(() => {
    async function loadThumbnails() {
      try {
        const templateList = await getTemplateList();
        const thumbMap: Record<string, string> = {};
        templateList.forEach((t: TemplateInfo) => {
          thumbMap[t.id] = t.thumbnail;
        });
        setThumbnails(thumbMap);
      } catch (error) {
        console.error("Failed to load template thumbnails:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadThumbnails();
  }, []);

  const handleSelectTemplate = (templateKey: ResumeTemplateKey) => {
    setLocation(`/resume-editor?template=${templateKey}`);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resume Templates</h1>
            <p className="text-muted-foreground">
              Choose a template that best represents your professional style
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESUME_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.key}
            template={template}
            thumbnail={thumbnails[template.key]}
            isLoading={isLoading}
            isHovered={hoveredTemplate === template.key}
            onHover={() => setHoveredTemplate(template.key)}
            onLeave={() => setHoveredTemplate(null)}
            onSelect={() => handleSelectTemplate(template.key)}
          />
        ))}
      </div>

      <div className="p-6 rounded-lg border bg-muted/30">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">AI-Powered Resume Building</h3>
            <p className="text-sm text-muted-foreground">
              After selecting a template, you can use our AI tools to rewrite sections, 
              optimize for ATS, and tailor your resume to specific job descriptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: ResumeTemplateInfo;
  thumbnail?: string;
  isLoading: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}

function TemplateCard({
  template,
  thumbnail,
  isLoading,
  isHovered,
  onHover,
  onLeave,
  onSelect,
}: TemplateCardProps) {
  return (
    <Card
      className={`overflow-visible group transition-all duration-200 cursor-pointer ${
        isHovered ? "ring-2 ring-primary shadow-lg" : "hover-elevate"
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Select ${template.name} template`}
      data-testid={`template-card-${template.key}`}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[8.5/11] bg-gradient-to-br from-muted to-muted/50 overflow-hidden rounded-t-lg">
          {isLoading ? (
            <Skeleton className="absolute inset-0" />
          ) : thumbnail ? (
            <img
              src={thumbnail}
              alt={`${template.name} template preview`}
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="w-16 h-16 text-muted-foreground/20" />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg">{template.name}</h3>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {template.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
          <Button 
            className="w-full"
            data-testid={`button-use-template-${template.key}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            Use this template
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
