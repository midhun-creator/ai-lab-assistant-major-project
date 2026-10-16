import { Users, ShieldAlert, ArrowUpRight, Server, Database, Cpu, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted mb-1">
            SYSTEM CONTROL // {user?.name || "ROOT"}
          </div>
          <h1 className="font-serif text-3xl text-foreground">Infrastructure & Directory Overview</h1>
          <p className="text-sm text-muted mt-1">
            Real-time health of database nodes, code execution sandboxes, and institutional accounts.
          </p>
        </div>
        <StatusBadge status="Active" />
      </div>

      {/* 1px Divided Telemetry Strip */}
      <div className="bg-surface border border-border rounded-card shadow-subtle grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {[
          { label: "PROVISIONED ACCOUNTS", value: "1,452", meta: "1,380 STUDENTS / 72 STAFF", route: "/admin/users" },
          { label: "ACTIVE COURSES", value: "24", meta: "4 DEPARTMENTS", route: "/admin/reports" },
          { label: "SANDBOX WORKER LOAD", value: "34.2%", meta: "JUDGE0 // 8 WORKERS", route: "/admin/settings" },
          { label: "LLM INFERENCE LATENCY", value: "142ms", meta: "LOCAL OLLAMA NODE", route: "/admin/settings" },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => navigate(stat.route)}
            className="p-5 text-left hover:bg-surface-soft transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{stat.label}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="font-mono text-2xl font-semibold text-foreground mt-2">{stat.value}</div>
            <div className="font-mono text-[11px] text-muted mt-1">{stat.meta}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-7 !p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-surface-soft flex items-center justify-between">
            <h2 className="font-serif text-lg text-foreground">Service Mesh & Execution Nodes</h2>
            <span className="font-mono text-[11px] text-muted">UPTIME: 99.98%</span>
          </div>
          <div className="divide-y divide-border">
            {[
              { name: "PostgreSQL Primary Cluster", spec: "pg-16 // port 5432", icon: Database, status: "Verified" },
              { name: "FastAPI Core Gateway", spec: "uvicorn // 4 workers", icon: Server, status: "Verified" },
              { name: "Judge0 Isolated Sandbox", spec: "docker-seccomp // python-3.11", icon: Terminal, status: "Verified" },
              { name: "Socratic LLM Inference Engine", spec: "gemma-2-9b-it // Q4_K_M", icon: Cpu, status: "Verified" },
            ].map((node) => (
              <div key={node.name} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-surface-elevated border border-border">
                    <node.icon className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{node.name}</div>
                    <div className="font-mono text-[11px] text-muted">{node.spec}</div>
                  </div>
                </div>
                <StatusBadge status={node.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-5 p-5 space-y-4">
          <h2 className="font-serif text-lg text-foreground border-b border-border pb-3">
            Administrative Operations
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/users")}
              className="w-full p-4 bg-surface-soft hover:bg-surface-elevated rounded-md border border-border text-left transition-colors flex items-start justify-between"
            >
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Institutional User Directory</h3>
                  <p className="text-xs text-muted mt-0.5">Manage student enrollments, faculty roles, and batch CSV imports.</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted shrink-0" />
            </button>

            <button
              onClick={() => navigate("/admin/settings")}
              className="w-full p-4 bg-surface-soft hover:bg-surface-elevated rounded-md border border-border text-left transition-colors flex items-start justify-between"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Exam Proctoring & Sandbox Policy</h3>
                  <p className="text-xs text-muted mt-0.5">Configure violation thresholds, CPU/memory limits, and LLM guardrails.</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted shrink-0" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
