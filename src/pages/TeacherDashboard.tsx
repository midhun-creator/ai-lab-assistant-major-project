import { useState, useEffect } from "react";
import {
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  PlusCircle,
  CalendarCheck,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { api } from "../lib/api";
import type { Course, LabRecord, User } from "../lib/types";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingRecords, setPendingRecords] = useState<LabRecord[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [expTitles, setExpTitles] = useState<Record<string, string>>({});
  const [atRisk, setAtRisk] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [c, pr, allUsers] = await Promise.all([
        api.courses.getAll(),
        api.records.getAllPending(),
        api.users.getAll(),
      ]);
      setCourses(c);
      setPendingRecords(pr);

      const uMap: Record<string, User> = {};
      allUsers.forEach((u) => {
        uMap[u.id] = u;
      });
      setUsersMap(uMap);

      const eMap: Record<string, string> = {};
      for (const course of c) {
        const exps = await api.experiments.getByCourse(course.id);
        exps.forEach((e) => {
          eMap[e.id] = e.title;
        });
      }
      setExpTitles(eMap);

      if (c.length > 0) {
        const risks = await api.analytics.detectAtRiskStudents(c[0].id);
        setAtRisk(risks.slice(0, 4));
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Faculty Console Header */}
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted mb-2">
            <span>FACULTY CONSOLE</span>
            <span>•</span>
            <span>PROF. SARAH JENKINS</span>
          </div>
          <h1 className="font-serif text-3xl text-foreground tracking-tight">
            Instructional & Verification Control
          </h1>
          <p className="text-sm text-muted mt-1">
            {pendingRecords.length} digital lab records are awaiting faculty sign-off across {courses.length} active courses.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button variant="outline" size="sm" onClick={() => navigate("/teacher/plagiarism")}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AST Similarity Matrix</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate("/teacher/records")}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Review Queue ({pendingRecords.length})</span>
          </Button>
        </div>
      </div>

      {/* 1px Hairline Telemetry Strip */}
      <div className="bg-surface border border-border rounded-card shadow-subtle grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {[
          { label: "MANAGED COURSES", value: `0${courses.length}`, meta: "CS201, CS301", route: "/teacher/courses" },
          { label: "VERIFICATION QUEUE", value: `0${pendingRecords.length}`, meta: "REQUIRES SIGN-OFF", route: "/teacher/records" },
          { label: "AT-RISK COHORT", value: `0${atRisk.length}`, meta: "ATTENDANCE / OVERDUE", route: "/teacher/reports" },
          { label: "ENROLLED STUDENTS", value: "120", meta: "2 LAB BATCHES", route: "/teacher/attendance" },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => navigate(stat.route)}
            className="p-5 text-left hover:bg-surface-soft transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted">
                {stat.label}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="font-mono text-2xl font-semibold text-foreground mt-2">
              {stat.value}
            </div>
            <div className="font-mono text-[11px] text-muted mt-1">{stat.meta}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Columns: Verification Queue & Courses */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="!p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-soft">
              <div>
                <h2 className="font-serif text-lg text-foreground">Pending Record Verifications</h2>
                <p className="font-mono text-[11px] text-muted">STUDENT SUBMISSIONS AWAITING FACULTY GRADE</p>
              </div>
              <Link
                to="/teacher/records"
                className="font-mono text-xs text-primary-600 hover:underline inline-flex items-center gap-1"
              >
                <span>OPEN FULL QUEUE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted bg-surface">
                    <th className="py-3 px-5">Student</th>
                    <th className="py-3 px-5">Experiment</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendingRecords.slice(0, 5).map((item) => {
                    const studentName = usersMap[item.studentId]?.name || item.studentId;
                    const expTitle = expTitles[item.experimentId] || item.experimentId;
                    return (
                      <tr key={item.id} className="hover:bg-surface-soft transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-medium text-foreground">{studentName}</div>
                          <div className="font-mono text-[10px] text-muted">{item.studentId.toUpperCase()}</div>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-foreground max-w-[220px] truncate">
                          {expTitle}
                        </td>
                        <td className="py-3.5 px-5">
                          <StatusBadge status={item.recordStatus} />
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/teacher/records")}
                          >
                            <span>Inspect & Grade</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Direct Faculty Operations */}
          <div>
            <h2 className="font-serif text-xl text-foreground mb-3">Curriculum & Lab Operations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Manage Course Modules", desc: "Add experiments & syllabus PDFs", icon: PlusCircle, route: "/teacher/courses" },
                { label: "Mark Lab Attendance", desc: "Log batch presence register", icon: CalendarCheck, route: "/teacher/attendance" },
                { label: "Run Plagiarism Check", desc: "Compare student AST similarity", icon: ShieldCheck, route: "/teacher/plagiarism" },
              ].map((op) => (
                <button
                  key={op.label}
                  onClick={() => navigate(op.route)}
                  className="p-4 bg-surface rounded-card border border-border hover:border-foreground/40 text-left transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <op.icon className="w-4 h-4 text-primary-600" />
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-sm font-semibold text-foreground">{op.label}</div>
                  <div className="text-xs text-muted mt-0.5">{op.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: At-Risk Telemetry & Schedule */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h3 className="font-serif text-lg text-foreground">At-Risk Cohort</h3>
              </div>
              <span className="font-mono text-[10px] uppercase text-muted">AUTO-DETECTED</span>
            </div>
            <div className="space-y-3">
              {atRisk.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted">No at-risk students flagged.</div>
              ) : (
                atRisk.map((risk, i) => (
                  <div
                    key={i}
                    className="p-3 bg-surface-soft rounded-md border border-border"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{risk.student.name}</p>
                        <p className="font-mono text-[10px] text-muted">{risk.student.email}</p>
                      </div>
                      <StatusBadge status={risk.riskLevel === "Critical" ? "Overdue" : "Pending"} />
                    </div>
                    <ul className="font-mono text-[11px] text-muted space-y-0.5 mt-2">
                      {risk.flags.map((f: string, j: number) => (
                        <li key={j}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 font-mono text-xs"
              onClick={() => navigate("/teacher/reports")}
            >
              <span>VIEW COHORT TELEMETRY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Card>

          <Card className="p-5">
            <h3 className="font-serif text-lg text-foreground border-b border-border pb-3 mb-4">
              Lab Session Schedule
            </h3>
            <div className="space-y-2.5">
              {[
                { time: "10:00", title: "CS201 Python Programming Lab", room: "LAB-03", active: true },
                { time: "14:00", title: "CS301 Data Structures Lab", room: "LAB-02", active: false },
                { time: "16:00", title: "Record Verification Hour", room: "FACULTY-B", active: false },
              ].map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded border text-xs",
                    item.active
                      ? "bg-primary-50/70 border-primary-200 text-foreground"
                      : "bg-surface border-border text-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-foreground">{item.time}</span>
                    <span className="font-medium text-foreground">{item.title}</span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-surface-elevated rounded border border-border">
                    {item.room}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
