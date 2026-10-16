import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Timer, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight,
  Maximize2, ShieldAlert, Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { api, CURRENT_USER } from "../lib/api";
import type { Exam, ExamQuestion, ExamViolation } from "../lib/types";

const MAX_VIOLATIONS = 3;

function useTimer(durationSeconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(ref.current!);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current!);
  }, []);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return { remaining, formatted: `${mm}:${ss}` };
}

export default function ExamMode() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{ score: number; total: number } | null>(null);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [violations, setViolations] = useState<ExamViolation[]>([]);
  const [warningVisible, setWarningVisible] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  useEffect(() => {
    if (!examId) return;
    api.exams.getById(examId).then(e => {
      setExam(e ?? null);
      setLoading(false);
    });
  }, [examId]);

  const addViolation = useCallback((type: ExamViolation["type"], description: string) => {
    const v: ExamViolation = {
      id: `v-${Date.now()}`,
      type,
      timestamp: new Date().toISOString(),
      description
    };
    setViolations(prev => {
      const updated = [...prev, v];
      if (updated.length >= MAX_VIOLATIONS) {
        // Auto-submit
        setTimeout(() => handleSubmit(updated), 500);
      }
      return updated;
    });
    setWarningMsg(description);
    setWarningVisible(true);
    setTimeout(() => setWarningVisible(false), 3500);
  }, []);

  // Tab-switch / focus-loss detection
  useEffect(() => {
    if (!started || submitted) return;

    const handleVisibility = () => {
      if (document.hidden) {
        addViolation("tab_switch", "⚠️ Tab switch detected. This has been logged.");
      }
    };
    const handleBlur = () => {
      addViolation("focus_loss", "⚠️ Window focus lost. Please keep this tab active.");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [started, submitted, addViolation]);

  // Prevent context menu and copy-paste in exam area
  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    addViolation("right_click", "⚠️ Right-click is disabled during exam.");
  };

  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    addViolation("copy_paste", "⚠️ Copy/paste is restricted during exam.");
  };

  const handleSubmit = async (finalViolations?: ExamViolation[]) => {
    if (!exam) return;
    setConfirmSubmit(false);
    const attempt = await api.exams.submitAttempt({
      examId: exam.id,
      studentId: CURRENT_USER.id,
      startedAt: new Date().toISOString(),
      answers,
      violations: finalViolations ?? violations
    });
    setSubmittedResult({ score: attempt.score ?? 0, total: exam.totalMarks });
    setSubmitted(true);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().catch(() => {});
    setStarted(true);
  };

  const { formatted: timeFormatted, remaining: timeRemaining } = useTimer(
    (exam?.duration ?? 60) * 60,
    () => { if (started && !submitted) handleSubmit(); }
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-ide-bg">
      <div className="text-white text-xl animate-pulse">Loading Exam...</div>
    </div>
  );

  if (!exam) return (
    <div className="h-screen flex items-center justify-center bg-ide-bg text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Exam Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline">Go Back</button>
      </div>
    </div>
  );

  // --- SUBMITTED RESULT ---
  if (submitted && submittedResult) {
    const pct = Math.round((submittedResult.score / submittedResult.total) * 100);
    return (
      <div className="h-screen bg-ide-bg flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-ide-surface rounded-2xl shadow-2xl p-10 max-w-md w-full text-center border border-slate-700">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-1">Exam Submitted</h2>
          <p className="text-slate-400 mb-6">{exam.title}</p>
          <div className="text-5xl font-bold text-white mb-2">{pct}%</div>
          <div className="text-slate-400 mb-6">{submittedResult.score} / {submittedResult.total} marks (MCQ auto-graded)</div>
          {violations.length > 0 && (
            <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl p-4 mb-6 text-left">
              <p className="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> {violations.length} Violation(s) Logged
              </p>
              {violations.map((v, i) => (
                <p key={i} className="text-amber-300 text-xs">{new Date(v.timestamp).toLocaleTimeString()} — {v.type.replace(/_/g, ' ')}</p>
              ))}
            </div>
          )}
          <button onClick={() => navigate("/dashboard")}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl font-semibold transition-colors">
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // --- START SCREEN ---
  if (!started) {
    return (
      <div className="h-screen bg-ide-bg flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-ide-surface rounded-2xl shadow-2xl p-10 max-w-lg w-full border border-slate-700 text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{exam.title}</h2>
          <div className="flex justify-center gap-6 text-slate-400 text-sm mb-6">
            <span><strong className="text-white">{exam.duration} min</strong> duration</span>
            <span><strong className="text-white">{exam.totalMarks}</strong> marks</span>
            <span><strong className="text-white">{exam.questions.length}</strong> questions</span>
          </div>
          <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 mb-6 text-left space-y-2">
            <p className="text-amber-400 font-semibold text-sm">Exam Rules</p>
            <ul className="text-amber-200/80 text-xs space-y-1 list-disc list-inside">
              <li>Exam will enter fullscreen. Do not switch tabs.</li>
              <li>Tab switching and focus loss are logged as violations.</li>
              <li>After {MAX_VIOLATIONS} violations, exam auto-submits.</li>
              <li>Copy-paste and right-click are restricted.</li>
              <li>Timer starts immediately when you enter the exam.</li>
            </ul>
          </div>
          <button onClick={enterFullscreen}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
            <Maximize2 className="w-4 h-4" />
            Enter Exam (Fullscreen)
          </button>
          <button onClick={() => navigate(-1)} className="mt-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  const q: ExamQuestion = exam.questions[currentQ];

  return (
    <div
      className="h-screen bg-ide-bg flex flex-col select-none"
      onContextMenu={preventContextMenu}
      onCopy={preventCopyPaste}
      onCut={preventCopyPaste}
      onPaste={preventCopyPaste}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-ide-surface border-b border-slate-700 shrink-0">
        <div>
          <h1 className="text-white font-bold">{exam.title}</h1>
          <p className="text-slate-400 text-xs">Q {currentQ + 1} of {exam.questions.length}</p>
        </div>
        <div className="flex items-center gap-4">
          {violations.length > 0 && (
            <div className="flex items-center gap-1.5 text-amber-400 text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              {violations.length}/{MAX_VIOLATIONS} Violations
            </div>
          )}
          <div className={cn(
            "font-mono text-xl font-bold px-4 py-1.5 rounded-lg",
            timeRemaining < 300 ? "text-red-400 bg-ide-elevated-900/30 animate-pulse" : "text-white bg-slate-700"
          )}>
            <Timer className="w-4 h-4 inline mr-1.5 mb-0.5" />
            {timeFormatted}
          </div>
          <button onClick={() => setConfirmSubmit(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors">
            <Send className="w-4 h-4" /> Submit Exam
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question Navigation Sidebar */}
        <div className="w-64 bg-ide-surface border-r border-slate-700 p-4 overflow-y-auto shrink-0">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Questions</p>
          <div className="grid grid-cols-4 gap-2">
            {exam.questions.map((qq, i) => (
              <button key={qq.id} onClick={() => setCurrentQ(i)}
                className={cn(
                  "h-10 w-10 rounded-lg font-bold text-sm transition-colors",
                  currentQ === i ? "bg-primary-600 text-white" :
                  answers[qq.id] ? "bg-emerald-700/60 text-emerald-200" :
                  "bg-slate-700 text-slate-300 hover:bg-slate-600"
                )}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-2 text-xs">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary-600"></div><span className="text-slate-400">Current</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-700/60"></div><span className="text-slate-400">Answered</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-700"></div><span className="text-slate-400">Unanswered</span></div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={q.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-700 text-slate-300">{q.type.replace(/_/g, " ")}</span>
                <span className="text-xs text-slate-400">{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
              </div>

              <h2 className="text-xl text-white font-semibold mb-6 leading-relaxed">{currentQ + 1}. {q.text}</h2>

              {q.type === "multiple_choice" && q.options && (
                <div className="space-y-3">
                  {q.options.map((opt, i) => (
                    <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all font-medium",
                        answers[q.id] === opt
                          ? "border-primary-500 bg-primary-900/30 text-white"
                          : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                      )}>
                      <span className="text-slate-500 mr-3 font-mono">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.type === "short_answer" && (
                <textarea
                  value={answers[q.id] ?? ""}
                  onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  rows={6}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 resize-none focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="Type your answer here..."
                />
              )}

              {q.type === "code" && (
                <textarea
                  value={answers[q.id] ?? ""}
                  onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  rows={12}
                  className="w-full bg-ide-bg border border-slate-700 rounded-xl p-4 text-slate-200 resize-none focus:outline-none focus:border-primary-500 font-mono text-sm transition-colors"
                  placeholder="# Write your code here..."
                />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button onClick={() => setCurrentQ(c => Math.max(0, c - 1))} disabled={currentQ === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded-xl font-semibold transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-slate-400 text-sm">{Object.keys(answers).length} / {exam.questions.length} answered</span>
                <button onClick={() => setCurrentQ(c => Math.min(exam.questions.length - 1, c + 1))} disabled={currentQ === exam.questions.length - 1}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white rounded-xl font-semibold transition-colors">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Violation Warning Toast */}
      <AnimatePresence>
        {warningVisible && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-900 border border-amber-600 text-amber-200 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{warningMsg}</span>
            <span className="ml-2 text-xs text-amber-400">Violations: {violations.length}/{MAX_VIOLATIONS}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Submit Modal */}
      <AnimatePresence>
        {confirmSubmit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-ide-surface border border-slate-700 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Submit Exam?</h3>
              <p className="text-slate-400 text-sm mb-6">
                You have answered {Object.keys(answers).length} of {exam.questions.length} questions.
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmSubmit(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl font-semibold transition-colors">
                  Continue Exam
                </button>
                <button onClick={() => handleSubmit()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-semibold transition-colors">
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
