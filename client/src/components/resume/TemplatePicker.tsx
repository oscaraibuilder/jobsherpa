import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { RESUME_TEMPLATES, type ResumeTemplateKey, type ResumeData, getDefaultResumeData } from "@/types/resume";
import { ClassicSidebarTemplate, ModernTechTemplate, CorporateFinanceTemplate, ClinicalAcademicTemplate } from "./templates";

interface TemplatePickerProps {
  selectedTemplate: ResumeTemplateKey;
  onSelect: (templateKey: ResumeTemplateKey) => void;
}

function MiniTemplatePreview({ templateKey }: { templateKey: ResumeTemplateKey }) {
  const sampleData: ResumeData = {
    ...getDefaultResumeData(templateKey),
    contact: {
      fullName: "Alex Johnson",
      headline: "Senior Product Manager",
      email: "alex@example.com",
      phone: "(555) 123-4567",
      location: "San Francisco, CA",
      linkedInUrl: "linkedin.com/in/alexjohnson",
    },
    summary: "Results-driven product manager with 8+ years of experience building world-class digital products.",
    experiences: [
      {
        id: "1",
        jobTitle: "Senior Product Manager",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        startDate: "2020",
        endDate: "Present",
        bullets: [
          "Led cross-functional team of 12 to deliver flagship product",
          "Increased user engagement by 45% through data-driven optimization",
        ],
      },
      {
        id: "2",
        jobTitle: "Product Manager",
        company: "StartupXYZ",
        location: "New York, NY",
        startDate: "2017",
        endDate: "2020",
        bullets: [
          "Launched 3 new product lines generating $2M ARR",
        ],
      },
    ],
    education: [
      {
        id: "1",
        degree: "MBA, Business Administration",
        institution: "Stanford Graduate School of Business",
        endDate: "2017",
      },
    ],
    skillGroups: [
      { label: "Technical", items: ["SQL", "Python", "Figma", "Jira"] },
      { label: "Domain", items: ["Product Strategy", "Agile", "User Research"] },
    ],
    highlights: [
      {
        title: "Key Achievements",
        bullets: [
          "Grew product revenue from $5M to $15M",
          "Led successful Series B fundraising",
        ],
      },
    ],
    coursesOrCerts: [
      { title: "Certified Scrum Product Owner" },
    ],
  };

  const getTemplate = () => {
    switch (templateKey) {
      case "classic-sidebar":
        return <ClassicSidebarTemplate data={sampleData} />;
      case "modern-tech":
        return <ModernTechTemplate data={sampleData} />;
      case "corporate-finance":
        return <CorporateFinanceTemplate data={sampleData} />;
      case "clinical-academic":
        return <ClinicalAcademicTemplate data={sampleData} />;
    }
  };

  return (
    <div className="w-full aspect-[816/1056] bg-white rounded-md overflow-hidden shadow-sm">
      <div className="w-[816px] h-[1056px] origin-top-left scale-[0.185] pointer-events-none">
        {getTemplate()}
      </div>
    </div>
  );
}

export function TemplatePicker({ selectedTemplate, onSelect }: TemplatePickerProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {RESUME_TEMPLATES.map((template) => {
        const isSelected = selectedTemplate === template.key;
        return (
          <Card
            key={template.key}
            className={`group relative cursor-pointer transition-all overflow-visible ${
              isSelected
                ? "ring-2 ring-primary"
                : "hover-elevate"
            }`}
            onClick={() => onSelect(template.key)}
            data-testid={`template-card-${template.key}`}
          >
            <CardContent className="p-3">
              <div className="relative mb-3">
                <MiniTemplatePreview templateKey={template.key} />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm text-foreground">{template.name}</h3>
                  <Badge variant="secondary" className="text-[10px] no-default-active-elevate">
                    {template.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
