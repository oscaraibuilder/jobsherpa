import type { ResumeData } from "@/types/resume";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

interface Props {
  data: ResumeData;
}

export function ClinicalAcademicTemplate({ data }: Props) {
  const { contact, summary, experiences, education, skillGroups, highlights, coursesOrCerts, extraSections } = data;

  return (
    <div className="w-[816px] h-[1056px] bg-white text-gray-800 flex flex-col overflow-hidden font-sans text-[11px] leading-tight">
      <header className="px-8 pt-6 pb-4 bg-emerald-800 text-white">
        <h1 className="text-2xl font-bold tracking-tight">
          {contact.fullName || "Your Name"}
        </h1>
        {contact.headline && (
          <p className="text-sm text-emerald-100 mt-1">{contact.headline}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-emerald-200">
          {contact.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              <span>{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              <span>{contact.location}</span>
            </div>
          )}
          {contact.linkedInUrl && (
            <div className="flex items-center gap-1.5">
              <Linkedin className="w-3 h-3" />
              <span>{contact.linkedInUrl.replace("https://", "").replace("www.", "")}</span>
            </div>
          )}
          {contact.websiteUrl && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              <span>{contact.websiteUrl.replace("https://", "").replace("www.", "")}</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="w-[65%] p-6 pr-4 flex flex-col">
          {summary && (
            <section className="mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 border-b border-emerald-200 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-gray-700">{summary}</p>
            </section>
          )}

          {education.length > 0 && (
            <section className="mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 border-b border-emerald-200 pb-1 mb-2">
                Education & Training
              </h2>
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.institution}{edu.location ? ` | ${edu.location}` : ""}</p>
                      </div>
                      <span className="text-gray-500 text-[10px] whitespace-nowrap">
                        {edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : edu.endDate || edu.startDate}
                      </span>
                    </div>
                    {edu.details && edu.details.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {edu.details.map((detail, idx) => (
                          <li key={idx} className="flex text-[10px]">
                            <span className="mr-1.5 text-emerald-500">•</span>
                            <span className="text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {experiences.length > 0 && (
            <section className="flex-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 border-b border-emerald-200 pb-1 mb-2">
                Clinical & Research Experience
              </h2>
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.jobTitle}</h3>
                        <p className="text-gray-600">{exp.company}{exp.location ? ` | ${exp.location}` : ""}</p>
                      </div>
                      <span className="text-gray-500 text-[10px] whitespace-nowrap">
                        {exp.startDate} - {exp.endDate || "Present"}
                      </span>
                    </div>
                    {exp.bullets.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {exp.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex">
                            <span className="mr-1.5 text-emerald-500">•</span>
                            <span className="text-gray-700">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="w-[35%] bg-emerald-50 p-6 pl-4 flex flex-col border-l border-emerald-100">
          {highlights.length > 0 && (
            <section className="mb-4">
              {highlights.map((section, idx) => (
                <div key={idx} className="mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">
                    {section.title}
                  </h2>
                  <ul className="space-y-1">
                    {section.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="flex text-[10px]">
                        <span className="mr-1.5 text-emerald-500">•</span>
                        <span className="text-gray-700">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {skillGroups.length > 0 && (
            <section className="mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">
                Skills & Competencies
              </h2>
              <div className="space-y-2">
                {skillGroups.map((group, idx) => (
                  <div key={idx}>
                    <h3 className="text-[10px] font-medium text-emerald-600 mb-0.5">{group.label}</h3>
                    <div className="flex flex-wrap gap-1">
                      {group.items.map((skill, skillIdx) => (
                        <span
                          key={skillIdx}
                          className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[9px]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {coursesOrCerts && coursesOrCerts.length > 0 && (
            <section className="mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">
                Certifications & Licenses
              </h2>
              <div className="space-y-1.5 text-[10px]">
                {coursesOrCerts.map((cert, idx) => (
                  <div key={idx}>
                    <p className="font-medium text-gray-800">{cert.title}</p>
                    {cert.subtitle && <p className="text-gray-500">{cert.subtitle}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {extraSections && extraSections.length > 0 && (
            <section className="flex-1">
              {extraSections.map((section, idx) => (
                <div key={idx} className="mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">
                    {section.title}
                  </h2>
                  <ul className="space-y-1">
                    {section.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="flex text-[10px]">
                        <span className="mr-1.5 text-emerald-500">•</span>
                        <span className="text-gray-700">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
