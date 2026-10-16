import { Download } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/Badge";

function CompetencyRadarSVG() {
  return (
    <svg viewBox="0 0 260 200" className="w-full h-48 select-none" fill="none">
      {/* Concentric pentagons */}
      <polygon points="130,22 215,75 182,168 78,168 45,75" stroke="#dddad1" strokeWidth="1" />
      <polygon points="130,50 189,87 166,152 94,152 71,87" stroke="#dddad1" strokeWidth="1" strokeDasharray="2 2" />
      <polygon points="130,78 164,99 151,136 109,136 96,99" stroke="#dddad1" strokeWidth="1" />
      {/* Axis spokes */}
      <line x1="130" y1="106" x2="130" y2="22" stroke="#dddad1" strokeWidth="1" />
      <line x1="130" y1="106" x2="215" y2="75" stroke="#dddad1" strokeWidth="1" />
      <line x1="130" y1="106" x2="182" y2="168" stroke="#dddad1" strokeWidth="1" />
      <line x1="130" y1="106" x2="78" y2="168" stroke="#dddad1" strokeWidth="1" />
      <line x1="130" y1="106" x2="45" y2="75" stroke="#dddad1" strokeWidth="1" />
      {/* Student performance polygon */}
      <polygon
        points="130,30 204,80 170,156 88,150 62,82"
        fill="rgba(29, 74, 176, 0.14)"
        stroke="#1d4ab0"
        strokeWidth="2"
      />
      {[
        [130, 30],
        [204, 80],
        [170, 156],
        [88, 150],
        [62, 82],
      ].map(([cx, cy], idx) => (
        <circle key={idx} cx={cx} cy={cy} r="3.5" fill="#121211" stroke="#ffffff" strokeWidth="1.2" />
      ))}
      {/* Labels */}
      <text x="130" y="13" textAnchor="middle" fill="#121211" className="font-mono text-[8px] font-semibold">SYNTAX (94%)</text>
      <text x="222" y="75" textAnchor="start" fill="#121211" className="font-mono text-[8px] font-semibold">ALGORITHMS (88%)</text>
      <text x="188" y="182" textAnchor="middle" fill="#121211" className="font-mono text-[8px] font-semibold">VIVA DEFENSE (82%)</text>
      <text x="72" y="182" textAnchor="middle" fill="#121211" className="font-mono text-[8px] font-semibold">EDGE CASES (78%)</text>
      <text x="38" y="75" textAnchor="end" fill="#121211" className="font-mono text-[8px] font-semibold">RECORDS (92%)</text>
    </svg>
  );
}

export default function StudentReports() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 blueprint-grid">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            ACADEMIC TELEMETRY // CANDIDATE: {user?.name?.toUpperCase() || "MIDHUN"}
          </div>
          <h1 className="font-serif text-3xl text-foreground">Performance &amp; Competency Dossier</h1>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-3.5 h-3.5" />
          <span>Export Transcript (PDF)</span>
        </Button>
      </div>

      {/* 1px Hairline KPI Ledger */}
      <div className="bg-surface border border-border rounded-card shadow-subtle grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
        <div className="p-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">CUMULATIVE GPA</span>
          <div className="font-mono text-2xl font-semibold text-foreground mt-1">8.40 / 10.0</div>
          <span className="font-mono text-[11px] text-success">FIRST CLASS DISTINCTION</span>
        </div>
        <div className="p-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">ATTENDANCE RATE</span>
          <div className="font-mono text-2xl font-semibold text-foreground mt-1">92.0%</div>
          <span className="font-mono text-[11px] text-muted">37 / 40 SESSIONS</span>
        </div>
        <div className="p-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">ASSIGNMENTS</span>
          <div className="font-mono text-2xl font-semibold text-foreground mt-1">12 / 14</div>
          <span className="font-mono text-[11px] text-muted">85.7% COMPLETION</span>
        </div>
        <div className="p-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">VERIFIED RECORDS</span>
          <div className="font-mono text-2xl font-semibold text-foreground mt-1">08 / 08</div>
          <span className="font-mono text-[11px] text-primary-600">SHA-256 SIGNED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
        {/* Left 5 Cols: 5-Axis Competency Radar */}
        <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div className="border-b border-border pb-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              MULTI-AXIS SKILL PROFILE
            </span>
            <h2 className="font-serif text-xl text-foreground">Laboratory Competency Radar</h2>
          </div>
          <CompetencyRadarSVG />
          <div className="pt-3 border-t border-border font-mono text-[10px] text-muted flex justify-between">
            <span>BENCHMARK: SEM-04 COHORT</span>
            <span className="text-foreground font-semibold">TOP 12% PERCENTILE</span>
          </div>
        </Card>

        {/* Right 7 Cols: Course Breakdown Ledger */}
        <Card className="lg:col-span-7 !p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-surface-soft flex items-center justify-between">
            <h2 className="font-serif text-xl text-foreground">Course-Level Grade Ledger</h2>
            <StatusBadge status="Active" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted bg-surface">
                  <th className="py-3.5 px-5">Course</th>
                  <th className="py-3.5 px-5">Presence</th>
                  <th className="py-3.5 px-5">Assignments</th>
                  <th className="py-3.5 px-5">Labs</th>
                  <th className="py-3.5 px-5 text-right">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                <tr className="hover:bg-surface-soft transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-semibold text-foreground">Python Programming</div>
                    <div className="font-mono text-[11px] text-muted">CS201 // CORE LAB</div>
                  </td>
                  <td className="py-4 px-5 font-mono text-xs text-foreground">95.0%</td>
                  <td className="py-4 px-5 font-mono text-xs text-foreground">05 / 05</td>
                  <td className="py-4 px-5 font-mono text-xs text-success font-semibold">100%</td>
                  <td className="py-4 px-5 text-right font-mono text-base font-semibold text-foreground">A+</td>
                </tr>
                <tr className="hover:bg-surface-soft transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-semibold text-foreground">Data Structures</div>
                    <div className="font-mono text-[11px] text-muted">CS301 // CORE LAB</div>
                  </td>
                  <td className="py-4 px-5 font-mono text-xs text-warning font-semibold">72.5%</td>
                  <td className="py-4 px-5 font-mono text-xs text-foreground">03 / 05</td>
                  <td className="py-4 px-5 font-mono text-xs text-foreground">60%</td>
                  <td className="py-4 px-5 text-right font-mono text-base font-semibold text-foreground">B+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
