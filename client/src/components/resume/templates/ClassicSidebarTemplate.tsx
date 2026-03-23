import type { ResumeData } from "@/types/resume";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

interface Props {
  data: ResumeData;
}

export function ClassicSidebarTemplate({ data }: Props) {
  const { contact, summary, experiences, education, skillGroups, highlights, coursesOrCerts } = data;

  return (
    <div className="w-[816px] h-[1056px] bg-white text-gray-800 flex overflow-hidden font-sans text-[11px] leading-tight">
      <div className="w-[70%] p-8 pr-6 flex flex-col">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {contact.fullName || "Your Name"}
          </h1>
          {contact.headline && (
            <p className="text-sm text-gray-600 mt-1">{contact.headline}</p>
          )}
        </header>

        {summary && (
          <section className="mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1 mb-2">
              Summary
            </h2>
            <p className="text-gray-700">{summary}</p>
          </section>
        )}

        {experiences.length > 0 && (
          <section className="mb-4 flex-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1 mb-2">
              Experience
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
                          <span className="mr-1.5 text-gray-400">•</span>
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

        {education.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1 mb-2">
              Education
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
                        <li key={idx} className="flex">
                          <span className="mr-1.5 text-gray-400">•</span>
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
      </div>

      <aside className="w-[30%] bg-slate-700 text-white p-6 flex flex-col">
        <section className="mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Contact
          </h2>
          <div className="space-y-1.5 text-[10px]">
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-slate-400" />
                <span className="break-all">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{contact.location}</span>
              </div>
            )}
            {contact.linkedInUrl && (
              <div className="flex items-center gap-2">
                <Linkedin className="w-3 h-3 text-slate-400" />
                <span className="break-all">{contact.linkedInUrl.replace("https://", "").replace("www.", "")}</span>
              </div>
            )}
            {contact.websiteUrl && (
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-slate-400" />
                <span className="break-all">{contact.websiteUrl.replace("https://", "").replace("www.", "")}</span>
              </div>
            )}
          </div>
        </section>

        {highlights.length > 0 && (
          <section className="mb-5">
            {highlights.map((section, idx) => (
              <div key={idx} className="mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  {section.title}
                </h2>
                <ul className="space-y-1">
                  {section.bullets.map((bullet, bulletIdx) => (
                    <li key={bulletIdx} className="flex text-[10px]">
                      <span className="mr-1.5 text-slate-400">•</span>
                      <span className="text-slate-100">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {skillGroups.length > 0 && (
          <section className="mb-5 flex-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Skills
            </h2>
            <div className="space-y-2">
              {skillGroups.map((group, idx) => (
                <div key={idx}>
                  <h3 className="text-[10px] font-medium text-slate-300 mb-0.5">{group.label}</h3>
                  <div className="flex flex-wrap gap-1">
                    {group.items.map((skill, skillIdx) => (
                      <span
                        key={skillIdx}
                        className="bg-slate-600 text-slate-100 px-1.5 py-0.5 rounded text-[9px]"
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
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Certifications
            </h2>
            <div className="space-y-1 text-[10px]">
              {coursesOrCerts.map((cert, idx) => (
                <div key={idx}>
                  <p className="font-medium text-slate-100">{cert.title}</p>
                  {cert.subtitle && <p className="text-slate-400">{cert.subtitle}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}
