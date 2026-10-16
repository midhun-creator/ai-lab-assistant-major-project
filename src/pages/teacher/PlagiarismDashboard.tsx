import { useState, useEffect } from "react";
import {
  Loader2, CheckCircle2, AlertTriangle, ShieldAlert,
  ChevronDown, ArrowRight, RefreshCw, X
} from "lucide-react";
import { cn } from "../../lib/utils";
import { api } from "../../lib/api";
import type { PlagiarismResult, PlagiarismPair, Experiment } from "../../lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/Badge";

const COHORT = [
  { id: "u-101", name: "Midhun K.", code: "S-101" },
  { id: "u-102", name: "Alice Smith", code: "S-102" },
  { id: "u-103", name: "Bob Johnson", code: "S-103" },
  { id: "u-104", name: "Charlie Davis", code: "S-104" },
];

const STUDENT_NAMES: Record<string, string> = {
  "u-101": "Midhun K.",
  "u-102": "Alice Smith",
  "u-103": "Bob Johnson",
  "u-104": "Charlie Davis",
};

export default function PlagiarismDashboard() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExp, setSelectedExp] = useState<string>("exp-01");
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedPair, setSelectedPair] = useState<PlagiarismPair | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [decidingPairId, setDecidingPairId] = useState<string | null>(null);

  useEffect(() => {
    api.experiments.getByCourse("cs201").then(setExperiments);
  }, []);

  useEffect(() => {
    if (!selectedExp) return;
    setLoading(true);
    api.plagiarism.getByExperiment(selectedExp).then((r) => {
      setResult(r ?? null);
      setLoading(false);
    });
  }, [selectedExp]);

  const runAnalysis = async () => {
    setRunning(true);
    const r = await api.plagiarism.runAnalysis(selectedExp);
    setResult(r ?? null);
    setRunning(false);
  };

  const submitDecision = async (pair: PlagiarismPair, decision: "cleared" | "flagged") => {
    if (!result) return;
    setDecidingPairId(pair.id);
    await api.plagiarism.updateDecision(result.id, pair.id, decision, decisionNote);
    const r = await api.plagiarism.getByExperiment(selectedExp);
    setResult(r ?? null);
    setSelectedPair(null);
    setDecisionNote("");
    setDecidingPairId(null);
  };

  const getPairBetween = (idA: string, idB: string): PlagiarismPair | undefined => {
    if (!result) return undefined;
    return result.pairs.find(
      (p) =>
        (p.studentAId === idA && p.studentBId === idB) ||
        (p.studentAId === idB && p.studentBId === idA)
    );
  };

  const flaggedCount = result?.pairs.filter((p) => p.similarityScore >= 80).length ?? 0;
  const pendingCount = result?.pairs.filter((p) => p.teacherDecision === "pending").length ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      {/* Header */}
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 blueprint-grid">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            ACADEMIC INTEGRITY ENGINE // AST TOKEN NORMALIZATION
          </div>
          <h1 className="font-serif text-3xl text-foreground">Plagiarism &amp; AST Similarity Matrix</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedExp}
              onChange={(e) => setSelectedExp(e.target.value)}
              className="appearance-none bg-surface border border-border rounded-md pl-3.5 pr-9 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary-600"
            >
              {experiments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>
          <Button variant="primary" size="md" onClick={runAnalysis} disabled={running}>
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>{running ? "Analyzing AST..." : "Re-Run AST Scan"}</span>
          </Button>
        </div>
      </div>

      {/* Telemetry Strip */}
      {result && (
        <div className="bg-surface border border-border rounded-card shadow-subtle grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <div className="p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">PAIRS EVALUATED</span>
            <p className="font-mono text-2xl font-semibold text-foreground mt-1">0{result.pairs.length}</p>
            <span className="font-mono text-[11px] text-muted">O(N²) AST SUBTREE COMPARISON</span>
          </div>
          <div className="p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">HIGH SIMILARITY (≥80%)</span>
            <p className="font-mono text-2xl font-semibold text-error mt-1">0{flaggedCount}</p>
            <span className="font-mono text-[11px] text-muted">IDENTIFIER-INVARIANT MATCH</span>
          </div>
          <div className="p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">PENDING ADJUDICATION</span>
            <p className="font-mono text-2xl font-semibold text-warning mt-1">0{pendingCount}</p>
            <span className="font-mono text-[11px] text-muted">REQUIRES FACULTY VERDICT</span>
          </div>
        </div>
      )}

      {loading ? (
        <Card className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted" />
        </Card>
      ) : result ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left 6 Cols: True 2D N x N Interactive Cohort Heatmap */}
          <Card className="lg:col-span-6 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  2D COHORT TOPOLOGY
                </span>
                <h2 className="font-serif text-xl text-foreground">N×N Similarity Heatmap</h2>
              </div>
              <span className="font-mono text-[10px] text-muted">CLICK CELL TO INSPECT</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-xs">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-[10px] text-muted">STUDENT</th>
                    {COHORT.map((col) => (
                      <th key={col.id} className="p-2 text-center text-[10px] text-foreground">
                        {col.code}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COHORT.map((row) => (
                    <tr key={row.id}>
                      <td className="p-2 font-medium text-foreground text-xs whitespace-nowrap">
                        {row.code} · {row.name.split(" ")[0]}
                      </td>
                      {COHORT.map((col) => {
                        if (row.id === col.id) {
                          return (
                            <td key={col.id} className="p-1.5">
                              <div className="h-12 rounded bg-surface-elevated border border-border flex items-center justify-center text-[10px] text-muted">
                                —
                              </div>
                            </td>
                          );
                        }
                        const pair = getPairBetween(row.id, col.id);
                        const score = pair?.similarityScore ?? 14;
                        const isHigh = score >= 80;
                        const isMed = score >= 50 && score < 80;
                        return (
                          <td key={col.id} className="p-1.5">
                            <button
                              disabled={!pair?.snippetA}
                              onClick={() => {
                                if (pair) {
                                  setSelectedPair(pair);
                                  setDecisionNote(pair.teacherNote ?? "");
                                }
                              }}
                              className={cn(
                                "w-full h-12 rounded border flex flex-col items-center justify-center transition-all",
                                isHigh
                                  ? "bg-error/15 border-error/40 text-error font-bold hover:bg-error/25"
                                  : isMed
                                  ? "bg-warning/15 border-warning/40 text-warning font-semibold hover:bg-warning/25"
                                  : "bg-success/10 border-success/25 text-success",
                                !pair?.snippetA && "cursor-default opacity-75"
                              )}
                            >
                              <span>{score}%</span>
                              {pair?.snippetA && (
                                <span className="text-[8px] uppercase tracking-wider">DIFF</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between font-mono text-[10px] text-muted">
              <span>GREEN &lt; 50% (NORMAL)</span>
              <span>AMBER 50–79% (REVIEW)</span>
              <span>RED ≥ 80% (AST MATCH)</span>
            </div>
          </Card>

          {/* Right 6 Cols: Pairwise Ledger & AST Token Diff */}
          <Card className="lg:col-span-6 !p-0 overflow-hidden">
            <div className="bg-surface-soft border-b border-border px-5 py-3.5 flex items-center justify-between">
              <h2 className="font-serif text-lg text-foreground">Flagged Submission Pairs</h2>
              <span className="font-mono text-[10px] text-muted">
                SCAN TIME: {new Date(result.runAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="divide-y divide-border">
              {result.pairs
                .sort((a, b) => b.similarityScore - a.similarityScore)
                .map((pair) => (
                  <div
                    key={pair.id}
                    className="p-4 hover:bg-surface-soft transition-colors flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {STUDENT_NAMES[pair.studentAId] ?? pair.studentAId} ↔{" "}
                        {STUDENT_NAMES[pair.studentBId] ?? pair.studentBId}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <StatusBadge
                          status={
                            pair.similarityScore >= 80
                              ? `${pair.similarityScore}% AST Match (Flagged)`
                              : `${pair.similarityScore}% Similarity`
                          }
                        />
                        {pair.teacherDecision && (
                          <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-muted">
                            VERDICT: {pair.teacherDecision}
                          </span>
                        )}
                      </div>
                    </div>
                    {pair.snippetA && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPair(pair);
                          setDecisionNote(pair.teacherNote ?? "");
                        }}
                      >
                        <span>Inspect AST</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </Card>
        </div>
      ) : null}

      {/* Advisory Notice */}
      <Card className="p-4 bg-surface-soft flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          <strong className="text-foreground font-mono uppercase">AST Normalization Note:</strong> Identifier renaming (e.g., renaming <code className="font-mono text-foreground">name</code> to <code className="font-mono text-foreground">n</code>) produces identical abstract syntax trees. High structural similarity in introductory exercises requires human faculty verification before disciplinary flagging.
        </p>
      </Card>

      {/* Side-by-Side AST Token Comparison Modal */}
      <AnimatePresence>
        {selectedPair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ide-bg/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              className="bg-surface rounded-card border border-border shadow-modal max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-border bg-surface-soft">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    SIDE-BY-SIDE AST TOKEN INSPECTOR
                  </span>
                  <h2 className="font-serif text-2xl text-foreground">
                    {STUDENT_NAMES[selectedPair.studentAId]} vs. {STUDENT_NAMES[selectedPair.studentBId]} (
                    {selectedPair.similarityScore}% Structural Match)
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedPair(null)}
                  className="p-1.5 text-muted hover:text-foreground rounded border border-transparent hover:border-border"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Token Mapping Banner */}
              <div className="px-6 py-2.5 bg-surface-elevated border-b border-border flex flex-wrap items-center gap-4 font-mono text-xs">
                <span className="text-muted uppercase text-[10px]">DETECTED IDENTIFIER ALIASES:</span>
                <span className="px-2 py-0.5 rounded bg-surface border border-border text-foreground">
                  id_01: <strong className="text-primary-600">name</strong> ↔ <strong className="text-error">n</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-surface border border-border text-foreground">
                  id_02: <strong className="text-primary-600">age</strong> ↔ <strong className="text-error">a</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-5">
                  <div className="font-mono text-xs font-semibold text-foreground mb-2">
                    BUFFER A // {STUDENT_NAMES[selectedPair.studentAId]}
                  </div>
                  <div className="bg-ide-bg text-slate-200 p-4 rounded border border-border-dark text-xs font-mono">
                    <pre className="whitespace-pre-wrap leading-relaxed">{selectedPair.snippetA}</pre>
                  </div>
                </div>
                <div className="p-5">
                  <div className="font-mono text-xs font-semibold text-foreground mb-2">
                    BUFFER B // {STUDENT_NAMES[selectedPair.studentBId]}
                  </div>
                  <div className="bg-ide-bg text-slate-200 p-4 rounded border border-border-dark text-xs font-mono">
                    <pre className="whitespace-pre-wrap leading-relaxed">{selectedPair.snippetB}</pre>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-border bg-surface-soft space-y-3">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-muted">
                  FACULTY ADJUDICATION REMARK
                </label>
                <textarea
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  rows={2}
                  className="w-full bg-surface border border-border rounded-md p-3 text-xs text-foreground focus:outline-none focus:border-primary-600"
                  placeholder="Record verification note..."
                />
                <div className="flex gap-3">
                  <Button
                    variant="success"
                    className="flex-1"
                    onClick={() => submitDecision(selectedPair, "cleared")}
                    disabled={decidingPairId === selectedPair.id}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Clear Pair (Coincidental Structure)</span>
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => submitDecision(selectedPair, "flagged")}
                    disabled={decidingPairId === selectedPair.id}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Flag for Academic Review</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
