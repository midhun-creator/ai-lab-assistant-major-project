import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { Role } from "../lib/types";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowUpRight,
  Cpu,
  ShieldCheck,
  TerminalSquare,
  CheckCircle2,
  KeyRound,
  Layers,
  Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AIRobot } from "../components/ui/AIRobot";

const CREDENTIALS: Record<string, { password: string; role: Role; name: string }> = {
  "midhun@gpc.edu.in": { password: "student123", role: "student", name: "Midhun" },
  "sarah@gpc.edu.in":  { password: "teacher123", role: "teacher", name: "Prof. Sarah Jenkins" },
  "admin@gpc.edu.in":  { password: "admin123",   role: "admin",   name: "Admin Portal" },
};

const ROLE_PASSKEYS = [
  {
    role: "student" as Role,
    code: "STUDENT // SEM-04",
    name: "Midhun",
    email: "midhun@gpc.edu.in",
    password: "student123",
    scope: "IDE, Digital Records, Viva & Moodle Courses",
  },
  {
    role: "teacher" as Role,
    code: "FACULTY // DEPT-CS",
    name: "Prof. Sarah Jenkins",
    email: "sarah@gpc.edu.in",
    password: "teacher123",
    scope: "Moodle Edit Mode, Dossier Grading & AST Matrix",
  },
  {
    role: "admin" as Role,
    code: "SYSADMIN // ROOT",
    name: "Admin Portal",
    email: "admin@gpc.edu.in",
    password: "admin123",
    scope: "Infrastructure Telemetry, Cohorts & Sandbox Policy",
  },
] as const;

function LiveASTBlueprint() {
  return (
    <svg viewBox="0 0 440 165" className="w-full h-40 select-none" fill="none">
      {/* Subtle coordinate grid */}
      {[35, 82, 130].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="440"
          y2={y}
          stroke="#1e293b"
          strokeWidth="0.75"
          strokeDasharray="2 4"
        />
      ))}
      {[90, 220, 350].map((x) => (
        <line
          key={x}
          x1={x}
          y1="0"
          x2={x}
          y2="165"
          stroke="#1e293b"
          strokeWidth="0.75"
          strokeDasharray="2 4"
        />
      ))}

      {/* Pipeline vectors */}
      <path
        d="M88 50 H148 L176 30 H252 M148 50 L176 74 H252 M252 30 L282 50 H342 M252 74 L282 50"
        stroke="#60a5fa"
        strokeWidth="1.4"
      />
      <path d="M214 74 V126 H342" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3" />

      {/* Node 1: STDIN BUFFER */}
      <rect x="14" y="32" width="74" height="36" rx="5" fill="#0f172a" stroke="#60a5fa" strokeWidth="1.2" />
      <text x="51" y="47" textAnchor="middle" fill="#94a3b8" className="font-mono text-[8px]">
        STAGE 01
      </text>
      <text x="51" y="59" textAnchor="middle" fill="#f8fafc" className="font-mono text-[9px] font-semibold">
        stdin.read()
      </text>

      {/* Node 2: AST PARSE */}
      <rect x="176" y="14" width="76" height="32" rx="5" fill="#0f172a" stroke="#475569" strokeWidth="1" />
      <text x="214" y="28" textAnchor="middle" fill="#60a5fa" className="font-mono text-[8px]">
        AST NODE
      </text>
      <text x="214" y="39" textAnchor="middle" fill="#e2e8f0" className="font-mono text-[9px] font-semibold">
        int(token)
      </text>

      {/* Node 3: HEAP BINDING */}
      <rect x="176" y="58" width="76" height="32" rx="5" fill="#0f172a" stroke="#475569" strokeWidth="1" />
      <text x="214" y="72" textAnchor="middle" fill="#94a3b8" className="font-mono text-[8px]">
        HEAP ADDR
      </text>
      <text x="214" y="83" textAnchor="middle" fill="#34d399" className="font-mono text-[9px] font-semibold">
        0x7f8b20
      </text>

      {/* Node 4: VERIFIED RECORD */}
      <rect x="342" y="32" width="84" height="36" rx="5" fill="#0f172a" stroke="#10b981" strokeWidth="1.3" />
      <text x="384" y="47" textAnchor="middle" fill="#34d399" className="font-mono text-[8px]">
        STAGE 02
      </text>
      <text x="384" y="59" textAnchor="middle" fill="#ffffff" className="font-mono text-[9px] font-semibold">
        SHA-256 OK
      </text>

      {/* Node 5: SOCRATIC AUDIT */}
      <rect x="342" y="108" width="84" height="34" rx="5" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" />
      <text x="384" y="122" textAnchor="middle" fill="#93c5fd" className="font-mono text-[8px]">
        AI DIAGNOSTIC
      </text>
      <text x="384" y="133" textAnchor="middle" fill="#e2e8f0" className="font-mono text-[9px] font-semibold">
        2/2 PASSED
      </text>
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [activeInstrument, setActiveInstrument] = useState<0 | 1 | 2>(0);

  // Login form state
  const [email, setEmail] = useState("midhun@gpc.edu.in");
  const [password, setPassword] = useState("student123");
  const [selectedRoleKey, setSelectedRoleKey] = useState<Role>("student");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Signup form state
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPass, setSuPass] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suError, setSuError] = useState("");

  // Auto-cycle the right-hand instrument preview every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveInstrument((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const executeSignIn = useCallback(
    async (targetEmail: string, targetPass: string) => {
      if (loading || success) return;
      setError("");
      const key = targetEmail.trim().toLowerCase();
      const cred = CREDENTIALS[key];
      if (!cred || cred.password !== targetPass) {
        setError("Invalid institutional email or passkey. Select a role passkey below or verify your credentials.");
        return;
      }
      setLoading(true);
      await new Promise((r) => setTimeout(r, 450));
      if (cred.role === "student") {
        localStorage.setItem("moodle_edit_mode", "false");
      }
      login(cred.role);
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 250));
      const dest =
        from ?? (cred.role === "admin" ? "/admin" : cred.role === "teacher" ? "/teacher" : "/dashboard");
      navigate(dest, { replace: true });
    },
    [loading, success, login, navigate, from]
  );

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await executeSignIn(email, password);
    },
    [email, password, executeSignIn]
  );

  const handleSelectPasskey = (acc: (typeof ROLE_PASSKEYS)[number]) => {
    setSelectedRoleKey(acc.role);
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
    setMode("login");
  };

  const handleSignup = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!suName.trim()) {
        setSuError("Enter your full candidate or faculty name.");
        return;
      }
      if (!suEmail.trim()) {
        setSuError("Enter your institutional email (@gpc.edu.in).");
        return;
      }
      if (suPass.length < 6) {
        setSuError("Passkey must be at least 6 characters.");
        return;
      }
      if (suPass !== suConfirm) {
        setSuError("Confirmation passkey does not match.");
        return;
      }
      setSuError(
        "Enrollment is provisioned via your department's Moodle cohort directory. Use one of the verified passkeys below for immediate access."
      );
    },
    [suName, suEmail, suPass, suConfirm]
  );

  return (
    <main
      className="min-h-screen bg-surface-soft text-foreground flex flex-col justify-between select-none"
      aria-label="AI Lab Authentication Gateway"
    >
      {/* Top 1px Institutional Telemetry Bar */}
      <header className="h-12 px-6 bg-surface border-b border-border flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <AIRobot size={24} />
          <span className="font-serif text-base text-foreground tracking-tight">AI Lab</span>
          <span className="text-border">|</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted hidden sm:inline">
            COMPUTATIONAL PROGRAMMING LABORATORY &amp; MOODLE LMS
          </span>
        </div>
        <div className="flex items-center space-x-4 font-mono text-[10px] text-muted">
          <span className="hidden md:inline">NODE: GPC-KOCHI-01</span>
          <span className="flex items-center gap-1.5 text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span>ALL SYSTEMS OPERATIONAL</span>
          </span>
        </div>
      </header>

      {/* Center Split-Bento Architectural Workbench */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 bg-surface rounded-card border border-border shadow-elevated overflow-hidden">
          {/* LEFT 6 COLS: Editorial Paper Authentication Sheet */}
          <div className="lg:col-span-6 p-7 sm:p-10 flex flex-col justify-between relative blueprint-grid">
            {/* Corner Registration Marks */}
            <span className="pointer-events-none absolute top-3 left-3 font-mono text-xs text-border">+</span>
            <span className="pointer-events-none absolute top-3 right-3 font-mono text-xs text-border">+</span>
            <span className="pointer-events-none absolute bottom-3 left-3 font-mono text-xs text-border">+</span>
            <span className="pointer-events-none absolute bottom-3 right-3 font-mono text-xs text-border">+</span>

            <div className="bg-surface/95 backdrop-blur-[1px] rounded-md">
              {/* Mode Switcher Tabs */}
              <div className="inline-flex p-1 rounded-md bg-surface-elevated border border-border mb-6">
                {(
                  [
                    { id: "login", label: "01 // Institutional Sign In" },
                    { id: "signup", label: "02 // Cohort Enrollment" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMode(tab.id);
                      setError("");
                      setSuError("");
                    }}
                    className={cn(
                      "relative px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider rounded transition-colors",
                      mode === tab.id ? "text-foreground font-semibold" : "text-muted hover:text-foreground"
                    )}
                  >
                    {mode === tab.id && (
                      <motion.div
                        layoutId="auth-mode-pill"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 bg-surface rounded border border-border shadow-subtle"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  <motion.div
                    key="auth-login"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="mb-6">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
                        IDENTITY VERIFICATION // SESSION GATEWAY
                      </div>
                      <h1 className="font-serif text-3xl sm:text-4xl text-foreground tracking-tight">
                        Enter Laboratory Workbench
                      </h1>
                      <p className="text-xs text-muted mt-1.5 leading-relaxed">
                        Sign in with your institutional credentials or select a verified role passkey below to launch the workspace.
                      </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4" noValidate>
                      <div>
                        <label
                          htmlFor="auth-email"
                          className="block font-mono text-[10px] uppercase tracking-wider text-muted mb-1.5"
                        >
                          INSTITUTIONAL EMAIL
                        </label>
                        <Input
                          id="auth-email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading || success}
                          placeholder="you@gpc.edu.in"
                          className={cn("font-mono text-xs h-10", error && "border-error")}
                          required
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="auth-pass"
                            className="font-mono text-[10px] uppercase tracking-wider text-muted"
                          >
                            ACCESS PASSKEY
                          </label>
                          <span className="font-mono text-[10px] text-primary-600">
                            SHA-256 SESSION TOKEN
                          </span>
                        </div>
                        <div className="relative">
                          <Input
                            id="auth-pass"
                            type={showPass ? "text" : "password"}
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading || success}
                            placeholder="••••••••"
                            className={cn("font-mono text-xs h-10 pr-10", error && "border-error")}
                            required
                          />
                          <button
                            type="button"
                            aria-label={showPass ? "Hide password" : "Show password"}
                            onClick={() => setShowPass((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                          >
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <p
                          className="font-mono text-[11px] text-error bg-error/10 border border-error/25 rounded p-2.5"
                          role="alert"
                        >
                          {error}
                        </p>
                      )}

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={loading || success}
                        className={cn("w-full font-mono text-xs uppercase tracking-wider h-11", success && "bg-success border-success")}
                      >
                        {success ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Session Authenticated — Launching...</span>
                          </>
                        ) : loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying Credentials...</span>
                          </>
                        ) : (
                          <>
                            <span>Authenticate &amp; Launch Workbench</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="auth-signup"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="mb-5">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
                        COHORT PROVISIONING // SEMESTER 04
                      </div>
                      <h1 className="font-serif text-3xl text-foreground tracking-tight">
                        Request Laboratory Account
                      </h1>
                      <p className="text-xs text-muted mt-1">
                        Accounts are linked to your department's Moodle enrollment register.
                      </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-3.5" noValidate>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                            CANDIDATE NAME
                          </label>
                          <Input
                            type="text"
                            value={suName}
                            onChange={(e) => setSuName(e.target.value)}
                            placeholder="Full Name"
                            className="text-xs h-9"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                            COLLEGE EMAIL
                          </label>
                          <Input
                            type="email"
                            value={suEmail}
                            onChange={(e) => setSuEmail(e.target.value)}
                            placeholder="you@gpc.edu.in"
                            className="font-mono text-xs h-9"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                            PASSKEY
                          </label>
                          <Input
                            type="password"
                            value={suPass}
                            onChange={(e) => setSuPass(e.target.value)}
                            placeholder="Min 6 chars"
                            className="font-mono text-xs h-9"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                            CONFIRM PASSKEY
                          </label>
                          <Input
                            type="password"
                            value={suConfirm}
                            onChange={(e) => setSuConfirm(e.target.value)}
                            placeholder="Repeat passkey"
                            className="font-mono text-xs h-9"
                          />
                        </div>
                      </div>

                      {suError && (
                        <p className="font-mono text-[11px] text-warning bg-warning/10 border border-warning/25 rounded p-2.5">
                          {suError}
                        </p>
                      )}

                      <Button type="submit" variant="primary" size="md" className="w-full font-mono text-xs uppercase">
                        <span>Submit Cohort Request</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tactile 1-Click Role Passkey Selector (Matches Inside App Roles) */}
            <div className="mt-7 pt-5 border-t border-border bg-surface/95">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3 text-primary-600" />
                  <span>INSTANT ROLE PASSKEYS (CLICK TO FILL OR DOUBLE-CLICK TO LAUNCH)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ROLE_PASSKEYS.map((acc) => {
                  const isSelected = selectedRoleKey === acc.role && email === acc.email;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleSelectPasskey(acc)}
                      onDoubleClick={() => executeSignIn(acc.email, acc.password)}
                      className={cn(
                        "p-2.5 rounded-md border text-left transition-all flex flex-col justify-between",
                        isSelected
                          ? "bg-surface-elevated border-foreground shadow-subtle"
                          : "bg-surface hover:bg-surface-soft border-border"
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-mono text-[9px] uppercase font-semibold text-primary-600">
                          {acc.code.split(" ")[0]}
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-muted" />
                      </div>
                      <div className="text-xs font-semibold text-foreground truncate">{acc.name}</div>
                      <div className="font-mono text-[10px] text-muted truncate mt-0.5">{acc.email}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 6 COLS: Deep Carbon Obsidian Live Instrument Preview Deck */}
          <div className="lg:col-span-6 obsidian-surface text-slate-200 p-7 sm:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border-dark">
            {/* Top Instrument Header */}
            <div>
              <div className="flex items-center justify-between border-b border-border-dark pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                    ARCHITECTURE PREVIEW // MOODLE + AI LAB
                  </span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-ide-elevated text-primary-300 border border-slate-700">
                  v2.4 PRO
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-tight leading-tight">
                Familiar Moodle Workflows.{" "}
                <span className="text-primary-300">Computational Lab Precision.</span>
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-lg">
                Built around the exact Course Index, Activity Completion, and Gradebook structure your department already knows—supercharged with a Time-Travel Python IDE, Socratic Viva Examiner, and Cryptographic Lab Records.
              </p>

              {/* Interactive Instrument Switcher Pills */}
              <div className="grid grid-cols-3 gap-2 mt-6 mb-4">
                {[
                  { idx: 0 as const, label: "01 // AST & IDE", icon: TerminalSquare },
                  { idx: 1 as const, label: "02 // ORAL VIVA", icon: Radio },
                  { idx: 2 as const, label: "03 // MOODLE LMS", icon: Layers },
                ].map((inst) => (
                  <button
                    key={inst.idx}
                    type="button"
                    onClick={() => setActiveInstrument(inst.idx)}
                    className={cn(
                      "px-3 py-2 rounded border font-mono text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors",
                      activeInstrument === inst.idx
                        ? "bg-ide-elevated text-white border-primary-400"
                        : "bg-ide-bg/60 text-slate-400 border-border-dark hover:text-slate-200"
                    )}
                  >
                    <inst.icon className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                    <span className="truncate">{inst.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Instrument Viewport */}
              <div className="bg-ide-bg/90 border border-border-dark rounded-md p-4 min-h-[210px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {activeInstrument === 0 && (
                    <motion.div
                      key="inst-0"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
                        <span>TIME-TRAVEL EXECUTION &amp; RECORD PIPELINE</span>
                        <span className="text-emerald-400">STEP 3/5 ACTIVE</span>
                      </div>
                      <LiveASTBlueprint />
                    </motion.div>
                  )}

                  {activeInstrument === 1 && (
                    <motion.div
                      key="inst-1"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                        <span>SOCRATIC ORAL VIVA VOCE SIMULATOR</span>
                        <span className="text-primary-300">RUBRIC SCORE: 9.2 / 10</span>
                      </div>
                      <div className="p-3 rounded bg-ide-surface border border-border-dark font-mono text-xs text-slate-200">
                        "What data type does Python's input() guarantee, and how should ValueError exceptions be guarded?"
                      </div>
                      <div className="flex items-center gap-1 h-10 px-3 rounded bg-ide-panel border border-border-dark">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-emerald-400/80 rounded-full"
                            style={{ height: `${((i * 11) % 22) + 6}px` }}
                          />
                        ))}
                        <span className="ml-auto font-mono text-[10px] text-emerald-400">
                          VOICE &amp; AST VERIFIED
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {activeInstrument === 2 && (
                    <motion.div
                      key="inst-2"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2.5 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>MOODLE 4.5 COURSE SHELL + EDIT MODE</span>
                        <span className="text-emerald-400">100% COMPATIBLE</span>
                      </div>
                      {[
                        { tag: "INDEX", text: "Collapsible Course Index & Block Drawers", state: "DONE" },
                        { tag: "BUILDER", text: "Instructor Edit Mode & Activity Chooser", state: "ACTIVE" },
                        { tag: "DOSSIER", text: "Split-Studio Typeset Lab Record Compiler", state: "SHA-256" },
                      ].map((row) => (
                        <div
                          key={row.tag}
                          className="p-2.5 rounded bg-ide-surface border border-border-dark flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-ide-elevated text-primary-300 border border-slate-700">
                              {row.tag}
                            </span>
                            <span className="text-slate-200 text-xs">{row.text}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400">{row.state}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom 1px Divided Obsidian Telemetry Strip */}
            <div className="mt-6 pt-5 border-t border-border-dark grid grid-cols-3 divide-x divide-border-dark font-mono">
              <div className="pr-4">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                  COHORT ACCOUNTS
                </span>
                <span className="text-lg font-semibold text-white mt-0.5 block">1,452</span>
              </div>
              <div className="px-4">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                  EXECUTION SANDBOX
                </span>
                <span className="text-lg font-semibold text-emerald-400 mt-0.5 block">42ms</span>
              </div>
              <div className="pl-4">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                  INTEGRITY ENGINE
                </span>
                <span className="text-lg font-semibold text-primary-300 mt-0.5 block">AST 2D</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 1px Structural Status Bar */}
      <footer className="h-10 px-6 bg-surface border-t border-border flex items-center justify-between font-mono text-[10px] text-muted">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
            <span>ROLE-GATED MOODLE EDIT MODE</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-foreground" />
            <span>SOCRATIC NON-SOLVING AI GUARDRAILS</span>
          </span>
        </div>
        <span>AI LAB ACADEMIC PLATFORM // 2026</span>
      </footer>
    </main>
  );
}
