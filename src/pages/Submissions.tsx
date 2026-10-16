import { useState, useEffect } from "react";
import { Search, ArrowUpRight, Loader2, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, CURRENT_USER } from "../lib/api";
import type { LabRecord, Course, Experiment } from "../lib/types";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";

export default function Submissions() {
  const navigate = useNavigate();
  const [labRecords, setLabRecords] = useState<LabRecord[]>([]);
  const [experiments, setExperiments] = useState<Record<string, Experiment>>({});
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const allC = await api.courses.getAll();
      const cMap: Record<string, Course> = {};
      allC.forEach((c) => (cMap[c.id] = c));
      setCourses(cMap);

      const expMap: Record<string, Experiment> = {};
      for (const c of allC) {
        const exps = await api.experiments.getByCourse(c.id);
        exps.forEach((e) => (expMap[e.id] = e));
      }
      setExperiments(expMap);

      const rec = await api.records.getByExperimentAndStudent("exp-01", CURRENT_USER.id);
      setLabRecords(rec ? [rec] : []);
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

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 blueprint-grid">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            CRYPTOGRAPHIC SUBMISSION ARCHIVE // CANDIDATE: {CURRENT_USER.name.toUpperCase()}
          </div>
          <h1 className="font-serif text-3xl text-foreground">Submitted Dossiers &amp; Code Commits</h1>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="h-3.5 w-3.5 text-muted absolute left-3 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-md font-mono text-xs text-foreground focus:outline-none focus:border-primary-600"
            placeholder="Filter archive..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {labRecords.map((sub) => {
          const exp = experiments[sub.experimentId];
          const course = exp ? courses[exp.courseId] : null;
          return (
            <Card
              key={sub.id}
              onClick={() => navigate(`/labs/${sub.experimentId}`)}
              className="p-6 cursor-pointer hover:border-foreground/50 transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground">
                      {course?.code || "CS201"}
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      {sub.experimentId.toUpperCase()}
                    </span>
                  </div>
                  <StatusBadge status={sub.codeStatus} />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-xl text-foreground">
                    {exp?.title || sub.experimentId}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-muted shrink-0 mt-1" />
                </div>

                {sub.codeContent && (
                  <pre className="mt-3 p-3 rounded bg-ide-panel text-slate-300 border border-border-dark font-mono text-[11px] line-clamp-3 overflow-hidden">
                    {sub.codeContent}
                  </pre>
                )}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="text-[10px] text-muted block uppercase">COMMITTED</span>
                  <span className="text-foreground">
                    {new Date(sub.submittedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted block uppercase">RECORD STATUS</span>
                  <span className="text-primary-600 font-semibold">{sub.recordStatus}</span>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Verified Assignment Archive Card */}
        <Card
          onClick={() => navigate("/assignments")}
          className="p-6 cursor-pointer hover:border-foreground/50 transition-all flex flex-col justify-between space-y-5"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground">
                  CS201
                </span>
                <span className="font-mono text-[11px] text-muted">ASGN-01</span>
              </div>
              <StatusBadge status="Verified" />
            </div>

            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-xl text-foreground">
                Assignment 01: Number Guesser
              </h3>
              <FileCheck className="w-4 h-4 text-success shrink-0 mt-1" />
            </div>

            <div className="mt-3 p-3 rounded bg-surface-soft border border-border font-mono text-[11px] text-muted">
              SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] text-muted block uppercase">COMMITTED</span>
              <span className="text-foreground">12/10/2026</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted block uppercase">AWARDED SCORE</span>
              <span className="text-success font-semibold">09 / 10 PTS</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
