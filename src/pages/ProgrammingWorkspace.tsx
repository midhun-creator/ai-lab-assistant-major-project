import { useState, useRef, useEffect } from "react";
import { useSearchParams, useParams, Link, useNavigate } from "react-router-dom";
import { api, CURRENT_USER } from "../lib/api";
import { 
  Play, 
  Send, 
  UploadCloud, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  FileCode, 
  FolderOpen, 
  Folder,
  Terminal as TerminalIcon,
  Code2,
  Lightbulb,
  Bug,
  HelpCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  FileCheck,
  Cpu,
  SkipBack,
  StepBack,
  StepForward,
  SkipForward,
  Sparkles
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AIRobot } from "../components/ui/AIRobot";

const DEFAULT_FILES: Record<string, string> = {
  "main.py": `# Experiment 01: Basic I/O and Data Types
# Course: Python Programming (CS201)

def greet_user():
    name = input("Enter your name: ")
    age = int(input("Enter your age: "))
    
    print(f"Hello, {name}!")
    print(f"You are {age} years old.")
    
    if age >= 18:
        print("You are an adult.")
    else:
        print("You are a minor.")

if __name__ == "__main__":
    greet_user()
`,
  "utils.py": `# Helper utilities for input validation

def parse_positive_int(raw: str) -> int:
    value = int(raw.strip())
    if value < 0:
        raise ValueError("Age cannot be negative")
    return value
`,
  "test_main.py": `# Local unit assertions for Experiment 01

def test_output_format():
    name = "Midhun"
    age = 20
    assert f"Hello, {name}!" == "Hello, Midhun!"
    assert f"You are {age} years old." == "You are 20 years old."
`,
};

const FILE_LIST = ["main.py", "utils.py", "test_main.py"];

// Time-Travel Memory & Execution Trace Steps
const TRACE_STEPS = [
  {
    step: 1,
    line: 16,
    frame: "__main__",
    action: "Entry point guard evaluated (__name__ == '__main__' is True)",
    locals: [{ name: "__name__", type: "str", val: "'__main__'", addr: "0x1004a0" }],
    stdout: "",
  },
  {
    step: 2,
    line: 5,
    frame: "greet_user()",
    action: "Read string token from standard input into identifier 'name'",
    locals: [
      { name: "name", type: "str", val: "'Midhun'", addr: "0x7f8b20" },
    ],
    stdout: "Enter your name: Midhun",
  },
  {
    step: 3,
    line: 6,
    frame: "greet_user()",
    action: "Parse stdin string '20' into base-10 integer object",
    locals: [
      { name: "name", type: "str", val: "'Midhun'", addr: "0x7f8b20" },
      { name: "age", type: "int", val: "20", addr: "0x7f8b98" },
    ],
    stdout: "Enter your name: Midhun\nEnter your age: 20",
  },
  {
    step: 4,
    line: 8,
    frame: "greet_user()",
    action: "Evaluate f-string interpolation and flush buffer to stdout",
    locals: [
      { name: "name", type: "str", val: "'Midhun'", addr: "0x7f8b20" },
      { name: "age", type: "int", val: "20", addr: "0x7f8b98" },
    ],
    stdout: "Enter your name: Midhun\nEnter your age: 20\nHello, Midhun!",
  },
  {
    step: 5,
    line: 11,
    frame: "greet_user()",
    action: "Branch predicate (age >= 18) evaluated to True → adult classification",
    locals: [
      { name: "name", type: "str", val: "'Midhun'", addr: "0x7f8b20" },
      { name: "age", type: "int", val: "20", addr: "0x7f8b98" },
      { name: "age >= 18", type: "bool", val: "True", addr: "0x100010" },
    ],
    stdout: "Enter your name: Midhun\nEnter your age: 20\nHello, Midhun!\nYou are 20 years old.\nYou are an adult.",
  },
];

const LeftSidebar = ({
  activeFile,
  setActiveFile,
  experiment,
}: {
  activeFile: string;
  setActiveFile: (f: string) => void;
  experiment: {
    title: string;
    objective: string;
    algorithm?: string;
    expectedOutput?: string;
  } | null;
}) => {
  const [mode, setMode] = useState<"spec" | "files">("spec");
  const [open, setOpen] = useState(true);

  return (
    <div className="h-full bg-ide-panel text-slate-300 text-xs select-none flex flex-col">
      <div className="flex border-b border-border-dark">
        <button
          onClick={() => setMode("spec")}
          className={cn(
            "flex-1 py-2.5 font-mono text-[10px] uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-1.5",
            mode === "spec"
              ? "border-primary-400 text-white bg-ide-surface"
              : "border-transparent text-slate-500 hover:text-slate-300"
          )}
        >
          <BookOpen className="w-3 h-3" />
          <span>Lab Spec</span>
        </button>
        <button
          onClick={() => setMode("files")}
          className={cn(
            "flex-1 py-2.5 font-mono text-[10px] uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-1.5",
            mode === "files"
              ? "border-primary-400 text-white bg-ide-surface"
              : "border-transparent text-slate-500 hover:text-slate-300"
          )}
        >
          <FileCode className="w-3 h-3" />
          <span>Buffers</span>
        </button>
      </div>

      {mode === "spec" ? (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 select-text">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
              01 // OBJECTIVE
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {experiment?.objective || "Loading specification..."}
            </p>
          </div>
          {experiment?.algorithm && (
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                02 // ALGORITHM
              </span>
              <pre className="font-mono text-[11px] text-slate-300 bg-ide-bg p-2.5 rounded border border-border-dark whitespace-pre-wrap leading-relaxed">
                {experiment.algorithm}
              </pre>
            </div>
          )}
          {experiment?.expectedOutput && (
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                03 // EXPECTED STDOUT
              </span>
              <pre className="font-mono text-[11px] text-emerald-300 bg-ide-bg p-2.5 rounded border border-border-dark whitespace-pre-wrap leading-relaxed">
                {experiment.expectedOutput}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-2">
            <button
              className="flex items-center space-x-1.5 w-full hover:text-white py-1 px-2 rounded transition-colors"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
              {open ? (
                <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="font-mono text-xs">experiment_01</span>
            </button>
            {open && (
              <div className="ml-4 mt-1 space-y-0.5">
                {FILE_LIST.map((fName) => (
                  <button
                    key={fName}
                    onClick={() => setActiveFile(fName)}
                    className={cn(
                      "flex items-center space-x-2 w-full py-1.5 px-2 rounded transition-colors text-left font-mono text-xs",
                      activeFile === fName
                        ? "bg-ide-elevated text-white border border-slate-700"
                        : "hover:bg-ide-surface text-slate-400 border border-transparent"
                    )}
                  >
                    <FileCode className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                    <span>{fName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CodeEditor = ({
  activeFile,
  code,
  setCode,
  activeTraceLine,
  showDiffLens,
  setShowDiffLens,
}: {
  activeFile: string;
  code: string;
  setCode: (c: string) => void;
  activeTraceLine: number | null;
  showDiffLens: boolean;
  setShowDiffLens: (v: boolean) => void;
}) => {
  const lines = code.split("\n");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updated = code.substring(0, start) + "    " + code.substring(end);
      setCode(updated);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      });
    }
  };

  return (
    <div className="h-full bg-ide-bg flex flex-col font-mono text-xs relative">
      <div className="flex items-center justify-between bg-ide-surface border-b border-border-dark px-4 py-2">
        <div className="flex items-center space-x-2">
          <FileCode className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-slate-200">{activeFile}</span>
          <span className="text-[10px] text-slate-500">UTF-8 // CPYTHON 3.11</span>
          {activeTraceLine && (
            <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px]">
              TRACE LINE {activeTraceLine}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowDiffLens(!showDiffLens)}
          className={cn(
            "px-2 py-0.5 rounded text-[10px] border transition-colors flex items-center gap-1",
            showDiffLens
              ? "bg-primary-900/60 text-primary-200 border-primary-500"
              : "bg-ide-elevated text-slate-400 border-slate-700 hover:text-white"
          )}
        >
          <Sparkles className="w-3 h-3 text-primary-400" />
          <span>{showDiffLens ? "Hide AST Guard Diff" : "Inspect AST Guard Diff"}</span>
        </button>
      </div>

      {/* Cursor-Style Inline Socratic Diff Overlay */}
      <AnimatePresence>
        {showDiffLens && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-ide-panel border-b border-primary-700/50 px-4 py-2.5 text-[11px] overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-primary-300 font-semibold uppercase tracking-wider text-[10px]">
                INLINE AST DIAGNOSTIC // LINE 6 (ValueError Guard)
              </span>
              <button
                onClick={() => setShowDiffLens(false)}
                className="text-slate-400 hover:text-white text-[10px]"
              >
                DISMISS [ESC]
              </button>
            </div>
            <div className="rounded border border-border-dark overflow-hidden font-mono text-[11px]">
              <div className="bg-red-950/40 text-red-300 px-3 py-1 border-b border-border-dark">
                -     age = int(input("Enter your age: "))
              </div>
              <div className="bg-emerald-950/40 text-emerald-300 px-3 py-1">
                +     try: age = int(input("Enter your age: "))
                {"\n"}+     except ValueError: return print("Invalid integer input")
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        <div className="bg-ide-bg text-slate-600 text-right pr-3 pl-2 py-4 select-none border-r border-border-dark min-w-[3.25rem] overflow-hidden">
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const isActive = activeTraceLine === lineNum;
            return (
              <div
                key={i}
                className={cn(
                  "leading-6 px-1 rounded-sm transition-colors",
                  isActive && "bg-emerald-500/20 text-emerald-300 font-bold"
                )}
              >
                {isActive ? `▶ ${lineNum}` : lineNum}
              </div>
            );
          })}
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-ide-bg text-slate-200 py-4 px-4 resize-none outline-none leading-6 overflow-auto caret-primary-400 selection:bg-primary-800/60 font-mono text-[13px]"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

type TerminalLine = { text: string; type: "output" | "error" | "info" | "input" };

const BottomExecutionDeck = ({
  lines,
  running,
  traceStepIdx,
  setTraceStepIdx,
  bottomTab,
  setBottomTab,
}: {
  lines: TerminalLine[];
  running: boolean;
  traceStepIdx: number;
  setTraceStepIdx: (idx: number) => void;
  bottomTab: "terminal" | "visualizer";
  setBottomTab: (t: "terminal" | "visualizer") => void;
}) => {
  const currentTrace = TRACE_STEPS[traceStepIdx] || TRACE_STEPS[0];

  return (
    <div className="h-full bg-ide-bg flex flex-col font-mono text-xs">
      <div className="flex items-center justify-between bg-ide-surface border-b border-border-dark px-4">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setBottomTab("terminal")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-wider border-b-2 transition-colors",
              bottomTab === "terminal"
                ? "border-primary-400 text-white bg-ide-panel"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Stdout & Test Suite</span>
            {running && <Loader2 className="w-3 h-3 text-emerald-400 animate-spin ml-1" />}
          </button>
          <button
            onClick={() => setBottomTab("visualizer")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-wider border-b-2 transition-colors",
              bottomTab === "visualizer"
                ? "border-emerald-400 text-emerald-300 bg-ide-panel"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Time-Travel Memory Inspector</span>
          </button>
        </div>

        {bottomTab === "visualizer" && (
          <div className="flex items-center gap-1.5 py-1">
            <button
              onClick={() => setTraceStepIdx(0)}
              className="p-1 rounded bg-ide-elevated text-slate-300 hover:text-white border border-slate-700"
              title="First step"
            >
              <SkipBack className="w-3 h-3" />
            </button>
            <button
              onClick={() => setTraceStepIdx(Math.max(0, traceStepIdx - 1))}
              className="p-1 rounded bg-ide-elevated text-slate-300 hover:text-white border border-slate-700"
              title="Previous step"
            >
              <StepBack className="w-3 h-3" />
            </button>
            <span className="px-2 text-[10px] text-emerald-300 font-semibold">
              STEP {currentTrace.step} / {TRACE_STEPS.length} (L{currentTrace.line})
            </span>
            <button
              onClick={() => setTraceStepIdx(Math.min(TRACE_STEPS.length - 1, traceStepIdx + 1))}
              className="p-1 rounded bg-ide-elevated text-slate-300 hover:text-white border border-slate-700"
              title="Next step"
            >
              <StepForward className="w-3 h-3" />
            </button>
            <button
              onClick={() => setTraceStepIdx(TRACE_STEPS.length - 1)}
              className="p-1 rounded bg-ide-elevated text-slate-300 hover:text-white border border-slate-700"
              title="Final step"
            >
              <SkipForward className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {bottomTab === "terminal" ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                "leading-5",
                line.type === "output" && "text-slate-200",
                line.type === "error" && "text-red-400",
                line.type === "info" && "text-slate-400",
                line.type === "input" && "text-primary-300"
              )}
            >
              {line.type === "input" && <span className="text-slate-500 mr-1.5">$</span>}
              {line.text}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Stack Frame & Operation */}
          <div className="md:col-span-5 bg-ide-panel border border-border-dark rounded p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase mb-1.5">
                <span>ACTIVE STACK FRAME</span>
                <span className="text-emerald-400">{currentTrace.frame}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{currentTrace.action}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-border-dark">
              <div className="text-[9px] text-slate-500 uppercase mb-1">STDOUT BUFFER STATE</div>
              <pre className="text-[11px] text-emerald-300 whitespace-pre-wrap">
                {currentTrace.stdout || "(empty stdout buffer)"}
              </pre>
            </div>
          </div>

          {/* Heap / Local Bindings Table */}
          <div className="md:col-span-7 bg-ide-panel border border-border-dark rounded p-3">
            <div className="text-[10px] text-slate-400 uppercase mb-2">
              HEAP &amp; REGISTER BINDINGS ({currentTrace.locals.length} OBJECTS)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentTrace.locals.map((v) => (
                <div
                  key={v.name}
                  className="p-2 rounded bg-ide-bg border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-primary-300 font-semibold">{v.name}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">:{v.type}</span>
                    <div className="text-[9px] text-slate-500 mt-0.5">ADDR {v.addr}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-ide-elevated text-emerald-300 border border-slate-700 text-xs">
                    {v.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type AIMsg = { role: "user" | "ai"; content: string };

const MOCK_AI_RESPONSES: Record<string, string> = {
  explain: `CONTROL FLOW TRACE (main.py):
1. greet_user() reads raw string tokens from stdin via input().
2. int() casts the second token to a base-10 integer.
3. Formatted string literals (f-strings) interpolate bindings directly into stdout.
4. Conditional branch evaluates (age >= 18) to classify adult/minor state.`,
  error: `STATIC DIAGNOSTIC REPORT:
• Syntax: Valid Python 3.11 AST.
• Unhandled Exception Risk: Line 6 calls int(input(...)) without a try/except ValueError block. Click "Inspect AST Guard Diff" in the editor bar to preview the guard.`,
  hint: `SOCRATIC HINT:
Consider what happens when stdin receives "twenty" instead of "20". Wrap the integer cast inside a try/except ValueError block so your program can prompt or fail gracefully.`,
  trace: `RUNTIME TRACE GUIDANCE:
Switch to the "Time-Travel Memory Inspector" tab below the editor to scrub through each stack frame and heap binding step-by-step.`,
};

type AIPanelProps = {
  code: string;
  experimentTitle?: string;
  experimentLanguage?: string;
  aiFeedback?: string | null;
  generatingFeedback?: boolean;
  lastError?: string | null;
};

const AIPanel = ({
  code,
  experimentTitle,
  experimentLanguage,
  aiFeedback,
  generatingFeedback,
  lastError,
}: AIPanelProps) => {
  const [tab, setTab] = useState<"chat" | "feedback">("chat");
  const [messages, setMessages] = useState<AIMsg[]>([
    {
      role: "ai",
      content: `SOCRATIC DIAGNOSTIC READY\nTarget: ${experimentTitle || "Experiment 01"} (${
        experimentLanguage?.toUpperCase() || "PYTHON"
      })\n\nSelect a diagnostic command below or query the assistant about your active buffer.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (aiFeedback) setTab("feedback");
  }, [aiFeedback]);

  const sendMessage = (text: string, actionKey?: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const lineCount = code.split("\n").length;
      const reply =
        (actionKey && MOCK_AI_RESPONSES[actionKey]) ||
        `DIAGNOSTIC RESPONSE (${lineCount} lines in buffer):\nQuery: "${text}"\n\nVerify that your variable bindings and stdout formatting align with the specification in the Lab Spec tab.${
          lastError ? `\n\nActive Runtime Fault: ${lastError}` : ""
        }`;
      setMessages((m) => [...m, { role: "ai", content: reply }]);
      setLoading(false);
    }, 550);
  };

  const CONTEXT_ACTIONS = [
    { key: "explain", label: "Trace Control Flow", icon: Code2 },
    { key: "error", label: "Static Bug Audit", icon: Bug },
    { key: "hint", label: "Socratic Hint", icon: Lightbulb },
    { key: "trace", label: "Memory Inspector", icon: HelpCircle },
  ];

  return (
    <div className="h-full bg-ide-panel flex flex-col border-l border-border-dark">
      <div className="px-4 py-2.5 border-b border-border-dark flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <AIRobot size={22} />
          <h3 className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
            Socratic Diagnostic
          </h3>
        </div>
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-ide-elevated text-emerald-400 border border-slate-700">
          ONLINE
        </span>
      </div>

      <div className="flex border-b border-border-dark">
        {(["chat", "feedback"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors border-b-2",
              tab === t
                ? "text-white border-primary-400 bg-ide-surface"
                : "text-slate-500 border-transparent hover:text-slate-300"
            )}
          >
            {t === "feedback" ? "Code Audit" : "Interactive Trace"}
          </button>
        ))}
      </div>

      {tab === "chat" ? (
        <>
          <div className="p-2.5 border-b border-border-dark grid grid-cols-2 gap-1.5">
            {CONTEXT_ACTIONS.map((action) => (
              <button
                key={action.key}
                onClick={() => sendMessage(action.label, action.key)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-ide-surface hover:bg-ide-elevated border border-border-dark rounded text-[11px] font-mono text-slate-300 hover:text-white transition-colors text-left"
              >
                <action.icon className="w-3 h-3 text-primary-400 shrink-0" />
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-md p-3 font-mono text-xs leading-relaxed border",
                    msg.role === "user"
                      ? "bg-ide-surface text-primary-200 border-slate-700 ml-4"
                      : "bg-ide-bg text-slate-300 border-border-dark mr-2"
                  )}
                >
                  <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">
                    {msg.role === "user" ? "QUERY" : "DIAGNOSTIC"}
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-[11px]">{msg.content}</pre>
                </motion.div>
              ))}
              {loading && (
                <div className="bg-ide-bg border border-border-dark rounded-md p-3 flex items-center space-x-2">
                  <Loader2 className="w-3.5 h-3.5 text-primary-400 animate-spin" />
                  <span className="font-mono text-[11px] text-slate-400">Analyzing AST...</span>
                </div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          <div className="p-2.5 border-t border-border-dark bg-ide-surface">
            <div className="flex items-center space-x-2 bg-ide-bg border border-border-dark rounded px-2.5 py-1.5 focus-within:border-primary-500 transition-colors">
              <input
                className="flex-1 bg-transparent text-xs font-mono text-slate-200 outline-none placeholder-slate-500"
                placeholder="Query diagnostic engine..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="p-1 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white rounded transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          {generatingFeedback ? (
            <div className="flex flex-col items-center justify-center h-full space-y-2">
              <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
              <p className="font-mono text-slate-400 text-xs">Running static analysis...</p>
            </div>
          ) : aiFeedback ? (
            <div className="space-y-3">
              <div className="bg-ide-bg border border-border-dark rounded-md p-3.5">
                <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-300 leading-relaxed">
                  {aiFeedback}
                </pre>
              </div>
              <p className="font-mono text-[10px] text-slate-500">
                NOTE: Automated audit is advisory. Faculty verification determines final grade.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
              <AIRobot size={32} />
              <p className="font-mono text-slate-400 text-xs">
                Submit your code to generate a static analysis report.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const INITIAL_TERMINAL: TerminalLine[] = [
  { text: "AI Lab Execution Sandbox — Python 3.11.4", type: "info" },
  { text: "Ready. Press Run Code or open the Time-Travel Memory Inspector.", type: "info" },
];

export default function ProgrammingWorkspace() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const expId = searchParams.get("expId") || useParams<{ expId: string }>().expId || "exp-01";

  const [experiment, setExperiment] = useState<{
    title: string;
    language: string;
    objective: string;
    algorithm?: string;
    expectedOutput?: string;
    courseId: string;
  } | null>(null);
  const [buffers, setBuffers] = useState<Record<string, string>>(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState("main.py");
  const [termLines, setTermLines] = useState<TerminalLine[]>(INITIAL_TERMINAL);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const [bottomTab, setBottomTab] = useState<"terminal" | "visualizer">("terminal");
  const [traceStepIdx, setTraceStepIdx] = useState<number>(2);
  const [showDiffLens, setShowDiffLens] = useState<boolean>(false);

  const currentCode = buffers[activeFile] ?? "";
  const setCurrentCode = (next: string) => {
    setBuffers((prev) => ({ ...prev, [activeFile]: next }));
  };

  useEffect(() => {
    async function loadRecord() {
      const exp = await api.experiments.getById(expId);
      if (exp) {
        setExperiment({
          title: exp.title,
          language: exp.language,
          objective: exp.objective,
          algorithm: exp.algorithm,
          expectedOutput: exp.expectedOutput,
          courseId: exp.courseId,
        });
      }
      const rec = await api.records.createIfMissing(expId, CURRENT_USER.id);
      if (rec) {
        setRecordId(rec.id);
        if (rec.codeStatus === "Submitted" || rec.codeStatus === "Passed") {
          setSubmitted(true);
        }
        if (rec.aiFeedback) setAiFeedback(rec.aiFeedback);
        const savedCode = localStorage.getItem(`workspace_code_${expId}_${CURRENT_USER.id}`);
        if (savedCode) {
          setBuffers((prev) => ({ ...prev, "main.py": savedCode }));
        } else if (rec.codeContent) {
          setBuffers((prev) => ({ ...prev, "main.py": rec.codeContent! }));
        }
      }
    }
    loadRecord();
  }, [expId]);

  useEffect(() => {
    const mainCode = buffers["main.py"];
    if (mainCode && mainCode !== DEFAULT_FILES["main.py"]) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(`workspace_code_${expId}_${CURRENT_USER.id}`, mainCode);
      }, 800);
      return () => clearTimeout(timeoutId);
    }
  }, [buffers, expId]);

  const runCode = async () => {
    setRunning(true);
    setBottomTab("terminal");
    setLastError(null);
    setTermLines((prev) => [...prev, { text: `python3 ${activeFile}`, type: "input" }]);

    const codeToTest = buffers["main.py"];
    const testResults = await api.testCases.runTests(expId, codeToTest);
    const passed = testResults.filter((r) => r.passed).length;
    const total = testResults.length;

    const hasError = !codeToTest.includes("input(") || !codeToTest.includes("print(");
    const errorMsg = hasError ? "NameError: expected standard input/output calls in main.py" : null;
    if (errorMsg) setLastError(errorMsg);

    setTermLines((prev) => [
      ...prev,
      ...(hasError
        ? [
            { text: errorMsg!, type: "error" as const },
            { text: "Process exited with code 1", type: "info" as const },
          ]
        : [
            { text: "Enter your name: Midhun", type: "output" as const },
            { text: "Enter your age: 20", type: "output" as const },
            { text: "Hello, Midhun!", type: "output" as const },
            { text: "You are 20 years old.", type: "output" as const },
            { text: "Process exited with code 0 (42ms)", type: "info" as const },
            { text: "--- TEST SUITE EVALUATION ---", type: "info" as const },
            ...testResults.map((r) => ({
              text: `[${r.passed ? "PASS" : "FAIL"}] ${r.testCaseId}${
                r.error ? ` — ${r.error}` : ""
              }`,
              type: (r.passed ? "output" : "error") as "output" | "error",
            })),
            { text: `SUMMARY: ${passed}/${total} TEST CASES PASSED`, type: "info" as const },
          ]),
    ]);
    setRunning(false);
  };

  const clearOutput = () => setTermLines(INITIAL_TERMINAL);

  const submitCode = async () => {
    const mainCode = buffers["main.py"];
    setTermLines((prev) => [...prev, { text: "Committing main.py to lab record...", type: "info" }]);
    if (recordId) {
      await api.records.updateCode(recordId, mainCode, "Submitted");
    }
    setSubmitted(true);
    setTermLines((prev) => [...prev, { text: "[OK] Stage 1 code submission recorded.", type: "info" }]);

    setGeneratingFeedback(true);
    const feedback = await api.ai.generateFeedback(mainCode, expId);
    setAiFeedback(feedback);
    if (recordId) await api.records.updateAiFeedback(recordId, feedback);
    setGeneratingFeedback(false);
  };

  const activeTraceLine =
    bottomTab === "visualizer" && activeFile === "main.py"
      ? TRACE_STEPS[traceStepIdx]?.line ?? null
      : null;

  return (
    <div className="flex flex-col h-screen bg-ide-bg overflow-hidden">
      {/* Top Workbench Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-ide-panel border-b border-border-dark shrink-0">
        <div className="flex items-center space-x-3">
          <Link
            to={`/labs/${expId}`}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-ide-surface hover:bg-ide-elevated text-slate-300 hover:text-white border border-border-dark font-mono text-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lab Manual</span>
          </Link>
          <div className="h-4 w-px bg-border-dark" />
          <div className="flex items-center text-xs text-slate-400 space-x-1.5 font-mono">
            <span className="text-slate-300 font-semibold">
              {experiment?.courseId?.toUpperCase() ?? "CS201"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="max-w-[240px] truncate text-slate-300">
              {experiment?.title ?? "Experiment 01"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-primary-400">{activeFile}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setBottomTab(bottomTab === "visualizer" ? "terminal" : "visualizer")}
            className={cn(
              "flex items-center space-x-1.5 px-2.5 py-1.5 font-mono text-xs rounded border transition-colors",
              bottomTab === "visualizer"
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
                : "bg-ide-surface text-slate-300 hover:text-white border-border-dark"
            )}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Memory Trace</span>
          </button>
          <button
            onClick={clearOutput}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 font-mono text-xs text-slate-400 hover:text-white hover:bg-ide-surface rounded border border-transparent hover:border-border-dark transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <button
            onClick={runCode}
            disabled={running}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white font-mono text-xs font-medium rounded border border-emerald-500/40 transition-colors"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{running ? "Executing..." : "Run Code"}</span>
          </button>
          <div className="h-4 w-px bg-border-dark mx-1" />
          <button
            onClick={submitCode}
            disabled={submitted}
            className={cn(
              "flex items-center space-x-1.5 px-3.5 py-1.5 font-mono text-xs font-medium rounded border transition-colors",
              submitted
                ? "bg-ide-surface text-emerald-400 border-emerald-700/50 cursor-default"
                : "bg-primary-600 hover:bg-primary-500 text-white border-primary-500"
            )}
          >
            {submitted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <UploadCloud className="w-3.5 h-3.5" />}
            <span>{submitted ? "Code Verified" : "Submit Code"}</span>
          </button>
          {submitted && (
            <button
              onClick={() => navigate(`/labs/${expId}`)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white text-ide-bg hover:bg-slate-200 font-mono text-xs font-semibold rounded transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Compile Record →</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Pane Workbench */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 shrink-0 border-r border-border-dark">
          <LeftSidebar
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            experiment={experiment}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-[62] overflow-hidden">
            <CodeEditor
              activeFile={activeFile}
              code={currentCode}
              setCode={setCurrentCode}
              activeTraceLine={activeTraceLine}
              showDiffLens={showDiffLens}
              setShowDiffLens={setShowDiffLens}
            />
          </div>
          <div className="flex-[38] border-t border-border-dark overflow-hidden min-h-[200px]">
            <BottomExecutionDeck
              lines={termLines}
              running={running}
              traceStepIdx={traceStepIdx}
              setTraceStepIdx={setTraceStepIdx}
              bottomTab={bottomTab}
              setBottomTab={setBottomTab}
            />
          </div>
        </div>

        <div className="w-80 shrink-0 overflow-hidden">
          <AIPanel
            code={currentCode}
            experimentTitle={experiment?.title ?? ""}
            experimentLanguage={experiment?.language ?? "python"}
            aiFeedback={aiFeedback}
            generatingFeedback={generatingFeedback}
            lastError={lastError}
          />
        </div>
      </div>
    </div>
  );
}
