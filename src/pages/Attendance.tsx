import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../lib/api";
import type { Course } from "../lib/types";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";
import { cn } from "../lib/utils";

export default function Attendance() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const c = await api.courses.getAll();
      setCourses(c);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  const stats = courses.map((c, idx) => {
    const total = 40;
    const attended = idx === 0 ? 38 : 35;
    const percentage = Math.round((attended / total) * 100);
    return { name: c.name, code: c.code, total, attended, percentage };
  });

  const totalSessions = stats.reduce((acc, curr) => acc + curr.total, 0);
  const totalAttended = stats.reduce((acc, curr) => acc + curr.attended, 0);
  const overall = totalSessions === 0 ? 0 : Math.round((totalAttended / totalSessions) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 blueprint-grid">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            PRESENCE TELEMETRY // MINIMUM STATUTORY REQUIREMENT: 75.0%
          </div>
          <h1 className="font-serif text-3xl text-foreground">Attendance Register &amp; Session Matrix</h1>
        </div>
        <StatusBadge status={overall >= 75 ? "Verified" : "Warning"} />
      </div>

      {/* 1px Divided Telemetry Ledger */}
      <div className="bg-surface border border-border rounded-card shadow-subtle grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
        <div className="p-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">AGGREGATE PRESENCE</span>
          <div className="font-mono text-2xl font-semibold text-foreground mt-1">{overall}.0%</div>
          <span className="font-mono text-[11px] text-success">COMPLIANT (+{overall - 75}% BUFFER)</span>
        </div>
        <div className="p-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">SESSIONS LOGGED</span>
          <div className="font-mono text-2xl font-semibold text-foreground mt-1">
            {totalAttended} / {totalSessions}
          </div>
          <span className="font-mono text-[11px] text-muted">LAB &amp; LECTURE SLOTS</span>
        </div>
        <div className="p-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">UNEXCUSED ABSENCES</span>
          <div className="font-mono text-2xl font-semibold text-warning mt-1">
            0{totalSessions - totalAttended}
          </div>
          <span className="font-mono text-[11px] text-muted">WITHIN PERMITTED QUOTA</span>
        </div>
      </div>

      {/* 40-Session Visual Presence Heatmap */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              CHRONOLOGICAL SESSION MATRIX
            </span>
            <h2 className="font-serif text-xl text-foreground">Semester Presence Heatmap (40 Sessions)</h2>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-foreground inline-block" /> PRESENT (LAB)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary-600 inline-block" /> PRESENT (LECTURE)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-error/30 border border-error inline-block" /> ABSENT
            </span>
          </div>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-20 gap-2 pt-1">
          {Array.from({ length: 40 }, (_, i) => {
            const isAbsent = i === 11 || i === 24 || i === 33;
            const isLab = i % 3 === 0;
            return (
              <div
                key={i}
                title={`Session #${i + 1}: ${isAbsent ? "Absent" : isLab ? "Lab Present" : "Lecture Present"}`}
                className={cn(
                  "h-8 rounded border flex items-center justify-center font-mono text-[10px] transition-transform hover:scale-105",
                  isAbsent
                    ? "bg-error/15 border-error/50 text-error font-bold"
                    : isLab
                    ? "bg-foreground border-foreground text-surface"
                    : "bg-primary-600/15 border-primary-600/30 text-primary-700 font-medium"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Course Register Breakdown */}
      <Card className="!p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-surface-soft">
          <h2 className="font-serif text-lg text-foreground">Course-Level Attendance Ledger</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted bg-surface">
                <th className="py-3.5 px-5">Course</th>
                <th className="py-3.5 px-5 text-center">Conducted</th>
                <th className="py-3.5 px-5 text-center">Attended</th>
                <th className="py-3.5 px-5">Rate</th>
                <th className="py-3.5 px-5 text-right">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.map((course, idx) => (
                <tr key={idx} className="hover:bg-surface-soft transition-colors">
                  <td className="py-4 px-5">
                    <span className="font-mono text-xs font-semibold text-foreground mr-2">{course.code}</span>
                    <span className="text-sm font-medium text-foreground">{course.name}</span>
                  </td>
                  <td className="py-4 px-5 text-center font-mono text-xs text-muted">{course.total}</td>
                  <td className="py-4 px-5 text-center font-mono text-xs text-foreground font-semibold">
                    {course.attended}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-foreground w-10">
                        {course.percentage}%
                      </span>
                      <div className="w-28 bg-surface-elevated h-1.5 rounded-sm overflow-hidden">
                        <div
                          className="bg-foreground h-full"
                          style={{ width: `${course.percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <StatusBadge status={course.percentage < 75 ? "Warning" : "Verified"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
