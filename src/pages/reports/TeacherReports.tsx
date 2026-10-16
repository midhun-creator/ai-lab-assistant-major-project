import { Download, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export default function TeacherReports() {
  const [activeCourse, setActiveCourse] = useState("cs201");

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 blueprint-grid">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            COHORT TELEMETRY // STATISTICAL DISTRIBUTION
          </div>
          <h1 className="font-serif text-3xl text-foreground">Class Performance Analytics</h1>
        </div>
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <select
              value={activeCourse}
              onChange={(e) => setActiveCourse(e.target.value)}
              className="appearance-none bg-surface border border-border text-foreground pl-3.5 pr-9 py-2 rounded-md font-mono text-xs outline-none focus:border-primary-600"
            >
              <option value="cs201">CS201 — Python Programming</option>
              <option value="cs301">CS301 — Data Structures</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-3 top-2.5 pointer-events-none" />
          </div>
          <Button variant="outline" size="md">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* 1px Divided Telemetry Strip */}
      <div className="bg-surface border border-border rounded-card shadow-subtle grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
        <div className="p-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">COHORT MEAN ATTENDANCE</span>
          <p className="font-mono text-2xl font-semibold text-foreground mt-1">84.2%</p>
          <span className="font-mono text-[11px] text-muted">σ = 6.4% ACROSS 60 STUDENTS</span>
        </div>
        <div className="p-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">LAB VERIFICATION RATE</span>
          <p className="font-mono text-2xl font-semibold text-foreground mt-1">92.0%</p>
          <span className="font-mono text-[11px] text-success">55 / 60 RECORDS SIGNED</span>
        </div>
        <div className="p-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">MEDIAN ASSESSMENT SCORE</span>
          <p className="font-mono text-2xl font-semibold text-foreground mt-1">78.5%</p>
          <span className="font-mono text-[11px] text-primary-600">+4.1% VS PRIOR SEMESTER</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Histogram Distribution */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">SCORE QUARTILES</span>
              <h2 className="font-serif text-xl text-foreground">Cohort Grade Distribution</h2>
            </div>
            <span className="font-mono text-xs text-muted">N = 70</span>
          </div>

          <div className="h-52 flex items-end justify-between gap-3 pt-6 border-b border-border px-2">
            {[
              { band: "<50%", count: 5, h: "20%", tone: "bg-error/70" },
              { band: "50–60%", count: 12, h: "42%", tone: "bg-warning/70" },
              { band: "60–75%", count: 28, h: "90%", tone: "bg-foreground" },
              { band: "75–90%", count: 18, h: "65%", tone: "bg-primary-600" },
              { band: ">90%", count: 7, h: "30%", tone: "bg-success" },
            ].map((bar) => (
              <div key={bar.band} className="flex-1 flex flex-col items-center h-full justify-end">
                <span className="font-mono text-[11px] font-semibold text-foreground mb-1.5">
                  {bar.count}
                </span>
                <div className={`w-full rounded-t-sm transition-all ${bar.tone}`} style={{ height: bar.h }} />
                <span className="mt-2.5 font-mono text-[10px] text-muted">{bar.band}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Assessment Breakdown */}
        <Card className="p-6 space-y-5">
          <div className="border-b border-border pb-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">ITEM TELEMETRY</span>
            <h2 className="font-serif text-xl text-foreground">Recent Assessment Benchmarks</h2>
          </div>

          <div className="space-y-5">
            {[
              { title: "Assignment 01: Number Guesser", code: "ASGN-01", avg: 88 },
              { title: "Experiment 01: Basic I/O & Types", code: "EXP-01", avg: 91 },
              { title: "Experiment 02: Pattern Printing", code: "EXP-02", avg: 76 },
              { title: "CS201 Mid-Term Proctored Exam", code: "EXAM-01", avg: 68 },
            ].map((item) => (
              <div key={item.code}>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <div>
                    <span className="font-mono text-[10px] text-muted mr-2">{item.code}</span>
                    <span className="font-medium text-foreground">{item.title}</span>
                  </div>
                  <span className="font-mono font-semibold text-foreground">{item.avg}% MEAN</span>
                </div>
                <div className="w-full bg-surface-elevated rounded-sm h-1.5 overflow-hidden">
                  <div
                    className="bg-foreground h-full transition-all"
                    style={{ width: `${item.avg}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
