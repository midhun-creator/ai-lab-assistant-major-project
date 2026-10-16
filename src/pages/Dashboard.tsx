import { useState, useEffect } from "react";
import { ArrowRight, ArrowUpRight, TerminalSquare, FileText, FlaskConical, Cpu } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import type { Course } from "../lib/types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";

function RadialDial({ percentage }: { percentage: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          className="stroke-border"
          strokeWidth="3.5"
          strokeDasharray="2 2"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          className="stroke-foreground transition-all duration-700"
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-mono text-[11px] font-semibold text-foreground">
        {percentage}%
      </span>
    </div>
  );
}

function ASTPipelineSchematic() {
  return (
    <svg viewBox="0 0 380 54" className="w-full h-12 my-2 select-none" fill="none">
      {/* Connection lines */}
      <line x1="64" y1="27" x2="118" y2="27" stroke="#334155" strokeWidth="1.25" strokeDasharray="3 3" />
      <line x1="186" y1="27" x2="240" y2="27" stroke="#334155" strokeWidth="1.25" strokeDasharray="3 3" />
      <line x1="308" y1="27" x2="336" y2="27" stroke="#10b981" strokeWidth="1.25" />

      {/* Node 1: STDIN */}
      <rect x="4" y="11" width="60" height="32" rx="5" fill="#161b22" stroke="#475569" strokeWidth="1" />
      <text x="34" y="25" textAnchor="middle" fill="#94a3b8" className="font-mono text-[8px]">STDIN</text>
      <text x="34" y="36" textAnchor="middle" fill="#e2e8f0" className="font-mono text-[9px] font-semibold">input()</text>

      {/* Node 2: CAST */}
      <rect x="118" y="11" width="68" height="32" rx="5" fill="#161b22" stroke="#3b82f6" strokeWidth="1" />
      <text x="152" y="25" textAnchor="middle" fill="#60a5fa" className="font-mono text-[8px]">TYPE CAST</text>
      <text x="152" y="36" textAnchor="middle" fill="#ffffff" className="font-mono text-[9px] font-semibold">int(raw)</text>

      {/* Node 3: FORMAT */}
      <rect x="240" y="11" width="68" height="32" rx="5" fill="#161b22" stroke="#475569" strokeWidth="1" />
      <text x="274" y="25" textAnchor="middle" fill="#94a3b8" className="font-mono text-[8px]">F-STRING</text>
      <text x="274" y="36" textAnchor="middle" fill="#e2e8f0" className="font-mono text-[9px] font-semibold">print()</text>

      {/* Status Pass Node */}
      <circle cx="354" cy="27" r="14" fill="rgba(16, 185, 129, 0.14)" stroke="#10b981" strokeWidth="1.2" />
      <circle cx="354" cy="27" r="4" fill="#10b981" />
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api.courses.getAll().then(setCourses);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      {/* Top Asymmetric Bento Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left 7 Cols: Editorial Command Sheet with Corner Registration Marks */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="lg:col-span-7"
        >
          <Card className="p-6 h-full flex flex-col justify-between blueprint-grid">
            {/* Precision Corner Crosshairs */}
            <span className="pointer-events-none absolute top-2.5 left-2.5 font-mono text-[10px] text-border select-none">+</span>
            <span className="pointer-events-none absolute top-2.5 right-2.5 font-mono text-[10px] text-border select-none">+</span>

            <div className="bg-surface/90 backdrop-blur-[1px] p-1 rounded">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-surface-elevated border border-border text-muted mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                <span>COMPUTATIONAL LAB WORKBENCH // SEM-04</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
                {user?.name || "Midhun"}'s Active Laboratory
              </h1>
              <p className="text-sm text-muted mt-2 max-w-xl leading-relaxed">
                Stage 1 execution for <span className="font-mono text-xs text-foreground">CS201 // EXP-01</span> is ready for verification. Complete your test suite run before compiling the Stage 2 Digital Lab Record.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border bg-surface/95 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-muted block text-[10px] uppercase">ACTIVE BUFFER</span>
                  <span className="text-foreground font-semibold">exp-01 / main.py</span>
                </div>
                <div className="h-6 w-px bg-border" />
                <div>
                  <span className="text-muted block text-[10px] uppercase">SUBMISSION CUTOFF</span>
                  <span className="text-error font-semibold">TODAY // 23:59 IST</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Button variant="outline" size="sm" onClick={() => navigate("/labs/exp-01")}>
                  <span>Spec Sheet</span>
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate("/workspace?expId=exp-01")}>
                  <TerminalSquare className="w-3.5 h-3.5" />
                  <span>Launch IDE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Right 5 Cols: Obsidian Live Execution Telemetry Instrument */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
          className="lg:col-span-5 obsidian-surface text-slate-200 rounded-card border border-border-dark p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-border-dark pb-3 mb-2">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AST PIPELINE // EXP-01</span>
              </div>
              <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-ide-elevated text-primary-300 border border-slate-700">
                CPYTHON 3.11
              </span>
            </div>

            <ASTPipelineSchematic />

            <div className="bg-ide-bg/90 border border-border-dark rounded p-3 font-mono text-[11px] text-slate-300 leading-relaxed">
              <div className="text-slate-500 text-[10px] mb-1">$ python3 main.py --verify</div>
              <div>&gt; Enter your name: <span className="text-primary-300">Midhun</span></div>
              <div>&gt; Enter your age: <span className="text-primary-300">20</span></div>
              <div className="text-emerald-400">Hello, Midhun! You are 20 years old.</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-dark flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
              ASSERTIONS: 2/2 PASSED (42ms)
            </span>
            <Link
              to="/workspace?expId=exp-01"
              className="font-mono text-[11px] text-primary-300 hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <span>INSPECT TRACE</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* 1px Hairline Telemetry Ledger Strip */}
      <div className="bg-surface border border-border rounded-card shadow-subtle grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {[
          { label: "ENROLLED COURSES", value: "02", meta: "CS201, CS301 ACTIVE", route: "/courses" },
          { label: "VERIFIED LAB RECORDS", value: "08", meta: "SHA-256 SIGNED", route: "/submissions" },
          { label: "PENDING SUBMISSIONS", value: "02", meta: "1 DUE WITHIN 24H", route: "/assignments" },
          { label: "PRESENCE REGISTER", value: "92.0%", meta: "37 / 40 SESSIONS", route: "/attendance" },
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
            <div className="font-mono text-2xl font-semibold text-foreground mt-2 tracking-tight">
              {stat.value}
            </div>
            <div className="font-mono text-[11px] text-muted mt-1">{stat.meta}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left 8 Columns: Courses with Radial Dials & Verification Log */}
        <div className="lg:col-span-8 space-y-7">
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl text-foreground">Active Curriculum</h2>
                <span className="font-mono text-xs text-muted">({courses.length})</span>
              </div>
              <Link to="/courses" className="font-mono text-xs text-primary-600 hover:underline inline-flex items-center gap-1">
                <span>OPEN CATALOG</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="p-5 cursor-pointer hover:border-foreground/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[11px] font-semibold px-2 py-0.5 bg-surface-elevated text-foreground rounded border border-border">
                        {course.code}
                      </span>
                      <h3 className="font-semibold text-base text-foreground mt-2.5">{course.name}</h3>
                      <p className="text-xs text-muted mt-1 line-clamp-2">{course.description}</p>
                    </div>
                    <RadialDial percentage={course.progress ?? 0} />
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between font-mono text-[11px] text-muted">
                    <span>{course.totalModules} SYLLABUS MODULES</span>
                    <span className="text-foreground font-medium inline-flex items-center gap-1">
                      ENTER LAB <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Recent Submissions Ledger */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl text-foreground">Verification Pipeline Log</h2>
              <Link to="/submissions" className="font-mono text-xs text-primary-600 hover:underline">
                FULL ARCHIVE →
              </Link>
            </div>
            <Card className="divide-y divide-border">
              {[
                {
                  id: "exp-01",
                  code: "CS201 // EXP-01",
                  title: "Experiment 01: Basic I/O & Types",
                  type: "Digital Lab Record",
                  status: "Submitted",
                  time: "2h ago",
                  route: "/labs/exp-01",
                },
                {
                  id: "a1",
                  code: "CS201 // ASGN-01",
                  title: "Assignment 01: Number Guesser",
                  type: "Course Assignment",
                  status: "Verified",
                  time: "1d ago",
                  route: "/assignments",
                },
              ].map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(sub.route)}
                  className="p-4 flex items-center justify-between hover:bg-surface-soft transition-colors cursor-pointer"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-8 h-8 rounded bg-surface-elevated border border-border flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted uppercase">{sub.code}</span>
                        <span className="text-border">•</span>
                        <span className="font-mono text-[10px] text-muted">{sub.type}</span>
                      </div>
                      <h4 className="text-sm font-medium text-foreground mt-0.5">{sub.title}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={sub.status} />
                    <span className="font-mono text-xs text-muted hidden sm:inline">{sub.time}</span>
                  </div>
                </div>
              ))}
            </Card>
          </section>
        </div>

        {/* Right 4 Columns: Schedule & Socratic Diagnostic */}
        <div className="lg:col-span-4 space-y-7">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl text-foreground">Deadlines</h2>
              <Link to="/calendar" className="font-mono text-xs text-muted hover:text-foreground">
                SCHEDULE →
              </Link>
            </div>
            <Card className="divide-y divide-border">
              {[
                {
                  title: "Experiment 01: Basic I/O & Types",
                  course: "CS201",
                  date: "TODAY // 23:59",
                  icon: FlaskConical,
                  urgent: true,
                  route: "/labs/exp-01",
                },
                {
                  title: "Assignment 02: Prime Checker",
                  course: "CS201",
                  date: "NOV 03 // 23:59",
                  icon: FileText,
                  urgent: false,
                  route: "/assignments",
                },
              ].map((deadline, i) => (
                <div
                  key={i}
                  onClick={() => navigate(deadline.route)}
                  className="p-4 hover:bg-surface-soft transition-colors cursor-pointer flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-surface-elevated border border-border text-foreground mt-0.5">
                      <deadline.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase text-muted">{deadline.course}</span>
                      <h4 className="font-medium text-sm text-foreground leading-snug">{deadline.title}</h4>
                      <p
                        className={`font-mono text-[11px] mt-1 ${
                          deadline.urgent ? "text-error font-semibold" : "text-muted"
                        }`}
                      >
                        CUTOFF: {deadline.date}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted shrink-0 mt-1" />
                </div>
              ))}
            </Card>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground mb-3">Socratic Telemetry</h2>
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary-600" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                    STATIC ANALYZER
                  </span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-foreground">
                  EXP-01
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Your buffer <code className="font-mono text-foreground bg-surface-elevated px-1 py-0.5 rounded">main.py</code> passes standard I/O checks but lacks a <code className="font-mono text-foreground bg-surface-elevated px-1 py-0.5 rounded">try/except ValueError</code> guard around <code className="font-mono text-foreground bg-surface-elevated px-1 py-0.5 rounded">int()</code>.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between font-mono text-xs"
                onClick={() => navigate("/ai-tutor")}
              >
                <span>OPEN VIVA & DIAGNOSTIC DRILL</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
