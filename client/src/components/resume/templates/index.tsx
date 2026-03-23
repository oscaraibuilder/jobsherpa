import type { ResumeData, ResumeTemplateKey } from "@/types/resume";
import { ClassicSidebarTemplate } from "./ClassicSidebarTemplate";
import { ModernTechTemplate } from "./ModernTechTemplate";
import { CorporateFinanceTemplate } from "./CorporateFinanceTemplate";
import { ClinicalAcademicTemplate } from "./ClinicalAcademicTemplate";

export { ClassicSidebarTemplate } from "./ClassicSidebarTemplate";
export { ModernTechTemplate } from "./ModernTechTemplate";
export { CorporateFinanceTemplate } from "./CorporateFinanceTemplate";
export { ClinicalAcademicTemplate } from "./ClinicalAcademicTemplate";

interface TemplateProps {
  data: ResumeData;
}

type TemplateComponent = (props: TemplateProps) => JSX.Element;

const templateMap: Record<ResumeTemplateKey, TemplateComponent> = {
  "classic-sidebar": ClassicSidebarTemplate,
  "modern-tech": ModernTechTemplate,
  "corporate-finance": CorporateFinanceTemplate,
  "clinical-academic": ClinicalAcademicTemplate,
};

export function renderResumeTemplate(data: ResumeData): JSX.Element {
  const Template = templateMap[data.templateKey] || ClassicSidebarTemplate;
  return <Template data={data} />;
}

export function getTemplateComponent(templateKey: ResumeTemplateKey): TemplateComponent {
  return templateMap[templateKey] || ClassicSidebarTemplate;
}
