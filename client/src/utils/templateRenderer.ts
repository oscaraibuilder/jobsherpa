import Handlebars from "handlebars";
import type { ResumeData, ResumeTemplateKey } from "@/types/resume";

const templateCache: Map<ResumeTemplateKey, HandlebarsTemplateDelegate> = new Map();
const cssCache: Map<ResumeTemplateKey, string> = new Map();

export async function loadTemplate(templateKey: ResumeTemplateKey): Promise<string> {
  const response = await fetch(`/templates/${templateKey}/template.html`);
  if (!response.ok) {
    throw new Error(`Failed to load template: ${templateKey}`);
  }
  return response.text();
}

export async function loadTemplateCss(templateKey: ResumeTemplateKey): Promise<string> {
  if (cssCache.has(templateKey)) {
    return cssCache.get(templateKey)!;
  }
  
  const response = await fetch(`/templates/${templateKey}/style.css`);
  if (!response.ok) {
    throw new Error(`Failed to load CSS for template: ${templateKey}`);
  }
  const css = await response.text();
  cssCache.set(templateKey, css);
  return css;
}

export async function compileTemplate(
  templateKey: ResumeTemplateKey
): Promise<HandlebarsTemplateDelegate> {
  if (templateCache.has(templateKey)) {
    return templateCache.get(templateKey)!;
  }

  const templateHtml = await loadTemplate(templateKey);
  const compiled = Handlebars.compile(templateHtml);
  templateCache.set(templateKey, compiled);
  return compiled;
}

export async function renderTemplateHtml(
  templateKey: ResumeTemplateKey,
  data: ResumeData
): Promise<string> {
  const template = await compileTemplate(templateKey);
  return template(data);
}

export function getTemplateCssPath(templateKey: ResumeTemplateKey): string {
  return `/templates/${templateKey}/style.css`;
}

export async function renderFullResumeHtml(
  templateKey: ResumeTemplateKey,
  data: ResumeData
): Promise<string> {
  const [renderedContent, css] = await Promise.all([
    renderTemplateHtml(templateKey, data),
    loadTemplateCss(templateKey),
  ]);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resume - ${data.contact.fullName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${css}
  </style>
</head>
<body>
  ${renderedContent}
</body>
</html>
  `.trim();
}

export interface TemplateInfo {
  id: ResumeTemplateKey;
  name: string;
  thumbnail: string;
}

export async function getTemplateList(): Promise<TemplateInfo[]> {
  const response = await fetch("/templates/index.json");
  if (!response.ok) {
    throw new Error("Failed to load template list");
  }
  return response.json();
}

export function clearTemplateCache(): void {
  templateCache.clear();
  cssCache.clear();
}
