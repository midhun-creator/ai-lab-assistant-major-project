import { useState, useEffect } from "react";
import { Search, ArrowUpRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Course } from "../lib/types";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { StatusBadge } from "../components/ui/Badge";

/**
 * Bespoke architectural SVG schematics per course code
 */
function CourseSchematic({ code }: { code: string }) {
  if (code === "CS201") {
    return (
      <svg viewBox="0 0 320 90" className="w-full h-24" fill="none">
        {/* Background grid lines */}
        <line x1="0" y1="22" x2="320" y2="22" stroke="#1e293b" strokeWidth="0.75" strokeDasharray="2 4" />
        <line x1="0" y1="45" x2="320" y2="45" stroke="#1e293b" strokeWidth="0.75" strokeDasharray="2 4" />
        <line x1="0" y1="68" x2="320" y2="68" stroke="#1e293b" strokeWidth="0.75" strokeDasharray="2 4" />
        {/* Control flow pipeline */}
        <path d="M36 45 H105 L135 24 H195 M105 45 L135 66 H195 M195 24 L225 45 H284 M195 66 L225 45" stroke="#60a5fa" strokeWidth="1.25" />
        <rect x="16" y="33" width="44" height="24" rx="4" fill="#0f172a" stroke="#60a5fa" strokeWidth="1.2" />
        <text x="38" y="48" textAnchor="middle" fill="#e2e8f0" className="font-mono text-[8px]">DEF</text>
        <rect x="135" y="13" width="60" height="22" rx="4" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
        <text x="165" y="27" textAnchor="middle" fill="#cbd5e1" className="font-mono text-[8px]">BRANCH T</text>
        <rect x="135" y="55" width="60" height="22" rx="4" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
        <text x="165" y="69" textAnchor="middle" fill="#cbd5e1" className="font-mono text-[8px]">BRANCH F</text>
        <circle cx="284" cy="45" r="9" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
        <circle cx="284" cy="45" r="3" fill="#10b981" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 320 90" className="w-full h-24" fill="none">
      <line x1="0" y1="22" x2="320" y2="22" stroke="#1e293b" strokeWidth="0.75" strokeDasharray="2 4" />
      <line x1="0" y1="68" x2="320" y2="68" stroke="#1e293b" strokeWidth="0.75" strokeDasharray="2 4" />
      {/* Binary tree / graph edges */}
      <path d="M160 18 L100 46 M160 18 L220 46 M100 46 L68 72 M100 46 L132 72 M220 46 L188 72 M220 46 L252 72" stroke="#94a3b8" strokeWidth="1.2" />
      {[
        [160, 18, "ROOT", "#60a5fa"],
        [100, 46, "L1", "#94a3b8"],
        [220, 46, "R1", "#60a5fa"],
        [68, 72, "01", "#64748b"],
        [132, 72, "04", "#64748b"],
        [188, 72, "09", "#10b981"],
        [252, 72, "12", "#64748b"],
      ].map(([cx, cy, label, stroke], idx) => (
        <g key={idx}>
          <circle cx={Number(cx)} cy={Number(cy)} r="11" fill="#0f172a" stroke={String(stroke)} strokeWidth="1.25" />
          <text x={Number(cx)} y={Number(cy) + 3} textAnchor="middle" fill="#e2e8f0" className="font-mono text-[7px]">
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function MyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.courses.getAll().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const filtered = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            ACADEMIC CURRICULUM // SEMESTER 04
          </div>
          <h1 className="font-serif text-3xl text-foreground">Enrolled Laboratory Courses</h1>
        </div>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-muted" />
          </div>
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 font-mono text-xs"
            placeholder="Filter by code (CS201) or title..."
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="block group">
              <Card className="h-full flex flex-col hover:border-foreground/50 transition-all">
                {/* Top Obsidian Blueprint Schematic Header */}
                <div className="obsidian-surface border-b border-border-dark px-5 pt-4 pb-2 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-ide-elevated text-white border border-slate-700">
                      {course.code}
                    </span>
                    <StatusBadge status="Active" />
                  </div>
                  <CourseSchematic code={course.code} />
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-serif text-2xl text-foreground group-hover:text-primary-600 transition-colors">
                        {course.name}
                      </h2>
                      <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-foreground transition-colors shrink-0 mt-1" />
                    </div>
                    <p className="text-xs text-muted mt-1.5 leading-relaxed">{course.description}</p>
                  </div>

                  <div>
                    <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-md bg-surface-soft mb-4">
                      <div className="p-2.5 text-center">
                        <span className="font-mono text-[9px] uppercase text-muted block">INSTRUCTOR</span>
                        <span className="font-mono text-xs font-medium text-foreground mt-0.5 block truncate">
                          Prof. S. Jenkins
                        </span>
                      </div>
                      <div className="p-2.5 text-center">
                        <span className="font-mono text-[9px] uppercase text-muted block">MODULES</span>
                        <span className="font-mono text-xs font-semibold text-foreground mt-0.5 block">
                          0{course.totalModules} UNITS
                        </span>
                      </div>
                      <div className="p-2.5 text-center">
                        <span className="font-mono text-[9px] uppercase text-muted block">COMPLETION</span>
                        <span className="font-mono text-xs font-semibold text-primary-600 mt-0.5 block">
                          {course.progress || 0}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-surface-elevated rounded-sm h-1.5 overflow-hidden">
                      <div
                        className="bg-foreground h-full transition-all duration-700"
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
