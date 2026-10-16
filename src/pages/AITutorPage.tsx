import { useState, useRef, useEffect } from "react";
import { 
  Code2, 
  Bug, 
  Lightbulb, 
  HelpCircle, 
  Send,
  Clock,
  MessageSquare,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  Mic,
  Radio
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { api } from "../lib/api";
import type { Experiment } from "../lib/types";
import { AIRobot } from "../components/ui/AIRobot";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";

type AIMsg = { role: "user" | "ai"; content: string };
type VivaQ = { q: string; a: string; keywords: string[]; revealed: boolean };
type QuizQ = { q: string; options: string[]; correct: number; selected: number | null };

const MOCK_HISTORY = [
  { id: 1, title: "Control flow & range() bounds", course: "CS201", time: "TODAY // 14:35", exp: "Experiment 01" },
  { id: 2, title: "List slicing step parameters", course: "CS301", time: "YESTERDAY", exp: "Experiment 03" },
  { id: 3, title: "Viva Drill — Standard I/O & Casting", course: "CS201", time: "OCT 10", exp: "Experiment 01" },
];

const QUICK_ACTIONS = [
  { id: "explain", icon: Code2, label: "Trace Execution" },
  { id: "error",   icon: Bug,   label: "Audit Syntax & Types" },
  { id: "hint",    icon: Lightbulb, label: "Request Socratic Hint" },
  { id: "viva",    icon: HelpCircle, label: "Generate Viva Prompts" },
];

function getMockResponse(actionId: string, experimentTitle: string): string {
  const responses: Record<string, string> = {
    explain: `EXECUTION TRACE — ${experimentTitle}:\n\n1. input('Enter name: ') reads a line from standard input and returns a str value.\n2. int(input(...)) parses the string into a signed integer object.\n3. print(f'Hello, {name}!') interpolates the binding into standard output.\n\nINVARIANT: input() always yields str; explicit type casting is required for arithmetic comparisons.`,
    error:   `COMMON FAULT PATTERN:\n\n[SyntaxError] Missing compound statement delimiter ':'\n  for i in range(5)\n      print(i)\n\n[Fix] Terminate compound headers (if, for, while, def) with a colon:\n  for i in range(5):\n      print(i)`,
    hint:    `SOCRATIC HINT:\n\nConsider how Python sequences handle slice step parameters: seq[start:stop:step].\nWhat happens to the traversal direction when the step argument is -1? Test this in the Lab Workspace.`,
    viva:    `ORAL EXAMINATION PROMPTS — ${experimentTitle}:\n\n01. What return type does input() guarantee, and why is explicit casting necessary?\n02. How do formatted string literals (f-strings) differ from str.format() at runtime?\n03. Which built-in exception is raised when int('abc') is evaluated?\n04. Contrast side-effect output via print() with value propagation via return.\n05. What is the purpose of the __name__ == '__main__' module guard?`,
  };
  return responses[actionId] ?? `DIAGNOSTIC GUIDANCE (${experimentTitle}):\nBreak the problem into input acquisition, type validation, and formatted output.`;
}

const VIVA_QUESTIONS: VivaQ[] = [
  { q: "What data type does the input() function always return?", a: "input() always returns a string (str), regardless of numeric characters typed by the user. Explicit casting via int() or float() is required.", keywords: ["str", "string", "int", "cast"], revealed: false },
  { q: "What is an f-string in Python? Provide a concise example.", a: "A formatted string literal prefixed with f/F that evaluates embedded expressions at runtime: name = 'Midhun'; print(f'Hello, {name}!')", keywords: ["format", "literal", "{", "expression"], revealed: false },
  { q: "What exception is raised when int('hello') is evaluated?", a: "ValueError: invalid literal for int() with base 10. It should be caught using a try/except ValueError block.", keywords: ["valueerror", "try", "except", "base"], revealed: false },
  { q: "Contrast print() with return inside a Python function.", a: "print() writes a string representation to standard output and returns None. return terminates function execution and passes an object back to the caller.", keywords: ["stdout", "none", "caller", "value"], revealed: false },
  { q: "What does the if __name__ == '__main__': guard accomplish?", a: "It ensures the enclosed block executes only when the file is invoked as the entry-point script, preventing execution when imported as a module.", keywords: ["import", "module", "script", "entry"], revealed: false },
];

const QUIZ_QUESTIONS: QuizQ[] = [
  { q: "What is the output of print(type(5))?", options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'num'>"], correct: 0, selected: null },
  { q: "Which expression converts the string '42' to an integer?", options: ["str(42)", "int('42')", "float('42')", "num('42')"], correct: 1, selected: null },
  { q: "What type does input() return by default?", options: ["int", "float", "str", "bool"], correct: 2, selected: null },
  { q: "Which of the following is a valid Python f-string?", options: ['f"Hello {name}"', '"Hello " + name', '"Hello %s" % name', "format('Hello')"], correct: 0, selected: null },
  { q: "Which exception is raised by int('abc')?", options: ["TypeError", "ValueError", "NameError", "SyntaxError"], correct: 1, selected: null },
];

export default function AITutorPage() {
  const [tab, setTab] = useState<"chat" | "viva" | "quiz" | "history">("chat");
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExp, setSelectedExp] = useState<string>("exp-01");
  const [messages, setMessages] = useState<AIMsg[]>([
    {
      role: "ai",
      content:
        "SOCRATIC TUTOR INITIALIZED\nSelect an experiment context above, then issue a diagnostic command or question below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [vivaQs, setVivaQs] = useState<VivaQ[]>(VIVA_QUESTIONS);
  const [activeVivaIdx, setActiveVivaIdx] = useState(0);
  const [vivaAnswer, setVivaAnswer] = useState("");
  const [vivaRecording, setVivaRecording] = useState(false);
  const [vivaEval, setVivaEval] = useState<{ score: number; depth: number; precision: number; remark: string } | null>(null);
  const [quizQs, setQuizQs] = useState<QuizQ[]>(QUIZ_QUESTIONS);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.experiments.getByCourse("cs201").then(setExperiments);
  }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentExp = experiments.find((e) => e.id === selectedExp);

  const send = (text: string, actionId?: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const reply = actionId
        ? getMockResponse(actionId, currentExp?.title ?? "Experiment 01")
        : `SOCRATIC GUIDANCE (${currentExp?.title ?? "CS201"}):\nQuery: "${text}"\n\nVerify your assumptions by tracing variable state line-by-line before executing in the workspace.`;
      setMessages((m) => [...m, { role: "ai", content: reply }]);
      setLoading(false);
    }, 550);
  };

  const evaluateVivaResponse = () => {
    if (!vivaAnswer.trim()) return;
    const target = vivaQs[activeVivaIdx];
    const lower = vivaAnswer.toLowerCase();
    const matched = target.keywords.filter((k) => lower.includes(k)).length;
    const score = Math.min(10, Math.max(6, 5 + matched * 2));
    setVivaEval({
      score,
      depth: Math.min(100, score * 10),
      precision: Math.min(100, (score - 1) * 10 + 5),
      remark:
        matched >= 2
          ? "Strong technical articulation. Key runtime invariants and type semantics were accurately referenced."
          : "Partially complete. Incorporate explicit type names (str, ValueError) and runtime behavior in your oral response.",
    });
  };

  const toggleSimulatedDictation = () => {
    if (vivaRecording) {
      setVivaRecording(false);
    } else {
      setVivaRecording(true);
      setTimeout(() => {
        setVivaAnswer(vivaQs[activeVivaIdx].a);
        setVivaRecording(false);
      }, 1400);
    }
  };

  const resetQuiz = () => {
    setQuizQs(QUIZ_QUESTIONS.map((q) => ({ ...q, selected: null })));
    setQuizSubmitted(false);
  };
  const quizScore = quizQs.filter((q) => q.selected === q.correct).length;

  const TABS = [
    { id: "chat" as const, label: "Diagnostic Chat", icon: MessageSquare },
    { id: "viva" as const, label: "Oral Viva Simulator", icon: Radio },
    { id: "quiz" as const, label: "Concept Check", icon: BrainCircuit },
    { id: "history" as const, label: "Session Log", icon: Clock },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 blueprint-grid">
        <div className="flex items-center gap-4">
          <AIRobot size={42} />
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
              NON-SOLVING PEDAGOGICAL ENGINE
            </div>
            <h1 className="font-serif text-3xl text-foreground">Socratic Lab Tutor</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase text-muted">CONTEXT:</span>
          <div className="relative">
            <select
              value={selectedExp}
              onChange={(e) => setSelectedExp(e.target.value)}
              className="appearance-none bg-surface border border-border rounded-md pl-3 pr-8 py-1.5 font-mono text-xs text-foreground focus:border-primary-600 focus:outline-none"
            >
              {experiments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-all border-b-2 -mb-px",
              tab === id
                ? "border-foreground text-foreground font-semibold"
                : "border-transparent text-muted hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {tab === "chat" && (
        <Card
          className="!p-0 overflow-hidden flex flex-col"
          style={{ height: "calc(100vh - 320px)", minHeight: 420 }}
        >
          <div className="flex flex-wrap gap-2 p-3.5 border-b border-border bg-surface-soft">
            {QUICK_ACTIONS.map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.id}
                  onClick={() => send(qa.label, qa.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-elevated text-foreground border border-border rounded-md font-mono text-xs transition-colors shadow-subtle"
                >
                  <Icon className="w-3.5 h-3.5 text-primary-600" />
                  <span>{qa.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded flex items-center justify-center shrink-0 font-mono text-[10px] font-semibold",
                    msg.role === "user"
                      ? "bg-foreground text-surface"
                      : "bg-ide-panel text-white"
                  )}
                >
                  {msg.role === "user" ? "YOU" : <AIRobot size={20} />}
                </div>
                <div
                  className={cn(
                    "rounded-md px-4 py-3 max-w-[80%] border",
                    msg.role === "user"
                      ? "bg-foreground text-surface border-foreground"
                      : "bg-surface-soft border-border text-foreground"
                  )}
                >
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                    {msg.content}
                  </pre>
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-3.5 border-t border-border bg-surface-soft flex gap-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder="Ask a technical question about this experiment..."
              className="flex-1 bg-surface border border-border rounded-md px-3.5 py-2 text-sm text-foreground focus:border-primary-600 focus:outline-none"
            />
            <Button onClick={() => send(input)} disabled={!input.trim() || loading}>
              <Send className="w-4 h-4" />
              <span>Query</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Oral Viva Simulator Tab */}
      {tab === "viva" && (
        <div className="space-y-6">
          {/* Obsidian Live Viva Examiner Instrument */}
          <div className="obsidian-surface rounded-card border border-border-dark p-6 text-slate-200 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-dark pb-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block">
                    INTERACTIVE ORAL VIVA EXAMINER // {currentExp?.id?.toUpperCase() || "EXP-01"}
                  </span>
                  <h2 className="font-serif text-2xl text-white">
                    Question 0{activeVivaIdx + 1} of 0{vivaQs.length}
                  </h2>
                </div>
              </div>

              {/* 24-Bar Neural Audio Waveform Visualizer */}
              <div className="flex items-center gap-1 h-8 px-3 py-1 rounded bg-ide-bg border border-border-dark">
                {Array.from({ length: 20 }).map((_, idx) => {
                  const baseH = ((idx * 7) % 16) + 6;
                  return (
                    <motion.span
                      key={idx}
                      animate={{
                        height: vivaRecording ? [6, 22, 8, 18, 6] : baseH,
                      }}
                      transition={{
                        duration: 0.7,
                        repeat: vivaRecording ? Infinity : 0,
                        delay: idx * 0.04,
                      }}
                      className={cn(
                        "w-1 rounded-full transition-colors",
                        vivaRecording ? "bg-emerald-400" : "bg-primary-400/60"
                      )}
                      style={{ height: baseH }}
                    />
                  );
                })}
                <span className="font-mono text-[10px] text-slate-400 ml-2">
                  {vivaRecording ? "LISTENING..." : "READY"}
                </span>
              </div>
            </div>

            {/* Prompt Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {vivaQs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveVivaIdx(idx);
                    setVivaAnswer("");
                    setVivaEval(null);
                  }}
                  className={cn(
                    "px-3 py-1 rounded font-mono text-xs border transition-colors",
                    activeVivaIdx === idx
                      ? "bg-white text-ide-bg font-semibold border-white"
                      : "bg-ide-surface text-slate-400 border-border-dark hover:text-white"
                  )}
                >
                  PROMPT 0{idx + 1}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-md bg-ide-bg border border-border-dark">
              <div className="font-mono text-[10px] uppercase text-primary-400 mb-1">
                EXAMINER PROMPT
              </div>
              <p className="text-base font-medium text-white">
                {vivaQs[activeVivaIdx].q}
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                value={vivaAnswer}
                onChange={(e) => setVivaAnswer(e.target.value)}
                rows={3}
                placeholder="Type your oral defense or click 'Dictate Response' to simulate voice capture..."
                className="w-full bg-ide-surface border border-border-dark rounded-md p-3.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-primary-400"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={toggleSimulatedDictation}
                  className={cn(
                    "inline-flex items-center gap-2 px-3.5 py-2 rounded-md font-mono text-xs border transition-colors",
                    vivaRecording
                      ? "bg-red-950/80 text-red-300 border-red-600"
                      : "bg-ide-surface hover:bg-ide-elevated text-slate-200 border-border-dark"
                  )}
                >
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{vivaRecording ? "Capturing Voice..." : "Dictate Response (Voice Sim)"}</span>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setVivaQs((prev) =>
                        prev.map((v, j) =>
                          j === activeVivaIdx ? { ...v, revealed: !v.revealed } : v
                        )
                      )
                    }
                  >
                    <span>{vivaQs[activeVivaIdx].revealed ? "Hide Reference Key" : "Reveal Reference Key"}</span>
                  </Button>
                  <Button variant="primary" size="sm" onClick={evaluateVivaResponse}>
                    <span>Evaluate Defense</span>
                  </Button>
                </div>
              </div>
            </div>

            {vivaEval && (
              <div className="p-4 rounded-md bg-ide-surface border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-emerald-400 font-semibold">
                    RUBRIC EVALUATION // {vivaEval.score} / 10 PTS
                  </span>
                  <StatusBadge status="Verified" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{vivaEval.remark}</p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                      <span>CONCEPTUAL DEPTH</span>
                      <span>{vivaEval.depth}%</span>
                    </div>
                    <div className="h-1.5 bg-ide-bg rounded overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${vivaEval.depth}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                      <span>TERMINOLOGY PRECISION</span>
                      <span>{vivaEval.precision}%</span>
                    </div>
                    <div className="h-1.5 bg-ide-bg rounded overflow-hidden">
                      <div className="h-full bg-primary-400" style={{ width: `${vivaEval.precision}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {vivaQs[activeVivaIdx].revealed && (
              <div className="p-4 rounded-md bg-emerald-950/30 border border-emerald-700/50 text-xs font-mono text-emerald-200 leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline mr-2 mb-0.5" />
                REFERENCE KEY: {vivaQs[activeVivaIdx].a}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Tab */}
      {tab === "quiz" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted text-xs font-mono uppercase">
              5-ITEM CONCEPT CHECK // {currentExp?.title ?? "PYTHON I/O"}
            </p>
            <Button variant="outline" size="sm" onClick={resetQuiz}>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          </div>

          {quizQs.map((qz, i) => (
            <Card key={i} className="p-5">
              <p className="font-medium text-sm text-foreground mb-3">
                <span className="font-mono text-xs text-muted mr-2">0{i + 1}.</span>
                {qz.q}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {qz.options.map((opt, j) => {
                  const isSelected = qz.selected === j;
                  const isCorrect = j === qz.correct;
                  const showResult = quizSubmitted;
                  return (
                    <button
                      key={j}
                      onClick={() =>
                        !quizSubmitted &&
                        setQuizQs((prev) =>
                          prev.map((q, k) => (k === i ? { ...q, selected: j } : q))
                        )
                      }
                      disabled={quizSubmitted}
                      className={cn(
                        "text-left p-3 rounded-md border text-xs font-mono transition-colors",
                        showResult && isCorrect
                          ? "border-success bg-success/10 text-success font-semibold"
                          : showResult && isSelected && !isCorrect
                          ? "border-error bg-error/10 text-error"
                          : isSelected
                          ? "border-foreground bg-surface-elevated text-foreground font-semibold"
                          : "border-border bg-surface text-foreground hover:bg-surface-soft"
                      )}
                    >
                      <span className="text-muted mr-2">{String.fromCharCode(65 + j)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}

          {!quizSubmitted ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setQuizSubmitted(true)}
              disabled={quizQs.some((q) => q.selected === null)}
            >
              Evaluate Concept Check
            </Button>
          ) : (
            <Card className="p-6 text-center space-y-2">
              <div className="font-mono text-3xl font-semibold text-foreground">
                SCORE: {quizScore} / 5
              </div>
              <p className="text-xs text-muted">
                {quizScore >= 4
                  ? "Mastery verified. Proceed to the Lab Workspace."
                  : "Review theoretical notes in the experiment manual and retry."}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <Card className="divide-y divide-border">
          {MOCK_HISTORY.map((h) => (
            <button
              key={h.id}
              onClick={() => setTab("chat")}
              className="w-full text-left p-4 hover:bg-surface-soft transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <AIRobot size={28} />
                <div>
                  <p className="font-medium text-sm text-foreground">{h.title}</p>
                  <p className="font-mono text-[11px] text-muted mt-0.5">
                    {h.course} // {h.exp}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-muted">{h.time}</span>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
