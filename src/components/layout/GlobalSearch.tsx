import { useState, useEffect } from "react";
import { Search, Terminal, Book, FileText, User, Cpu, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const catalog = [
    { name: "CS201 — Python Programming", icon: Book, route: user?.role === "teacher" ? "/teacher/courses" : "/courses/cs201", type: "COURSE", roles: ["student", "teacher", "admin"] },
    { name: "CS301 — Data Structures", icon: Book, route: user?.role === "teacher" ? "/teacher/courses" : "/courses/cs301", type: "COURSE", roles: ["student", "teacher", "admin"] },
    { name: "Experiment 01: Basic I/O & Types", icon: FileText, route: "/labs/exp-01", type: "EXPERIMENT", roles: ["student"] },
    { name: "Programming Workspace (IDE)", icon: Terminal, route: "/workspace?expId=exp-01", type: "WORKBENCH", roles: ["student"] },
    { name: "AI Lab Tutor & Viva Prep", icon: Cpu, route: "/ai-tutor", type: "AI SYSTEM", roles: ["student"] },
    { name: "Assignments Ledger", icon: FileText, route: "/assignments", type: "LEDGER", roles: ["student"] },
    { name: "Record Verification Queue", icon: FileText, route: "/teacher/records", type: "REVIEW", roles: ["teacher"] },
    { name: "AST Plagiarism Matrix", icon: ShieldCheck, route: "/teacher/plagiarism", type: "INTEGRITY", roles: ["teacher"] },
    { name: "Institutional User Directory", icon: User, route: "/admin/users", type: "ADMIN", roles: ["admin"] },
  ];

  const roleFiltered = catalog.filter(item => !user?.role || item.roles.includes(user.role));
  const results = query.trim().length > 0
    ? roleFiltered.filter(item => item.name.toLowerCase().includes(query.toLowerCase()) || item.type.toLowerCase().includes(query.toLowerCase()))
    : roleFiltered.slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-ide-bg/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface rounded-card border border-border shadow-modal overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-border bg-surface-soft">
          <Search className="w-4 h-4 text-muted mr-3" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted text-sm"
            placeholder="Type a command, course code (CS201), or experiment..."
          />
          <kbd className="px-1.5 py-0.5 bg-surface border border-border text-muted rounded font-mono text-[10px]">
            ESC
          </kbd>
        </div>

        <div className="max-h-[340px] overflow-y-auto p-2 divide-y divide-border/50">
          {results.length > 0 ? (
            <div>
              <p className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                {query.trim().length > 0 ? "Matching Destinations" : "Quick Jump"}
              </p>
              {results.map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    navigate(res.route);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-surface-elevated transition-colors text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded bg-surface-elevated border border-border text-foreground flex items-center justify-center shrink-0">
                      <res.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary-600 transition-colors">
                      {res.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted px-1.5 py-0.5 bg-surface-soft border border-border rounded">
                      {res.type}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted text-sm">
              No matching laboratory resources for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
