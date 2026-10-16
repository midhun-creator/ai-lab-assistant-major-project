import { useState, useEffect } from "react";
import { 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  X
} from "lucide-react";
import { api } from "../lib/api";
import type { LabRecord, Experiment, Assignment, AssignmentSubmission, User } from "../lib/types";
import { cn } from "../lib/utils";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";

export default function TeacherRecordReview() {
  const [activeTab, setActiveTab] = useState<"records" | "assignments">("records");
  const [records, setRecords] = useState<LabRecord[]>([]);
  const [experiments, setExperiments] = useState<Record<string, Experiment>>({});
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedRecord, setSelectedRecord] = useState<LabRecord | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [marks, setMarks] = useState<number | "">(9);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const [recs, subs, allAsn, allUsers] = await Promise.all([
        api.records.getAllPending(),
        api.assignments.getAllPending(),
        api.assignments.getAll(),
        api.users.getAll(),
      ]);
      setRecords(recs);
      setSubmissions(subs);

      const uMap: Record<string, User> = {};
      allUsers.forEach((u) => (uMap[u.id] = u));
      setUsersMap(uMap);

      const expMap: Record<string, Experiment> = {};
      for (const r of recs) {
        if (!expMap[r.experimentId]) {
          const e = await api.experiments.getById(r.experimentId);
          if (e) expMap[e.id] = e;
        }
      }
      setExperiments(expMap);

      const asnMap: Record<string, Assignment> = {};
      allAsn.forEach((a) => (asnMap[a.id] = a));
      setAssignments(asnMap);

      if (recs.length > 0) setSelectedRecord(recs[0]);
      setLoading(false);
    }
    load();
  }, []);

  const handleReviewRecord = async (status: "Verified" | "Correction Required") => {
    if (!selectedRecord) return;
    setSubmitting(true);
    const m = typeof marks === "number" ? marks : 0;
    const updated = await api.records.verifyRecord(selectedRecord.id, m, feedback, status);
    if (updated) {
      const remaining = records.filter((r) => r.id !== updated.id);
      setRecords(remaining);
      setSelectedRecord(remaining[0] ?? null);
      setMarks(9);
      setFeedback("");
    }
    setSubmitting(false);
  };

  const handleReviewSubmission = async () => {
    if (!selectedSubmission) return;
    setSubmitting(true);
    const m = typeof marks === "number" ? marks : 0;
    const updated = await api.assignments.verifySubmission(selectedSubmission.id, m, feedback);
    if (updated) {
      const remaining = submissions.filter((s) => s.id !== updated.id);
      setSubmissions(remaining);
      setSelectedSubmission(remaining[0] ?? null);
      setMarks(9);
      setFeedback("");
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

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 blueprint-grid">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            FACULTY EVALUATION WORKBENCH // CRYPTOGRAPHIC RECORD SIGN-OFF
          </div>
          <h1 className="font-serif text-3xl text-foreground">Submission &amp; Dossier Verification</h1>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="h-3.5 w-3.5 text-muted absolute left-3 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-md font-mono text-xs text-foreground focus:outline-none focus:border-primary-600"
            placeholder="Filter by student or ID..."
          />
        </div>
      </div>

      <div className="flex border-b border-border gap-1">
        <button
          onClick={() => {
            setActiveTab("records");
            setSelectedSubmission(null);
          }}
          className={cn(
            "px-5 py-2.5 font-mono text-xs uppercase tracking-wider border-b-2 -mb-px transition-colors",
            activeTab === "records"
              ? "border-foreground text-foreground font-semibold"
              : "border-transparent text-muted hover:text-foreground"
          )}
        >
          Digital Lab Records ({records.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("assignments");
            setSelectedRecord(null);
            if (submissions.length > 0) setSelectedSubmission(submissions[0]);
          }}
          className={cn(
            "px-5 py-2.5 font-mono text-xs uppercase tracking-wider border-b-2 -mb-px transition-colors",
            activeTab === "assignments"
              ? "border-foreground text-foreground font-semibold"
              : "border-transparent text-muted hover:text-foreground"
          )}
        >
          Course Assignments ({submissions.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left 4 Cols: Queue */}
        <Card className="lg:col-span-4 !p-0 overflow-hidden">
          <div className="bg-surface-soft border-b border-border px-4 py-3 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold uppercase text-foreground">
              Verification Queue
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface border border-border text-foreground">
              {activeTab === "records" ? records.length : submissions.length}
            </span>
          </div>
          <div className="divide-y divide-border max-h-[560px] overflow-y-auto">
            {activeTab === "records" ? (
              records.length === 0 ? (
                <div className="p-8 text-center font-mono text-xs text-muted">
                  QUEUE CLEAR — ZERO PENDING RECORDS
                </div>
              ) : (
                records.map((rec) => {
                  const exp = experiments[rec.experimentId];
                  const studentName = usersMap[rec.studentId]?.name || rec.studentId;
                  const isSelected = selectedRecord?.id === rec.id;
                  return (
                    <button
                      key={rec.id}
                      onClick={() => {
                        setSelectedRecord(rec);
                        setSelectedSubmission(null);
                      }}
                      className={cn(
                        "w-full text-left p-4 transition-colors",
                        isSelected
                          ? "bg-surface-elevated border-l-2 border-foreground"
                          : "hover:bg-surface-soft"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-foreground text-sm">{studentName}</span>
                        <span className="font-mono text-[10px] text-muted">
                          {rec.studentId.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted truncate mb-2">{exp?.title || rec.experimentId}</p>
                      <StatusBadge status={rec.recordStatus} />
                    </button>
                  );
                })
              )
            ) : submissions.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-muted">
                QUEUE CLEAR — ZERO PENDING ASSIGNMENTS
              </div>
            ) : (
              submissions.map((sub) => {
                const asn = assignments[sub.assignmentId];
                const studentName = usersMap[sub.studentId]?.name || sub.studentId;
                const isSelected = selectedSubmission?.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setSelectedRecord(null);
                    }}
                    className={cn(
                      "w-full text-left p-4 transition-colors",
                      isSelected
                        ? "bg-surface-elevated border-l-2 border-foreground"
                        : "hover:bg-surface-soft"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-foreground text-sm">{studentName}</span>
                      <span className="font-mono text-[10px] text-muted">
                        {sub.studentId.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate mb-2">{asn?.title}</p>
                    <StatusBadge status={sub.status} />
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Right 8 Cols: Dossier & Rubric Inspector */}
        <div className="lg:col-span-8">
          {activeTab === "records" && selectedRecord ? (
            <Card className="p-6 space-y-6">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    CANDIDATE: {usersMap[selectedRecord.studentId]?.name || selectedRecord.studentId} (
                    {selectedRecord.studentId.toUpperCase()})
                  </span>
                  <h2 className="font-serif text-2xl text-foreground mt-0.5">
                    {experiments[selectedRecord.experimentId]?.title || selectedRecord.experimentId}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 text-muted hover:text-foreground rounded border border-transparent hover:border-border"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1.5">
                    01 // Theoretical Synopsis
                  </h3>
                  <div className="bg-surface-soft p-3.5 rounded border border-border text-xs text-foreground leading-relaxed min-h-[84px]">
                    {selectedRecord.theoryContent || "Standard input/output operations in Python."}
                  </div>
                </div>
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1.5">
                    02 // Algorithm Steps
                  </h3>
                  <div className="bg-surface-soft p-3.5 rounded border border-border text-xs font-mono text-foreground leading-relaxed min-h-[84px]">
                    <pre className="whitespace-pre-wrap">
                      {selectedRecord.algorithmContent || "1. Read stdin\n2. Cast int\n3. Print formatted stdout"}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1.5">
                    03 // Source Buffer (main.py)
                  </h3>
                  <div className="bg-ide-panel text-slate-200 p-3.5 rounded border border-border-dark text-xs font-mono h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{selectedRecord.codeContent}</pre>
                  </div>
                </div>
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1.5">
                    04 // Verified Stdout
                  </h3>
                  <div className="bg-ide-panel text-emerald-300 p-3.5 rounded border border-border-dark text-xs font-mono h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">
                      {selectedRecord.outputContent || "Enter your name: Alice\nEnter your age: 19\nHello, Alice!"}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold uppercase text-foreground">
                    Faculty Rubric &amp; Sign-Off
                  </span>
                  <span className="font-mono text-xs text-muted">
                    MAX SCORE: {experiments[selectedRecord.experimentId]?.marks ?? 10} PTS
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-36">
                    <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                      AWARDED MARKS
                    </label>
                    <input
                      type="number"
                      value={marks}
                      onChange={(e) => setMarks(Number(e.target.value))}
                      max={experiments[selectedRecord.experimentId]?.marks ?? 10}
                      min={0}
                      className="w-full bg-surface border border-border rounded-md p-2.5 font-mono text-sm font-semibold text-foreground focus:outline-none focus:border-primary-600"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                      EVALUATION REMARK
                    </label>
                    <input
                      type="text"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full bg-surface border border-border rounded-md p-2.5 text-xs text-foreground focus:outline-none focus:border-primary-600"
                      placeholder="Add technical feedback or required revisions..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <Button
                    variant="success"
                    className="flex-1"
                    onClick={() => handleReviewRecord("Verified")}
                    disabled={submitting || marks === ""}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sign &amp; Verify Digital Record</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleReviewRecord("Correction Required")}
                    disabled={submitting}
                  >
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <span>Return for Revision</span>
                  </Button>
                </div>
              </div>
            </Card>
          ) : activeTab === "assignments" && selectedSubmission ? (
            <Card className="p-6 space-y-6">
              <div className="border-b border-border pb-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  CANDIDATE: {usersMap[selectedSubmission.studentId]?.name || selectedSubmission.studentId}
                </span>
                <h2 className="font-serif text-2xl text-foreground mt-0.5">
                  {assignments[selectedSubmission.assignmentId]?.title}
                </h2>
              </div>
              <div className="bg-surface-soft p-4 rounded border border-border font-mono text-xs text-foreground">
                {selectedSubmission.textContent || "Binary search number-guesser implementation attached."}
              </div>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  className="w-32 bg-surface border border-border rounded-md p-2.5 font-mono text-sm text-foreground"
                />
                <input
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Evaluation note..."
                  className="flex-1 bg-surface border border-border rounded-md p-2.5 text-xs text-foreground"
                />
                <Button variant="primary" onClick={handleReviewSubmission} disabled={submitting}>
                  <span>Commit Grade</span>
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center font-mono text-xs text-muted">
              SELECT A SUBMISSION FROM THE VERIFICATION QUEUE TO INSPECT
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
