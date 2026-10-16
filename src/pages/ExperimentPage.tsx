import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  TerminalSquare, 
  FileCheck,
  AlertCircle,
  Loader2,
  PenTool,
  Eye,
  FileText,
  ShieldCheck
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, CURRENT_USER } from "../lib/api";
import type { Experiment, LabRecord, Course } from "../lib/types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";
import { cn } from "../lib/utils";

export default function ExperimentPage() {
  const { expId } = useParams();
  const navigate = useNavigate();
  
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [record, setRecord] = useState<LabRecord | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<"spec" | "compile" | "sheet">("spec");
  const [theoryText, setTheoryText] = useState("");
  const [algoText, setAlgoText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!expId) return;
      const exp = await api.experiments.getById(expId);
      if (!exp) {
        setLoading(false);
        return;
      }
      setExperiment(exp);
      
      const c = await api.courses.getById(exp.courseId);
      if (c) setCourse(c);
      
      const rec = await api.records.getByExperimentAndStudent(expId, CURRENT_USER.id);
      if (rec) {
        setRecord(rec);
        setTheoryText(rec.theoryContent || exp.theory || "");
        setAlgoText(rec.algorithmContent || exp.algorithm || "");
        setOutputText(rec.outputContent || exp.expectedOutput || "");
      } else {
        setTheoryText(exp.theory || "");
        setAlgoText(exp.algorithm || "");
        setOutputText(exp.expectedOutput || "");
      }
      
      setLoading(false);
    }
    loadData();
  }, [expId]);

  const handleSubmitRecord = async () => {
    if (!record) return;
    setSubmitting(true);
    const updated = await api.records.updateRecord(record.id, theoryText, algoText, outputText);
    if (updated) {
      setRecord(updated);
      setViewMode("sheet");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!experiment || !course) {
    return <div className="text-center py-20 text-muted">Experiment specification not found.</div>;
  }

  const codeSubmitted = record?.codeStatus === "Submitted" || record?.codeStatus === "Passed";
  const recordSubmitted = record?.recordStatus === "Submitted" || record?.recordStatus === "Under Review" || record?.recordStatus === "Verified";

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      {/* Specification Header */}
      <Card className="p-6 blueprint-grid">
        <div className="flex items-center space-x-2 font-mono text-xs text-muted mb-3 uppercase tracking-wider">
          <Link to="/courses" className="hover:text-foreground transition-colors">COURSES</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/courses/${course.id}`} className="hover:text-foreground transition-colors">{course.code}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-semibold">{experiment.id.toUpperCase()}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-3xl text-foreground">{experiment.title}</h1>
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted mt-2">
              <span>RUNTIME: {experiment.language.toUpperCase()} 3.11</span>
              <span>•</span>
              <span>WEIGHT: {experiment.marks} PTS</span>
              <span>•</span>
              <span>CUTOFF: {new Date(experiment.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="md"
              onClick={() => setViewMode(viewMode === "sheet" ? "spec" : "sheet")}
            >
              <Eye className="w-4 h-4" />
              <span>{viewMode === "sheet" ? "Back to Specification" : "Typeset Record Sheet"}</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/workspace?expId=${experiment.id}`)}
            >
              <TerminalSquare className="w-4 h-4" />
              <span>Open Lab IDE</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-border gap-1">
        {[
          { id: "spec" as const, label: "01 // Laboratory Manual", icon: FileText },
          { id: "compile" as const, label: "02 // Record Compiler (Split-Studio)", icon: PenTool },
          { id: "sheet" as const, label: "03 // Official Typeset Dossier", icon: ShieldCheck },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setViewMode(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider border-b-2 -mb-px transition-colors",
              viewMode === t.id
                ? "border-foreground text-foreground font-semibold"
                : "border-transparent text-muted hover:text-foreground"
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {viewMode === "compile" ? (
        /* Split-Screen Live Document Compiler */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <Card className="lg:col-span-6 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">SOURCE MARKUP</span>
                <h2 className="font-serif text-xl text-foreground">Digital Record Editor</h2>
              </div>
              <StatusBadge status={record?.recordStatus || "Writing"} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted mb-1.5">
                  SECTION I — Theoretical Principles
                </label>
                <textarea
                  value={theoryText}
                  onChange={(e) => setTheoryText(e.target.value)}
                  className="w-full bg-surface-soft border border-border rounded-md p-3 text-xs text-foreground focus:outline-none focus:border-primary-600 h-28 leading-relaxed"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted mb-1.5">
                  SECTION II — Step-by-Step Algorithm
                </label>
                <textarea
                  value={algoText}
                  onChange={(e) => setAlgoText(e.target.value)}
                  className="w-full bg-surface-soft border border-border rounded-md p-3 text-xs font-mono text-foreground focus:outline-none focus:border-primary-600 h-32 leading-relaxed"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted mb-1.5">
                  SECTION III — Verified Standard Output
                </label>
                <textarea
                  value={outputText}
                  onChange={(e) => setOutputText(e.target.value)}
                  className="w-full bg-ide-panel text-slate-200 border border-border-dark rounded-md p-3 text-xs font-mono focus:outline-none h-28 leading-relaxed"
                />
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted">
                  AUTO-SYNCED WITH WORKSPACE BUFFER
                </span>
                <Button
                  variant="primary"
                  onClick={handleSubmitRecord}
                  disabled={submitting || !codeSubmitted}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                  <span>Commit & Sign Record</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Live Typeset Preview Pane */}
          <Card className="lg:col-span-6 p-7 bg-surface border-border space-y-5 font-serif">
            <div className="border-b-2 border-foreground pb-4 flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  DEPARTMENT OF COMPUTER SCIENCE // LAB DOSSIER
                </p>
                <h3 className="font-serif text-2xl text-foreground mt-1">{experiment.title}</h3>
                <p className="font-mono text-[11px] text-muted mt-1">
                  CANDIDATE: {CURRENT_USER.name.toUpperCase()} ({CURRENT_USER.id.toUpperCase()})
                </p>
              </div>
              <div className="border border-foreground px-2.5 py-1 text-right font-mono">
                <span className="text-[9px] block text-muted">DOC REF</span>
                <span className="text-xs font-semibold text-foreground">{experiment.id.toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1">I. Objective & Theory</h4>
                <p className="text-foreground leading-relaxed">{theoryText || "—"}</p>
              </div>
              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1">II. Algorithm Specification</h4>
                <pre className="font-mono text-[11px] bg-surface-soft p-3 rounded border border-border whitespace-pre-wrap text-foreground">
                  {algoText || "—"}
                </pre>
              </div>
              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1">III. Verified Source Listing (main.py)</h4>
                <pre className="font-mono text-[11px] bg-ide-panel text-slate-200 p-3 rounded border border-border-dark whitespace-pre-wrap">
                  {record?.codeContent || "# Source code auto-attached from IDE submission"}
                </pre>
              </div>
              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1">IV. Execution Output</h4>
                <pre className="font-mono text-[11px] bg-surface-elevated p-3 rounded border border-border whitespace-pre-wrap text-foreground">
                  {outputText || "—"}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between font-mono text-[10px] text-muted">
              <span>SHA-256: 8f94e2c0...4b1a</span>
              <span>STATUS: {record?.recordStatus?.toUpperCase() || "DRAFT"}</span>
            </div>
          </Card>
        </div>
      ) : viewMode === "sheet" ? (
        /* Full Archival Typeset University Record Sheet */
        <Card className="max-w-4xl mx-auto p-10 bg-surface border border-border space-y-6">
          <div className="border-b-2 border-foreground pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                INSTITUTIONAL DIGITAL ARCHIVE // {course.code}
              </div>
              <h2 className="font-serif text-3xl text-foreground mt-1">{experiment.title}</h2>
              <p className="font-mono text-xs text-muted mt-1">
                STUDENT: {CURRENT_USER.name} ({CURRENT_USER.email})
              </p>
            </div>
            <div className="border-2 border-foreground/80 px-4 py-2 rounded text-center font-mono">
              <span className="text-[9px] uppercase tracking-widest text-muted block">VERIFICATION SEAL</span>
              <span className="text-xs font-semibold text-foreground">
                {record?.recordStatus === "Verified" ? "FACULTY VERIFIED" : "SUBMITTED // PENDING SIGN-OFF"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2">01 // Theoretical Basis</h3>
              <p className="text-sm text-foreground leading-relaxed bg-surface-soft p-4 rounded border border-border">
                {theoryText}
              </p>
            </div>
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2">02 // Algorithm Steps</h3>
              <pre className="font-mono text-xs text-foreground leading-relaxed bg-surface-soft p-4 rounded border border-border whitespace-pre-wrap">
                {algoText}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2">03 // Submitted Source Code</h3>
            <pre className="font-mono text-xs bg-ide-panel text-slate-200 p-4 rounded border border-border-dark whitespace-pre-wrap">
              {record?.codeContent || "name = input('Enter your name: ')\nage = int(input('Enter your age: '))\nprint(f'Hello, {name}!')"}
            </pre>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2">04 // Observed Standard Output</h3>
            <pre className="font-mono text-xs bg-surface-elevated text-foreground p-4 rounded border border-border whitespace-pre-wrap">
              {outputText}
            </pre>
          </div>
        </Card>
      ) : (
        /* Default Specification & Pipeline View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className="divide-y divide-border">
              <section className="p-6">
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2">
                  01 // EXPERIMENT OBJECTIVE
                </div>
                <p className="text-sm text-foreground leading-relaxed">{experiment.objective}</p>
              </section>
              
              <section className="p-6">
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2">
                  02 // THEORETICAL FOUNDATION
                </div>
                <p className="text-sm text-muted leading-relaxed">{experiment.theory}</p>
              </section>

              <section className="p-6">
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-3">
                  03 // ALGORITHM SPECIFICATION
                </div>
                <div className="bg-surface-soft p-4 rounded-md border border-border">
                  <pre className="text-xs text-foreground font-mono whitespace-pre-wrap leading-relaxed">
                    {experiment.algorithm}
                  </pre>
                </div>
              </section>

              <section className="p-6">
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-3">
                  04 // EXPECTED STANDARD OUTPUT (STDOUT)
                </div>
                <div className="bg-ide-panel text-slate-200 p-4 rounded-md font-mono text-xs border border-border-dark">
                  <pre className="whitespace-pre-wrap leading-relaxed">{experiment.expectedOutput}</pre>
                </div>
              </section>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-5">
            <Card className="p-5 space-y-5">
              <div className="border-b border-border pb-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">VERIFICATION LEDGER</span>
                <h3 className="font-serif text-xl text-foreground mt-0.5">Submission Pipeline</h3>
              </div>
              
              <div className="space-y-3.5">
                <div className="p-3 rounded-md bg-surface-soft border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-foreground">STAGE 1: CODE</span>
                    <StatusBadge status={record?.codeStatus || "Not Started"} />
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {codeSubmitted
                      ? "Source code verified and committed in IDE."
                      : "Execute and submit code in the Lab Workspace."}
                  </p>
                </div>
                
                <div className="p-3 rounded-md bg-surface-soft border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-foreground">STAGE 2: RECORD</span>
                    <StatusBadge status={record?.recordStatus || "Not Started"} />
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {recordSubmitted
                      ? `Submitted on ${new Date(record!.submittedAt!).toLocaleDateString()}`
                      : "Compile theory, algorithm, and output in Split-Studio."}
                  </p>
                </div>

                <div className="p-3 rounded-md bg-surface-soft border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-foreground">STAGE 3: SIGN-OFF</span>
                    <StatusBadge
                      status={
                        record?.recordStatus === "Verified"
                          ? "Verified"
                          : record?.recordStatus === "Correction Required"
                          ? "Correction Required"
                          : "Pending"
                      }
                    />
                  </div>
                  {record?.teacherFeedback ? (
                    <div className="mt-2 pt-2 border-t border-border text-xs">
                      <p className="font-mono text-[10px] uppercase text-muted">FACULTY REMARK:</p>
                      <p className="text-foreground mt-0.5">{record.teacherFeedback}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted mt-1">Awaiting faculty review.</p>
                  )}
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setViewMode("compile")}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Open Split-Screen Record Compiler</span>
                </Button>
              </div>
            </Card>
            
            {!codeSubmitted && (
              <Card className="p-4 bg-surface-soft border-warning/40">
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-mono text-xs font-semibold uppercase text-foreground">Stage 1 Prerequisite</h4>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      Verify your code in the Lab IDE before committing the formal Stage 2 record.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
