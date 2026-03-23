import type { ResumeData } from "@/types/resume";
import { Mail, Phone, MapPin, Linkedin } from "lucide-react";

interface Props {
  data: ResumeData;
}

export function CorporateFinanceTemplate({ data }: Props) {
  const { contact, summary, experiences, education, skillGroups, highlights, coursesOrCerts } = data;

  return (
    <div className="w-[816px] h-[1056px] bg-white text-gray-800 flex flex-col overflow-hidden font-serif text-[11px] leading-tight">
      <header className="px-8 pt-6 pb-4 border-b-2 border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 text-center tracking-wide">
          {contact.fullName || "Your Name"}
        </h1>
        {contact.headline && (
          <p className="text-sm text-gray-600 text-center mt-1">{contact.headline}</p>
        )}
        <div className="flex justify-center items-center gap-4 mt-3 text-[10px] text-gray-600">
          {contact.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{contact.location}</span>
            </div>
          )}
          {contact.linkedInUrl && (
            <div className="flex items-center gap-1">
              <Linkedin className="w-3 h-3" />
              <span>{contact.linkedInUrl.replace("https://", "").replace("www.", "")}</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="w-[65%] p-6 pr-4 flex flex-col">
          {summary && (
            <section className="mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-gray-700 text-justify">{summary}</p>
            </section>
          )}

          {experiences.length > 0 && (
            <section className="mb-4 flex-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">
                Professional Experience
              </h2>
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{exp.jobTitle}</h3>
                        <p className="text-gray-600 italic">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                      </div>
                      <span className="text-gray-600 text-[10px] whitespace-nowrap">
                        {exp.startDate} - {exp.endDate || "Present"}
                      </span>
                    </div>
                    {exp.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {exp.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex">
                            <span className="mr-2 text-gray-500">-</span>
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
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">
                Education
              </h2>
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                        <p className="text-gray-600 italic">{edu.institution}{edu.location ? `, ${edu.location}` : ""}</p>
                      </div>
                      <span className="text-gray-600 text-[10px] whitespace-nowrap">
                        {edu.endDate || edu.startDate}
                      </span>
                    </div>
                    {edu.details && edu.details.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {edu.details.map((detail, idx) => (
                          <li key={idx} className="flex text-[10px]">
                            <span className="mr-2 text-gray-500">-</span>
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
        </main>

        <aside className="w-[35%] bg-gray-50 p-6 pl-4 flex flex-col border-l border-gray-200">
          {highlights.length > 0 && (
            <section className="mb-4">
              {highlights.map((section, idx) => (
                <div key={idx} className="mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
                    {section.title}
                  </h2>
                  <ul className="space-y-1">
                    {section.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="flex text-[10px]">
                        <span className="mr-2 text-gray-500">-</span>
                        <span className="text-gray-700">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {skillGroups.length > 0 && (
            <section className="mb-4 flex-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
                Skills & Expertise
              </h2>
              <div className="space-y-2">
                {skillGroups.map((group, idx) => (
                  <div key={idx}>
                    <h3 className="text-[10px] font-semibold text-gray-700 mb-0.5">{group.label}</h3>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                      {group.items.map((skill, skillIdx) => (
                        <span key={skillIdx} className="text-gray-600 text-[10px]">
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
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
        </aside>
      </div>
    </div>
  );
}
