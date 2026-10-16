import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { Role } from "../../lib/types";
import { 
  LayoutDashboard, 
  BookOpen, 
  TerminalSquare, 
  FileText, 
  UploadCloud, 
  Cpu, 
  CalendarCheck, 
  Bell, 
  Calendar, 
  Library, 
  Settings,
  Briefcase,
  Users,
  CheckSquare,
  LogOut,
  ShieldAlert,
  BarChart3,
  ShieldCheck,
  ArrowUpRight
} from "lucide-react";
import { motion, type Transition } from "framer-motion";
import { cn } from "../../lib/utils";
import { AIRobot } from "../ui/AIRobot";

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeTone?: "default" | "urgent" | "success";
  subCourses?: { id: string; code: string; name: string; pct: number }[];
}

const STUDENT_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
      {
        name: "My Courses",
        path: "/courses",
        icon: BookOpen,
        subCourses: [
          { id: "cs201", code: "CS201", name: "Python Lab", pct: 83 },
          { id: "cs301", code: "CS301", name: "Data Struct", pct: 45 },
        ],
      },
      { name: "AI Lab Tutor", path: "/ai-tutor", icon: Cpu, badge: "VIVA" },
      { name: "Assignments", path: "/assignments", icon: FileText, badge: "2 DUE", badgeTone: "urgent" },
      { name: "Submissions", path: "/submissions", icon: UploadCloud },
      { name: "Private Files", path: "/resources", icon: Library },
    ],
  },
  {
    label: "Telemetry & Schedule",
    items: [
      { name: "Grades & Radar", path: "/reports", icon: BarChart3, badge: "8.4" },
      { name: "Attendance", path: "/attendance", icon: CalendarCheck, badge: "92%", badgeTone: "success" },
      { name: "Calendar", path: "/calendar", icon: Calendar },
      { name: "Notifications", path: "/notifications", icon: Bell, badge: "3", badgeTone: "urgent" },
    ],
  },
];

const TEACHER_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Faculty Console",
    items: [
      { name: "Overview", path: "/teacher", icon: Briefcase },
      { name: "Record Grading", path: "/teacher/records", icon: CheckSquare, badge: "3 PEND", badgeTone: "urgent" },
      { name: "AST Plagiarism", path: "/teacher/plagiarism", icon: ShieldCheck, badge: "1 FLAG", badgeTone: "urgent" },
    ],
  },
  {
    label: "Curriculum",
    items: [
      {
        name: "Course Builder",
        path: "/teacher/courses",
        icon: BookOpen,
        subCourses: [
          { id: "cs201", code: "CS201", name: "Python Lab", pct: 83 },
          { id: "cs301", code: "CS301", name: "Data Struct", pct: 45 },
        ],
      },
      { name: "Attendance Log", path: "/teacher/attendance", icon: Users },
      { name: "Cohort Analytics", path: "/teacher/reports", icon: BarChart3 },
      { name: "Calendar", path: "/calendar", icon: Calendar },
      { name: "Notifications", path: "/notifications", icon: Bell },
    ],
  },
];

const ADMIN_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "System Control",
    items: [
      { name: "Infrastructure", path: "/admin", icon: ShieldAlert, badge: "OK", badgeTone: "success" },
      { name: "User Directory", path: "/admin/users", icon: Users, badge: "1.4K" },
      { name: "Server Telemetry", path: "/admin/reports", icon: BarChart3 },
      { name: "System Config", path: "/admin/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

// Precision easing curves matching macOS / iOS native navigation feel
const CUBIC_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SIDEBAR_TRANSITION: Transition = {
  duration: 0.28,
  ease: CUBIC_EASE,
};

export default function Sidebar({ isOpen = true }: SidebarProps) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleQuickRoleSwitch = (r: Role) => {
    login(r);
    if (r === "student") {
      localStorage.setItem("moodle_edit_mode", "false");
      window.dispatchEvent(new CustomEvent("moodle-edit-mode-change", { detail: false }));
      navigate("/dashboard");
    } else if (r === "teacher") {
      navigate("/teacher");
    } else {
      navigate("/admin");
    }
  };

  const sections =
    user?.role === "teacher"
      ? TEACHER_SECTIONS
      : user?.role === "admin"
      ? ADMIN_SECTIONS
      : STUDENT_SECTIONS;

  // Options appear immediately upon opening without delay (0 delay), and fade out seamlessly on close
  const contentTransition: Transition = {
    duration: isOpen ? 0.22 : 0.16,
    ease: CUBIC_EASE,
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 236 : 60 }}
      transition={SIDEBAR_TRANSITION}
      className="h-full flex flex-col justify-between select-none z-20 flex-shrink-0 overflow-hidden"
    >
      {/* 1. Top Brand Identity + Obsidian Active Workbench Cartridge */}
      <div className="space-y-2.5 px-2 pt-1 shrink-0">
        <div className="h-9 flex items-center px-0.5">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <AIRobot size={28} />
          </div>
          <motion.div
            initial={false}
            animate={{
              opacity: isOpen ? 1 : 0,
              x: isOpen ? 0 : -8,
            }}
            transition={contentTransition}
            className={cn(
              "ml-2 min-w-0 overflow-hidden whitespace-nowrap flex-1",
              !isOpen && "pointer-events-none"
            )}
          >
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif text-lg tracking-tight text-foreground leading-none">
                AI Lab
              </h1>
              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-surface border border-border text-muted">
                2.4
              </span>
            </div>
            <p className="font-mono text-[9px] text-muted tracking-widest uppercase mt-0.5 truncate">
              COMPUTATIONAL LMS
            </p>
          </motion.div>
        </div>

        {/* Obsidian Active Lab Cartridge with seamless morphing */}
        {user?.role !== "admin" && (
          <motion.div
            initial={false}
            animate={{
              height: isOpen ? 58 : 38,
            }}
            transition={SIDEBAR_TRANSITION}
            className="relative rounded-lg obsidian-surface border border-border-dark overflow-hidden"
          >
            {/* Collapsed Icon Mode */}
            <motion.button
              type="button"
              onClick={() => navigate("/workspace?expId=exp-01")}
              title="Launch Active Sandbox: exp-01 / main.py"
              initial={false}
              animate={{
                opacity: isOpen ? 0 : 1,
                scale: isOpen ? 0.8 : 1,
              }}
              transition={{
                duration: isOpen ? 0.14 : 0.22,
                ease: CUBIC_EASE,
              }}
              className={cn(
                "absolute inset-0 w-full h-full flex items-center justify-center text-emerald-400 hover:text-white transition-colors",
                isOpen && "pointer-events-none"
              )}
            >
              <TerminalSquare className="w-4 h-4" />
            </motion.button>

            {/* Expanded Details Mode */}
            <motion.button
              type="button"
              onClick={() => navigate("/workspace?expId=exp-01")}
              initial={false}
              animate={{
                opacity: isOpen ? 1 : 0,
                x: isOpen ? 0 : -8,
              }}
              transition={contentTransition}
              className={cn(
                "w-full h-full p-2.5 text-left group transition-transform active:scale-[0.99] flex flex-col justify-between overflow-hidden whitespace-nowrap",
                !isOpen && "pointer-events-none"
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE SANDBOX
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-white">
                  exp-01 / main.py
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-ide-elevated text-primary-300 border border-slate-700">
                  PY 3.11
                </span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* 2. Seamless Ambient Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2.5 space-y-3.5 scrollbar-none">
        {sections.map((section) => (
          <div key={section.label}>
            {/* Section Heading smoothly expands and collapses */}
            <motion.div
              initial={false}
              animate={{
                opacity: isOpen ? 1 : 0,
                height: isOpen ? "auto" : 0,
                marginBottom: isOpen ? 4 : 0,
              }}
              transition={{
                duration: isOpen ? 0.22 : 0.16,
                ease: CUBIC_EASE,
              }}
              className={cn(
                "px-2.5 overflow-hidden whitespace-nowrap font-mono text-[9px] font-semibold uppercase tracking-widest text-muted/80",
                !isOpen && "pointer-events-none"
              )}
            >
              {section.label}
            </motion.div>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.name}>
                    <NavLink
                      to={item.path}
                      end={item.path === "/teacher" || item.path === "/admin"}
                      title={!isOpen ? item.name : undefined}
                      className={({ isActive }) =>
                        cn(
                          "relative flex items-center rounded-lg transition-colors duration-fast group focus:outline-none h-9 px-2",
                          isActive
                            ? "text-foreground font-semibold"
                            : "text-muted hover:text-foreground hover:bg-surface/60"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-ambient-pill"
                              transition={{ type: "spring", stiffness: 400, damping: 34 }}
                              className="absolute inset-0 rounded-lg bg-surface border border-border shadow-subtle"
                            />
                          )}

                          {/* Fixed Icon container: stays horizontally anchored without jumping */}
                          <div className="relative z-10 w-6 h-6 flex items-center justify-center shrink-0">
                            <Icon
                              className={cn(
                                "w-4 h-4 transition-colors",
                                isActive
                                  ? "text-primary-600"
                                  : "text-muted group-hover:text-foreground"
                              )}
                            />
                            {/* Urgent status dot in collapsed mode */}
                            <motion.span
                              initial={false}
                              animate={{
                                opacity: !isOpen && item.badgeTone === "urgent" ? 1 : 0,
                                scale: !isOpen && item.badgeTone === "urgent" ? 1 : 0.4,
                              }}
                              transition={{ duration: 0.18 }}
                              className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-error"
                            />
                          </div>

                          {/* Label & Badge: smooth slide and fade without delay */}
                          <motion.div
                            initial={false}
                            animate={{
                              opacity: isOpen ? 1 : 0,
                              x: isOpen ? 0 : -8,
                            }}
                            transition={contentTransition}
                            className={cn(
                              "relative z-10 flex items-center justify-between flex-1 min-w-0 ml-2 overflow-hidden whitespace-nowrap text-[13px]",
                              !isOpen && "pointer-events-none"
                            )}
                          >
                            <span className="truncate">{item.name}</span>

                            {item.badge && (
                              <span
                                className={cn(
                                  "font-mono text-[9px] px-1.5 py-0.2 rounded border shrink-0 ml-1.5",
                                  item.badgeTone === "urgent"
                                    ? "bg-error/10 text-error border-error/25 font-semibold"
                                    : item.badgeTone === "success"
                                    ? "bg-success/10 text-success border-success/25 font-medium"
                                    : "bg-surface-elevated text-muted border-border"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </motion.div>
                        </>
                      )}
                    </NavLink>

                    {/* Compact Inline Course Branches under My Courses */}
                    {item.subCourses && (
                      <motion.div
                        initial={false}
                        animate={{
                          opacity: isOpen ? 1 : 0,
                          height: isOpen ? "auto" : 0,
                          marginTop: isOpen ? 2 : 0,
                          marginBottom: isOpen ? 4 : 0,
                        }}
                        transition={{
                          duration: isOpen ? 0.22 : 0.16,
                          ease: CUBIC_EASE,
                        }}
                        className={cn(
                          "ml-4 pl-3 border-l border-border/80 space-y-0.5 overflow-hidden whitespace-nowrap",
                          !isOpen && "pointer-events-none"
                        )}
                      >
                        {item.subCourses.map((sc) => {
                          const activeCourse = location.pathname === `/courses/${sc.id}`;
                          return (
                            <button
                              key={sc.id}
                              type="button"
                              onClick={() => navigate(`/courses/${sc.id}`)}
                              className={cn(
                                "w-full flex items-center justify-between px-2 py-1 rounded-md text-xs transition-colors",
                                activeCourse
                                  ? "bg-surface text-foreground font-semibold border border-border shadow-subtle"
                                  : "text-muted hover:text-foreground hover:bg-surface/50"
                              )}
                            >
                              <span className="truncate">
                                <span className="font-mono text-[10px] mr-1.5 text-foreground/80">
                                  {sc.code}
                                </span>
                                {sc.name}
                              </span>
                              <span className="font-mono text-[9px] text-muted">{sc.pct}%</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. Bottom Role Switcher & Session Pod */}
      <div className="px-2 pb-1 shrink-0">
        <motion.div
          initial={false}
          animate={{
            height: isOpen ? 84 : 64,
          }}
          transition={SIDEBAR_TRANSITION}
          className="relative rounded-lg bg-surface border border-border shadow-subtle overflow-hidden"
        >
          {/* Expanded State: 1-Click Role Switcher Bar + User Details */}
          <motion.div
            initial={false}
            animate={{
              opacity: isOpen ? 1 : 0,
              x: isOpen ? 0 : -8,
            }}
            transition={contentTransition}
            className={cn(
              "p-2 space-y-2 whitespace-nowrap overflow-hidden h-full flex flex-col justify-between",
              !isOpen && "pointer-events-none"
            )}
          >
            {/* 1-Click Role Switcher Bar */}
            <div className="grid grid-cols-3 gap-1 p-0.5 rounded bg-surface-soft border border-border">
              {(["student", "teacher", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickRoleSwitch(r)}
                  className={cn(
                    "py-0.5 rounded font-mono text-[9px] uppercase transition-colors",
                    user?.role === r
                      ? "bg-foreground text-surface font-semibold"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {r === "teacher" ? "faculty" : r}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-6 h-6 rounded bg-surface-elevated border border-border text-foreground flex items-center justify-center font-mono text-[11px] font-semibold shrink-0">
                  {user?.name?.charAt(0) || "M"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate leading-none">
                    {user?.name || "Midhun"}
                  </p>
                  <p className="font-mono text-[9px] text-muted truncate mt-0.5">
                    {user?.email || "midhun@gpc.edu.in"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1 text-muted hover:text-error rounded transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Collapsed State: Stacked Compact Avatar + Logout */}
          <motion.div
            initial={false}
            animate={{
              opacity: isOpen ? 0 : 1,
              scale: isOpen ? 0.85 : 1,
            }}
            transition={{
              duration: isOpen ? 0.14 : 0.22,
              ease: CUBIC_EASE,
            }}
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-1.5 py-1",
              isOpen && "pointer-events-none"
            )}
          >
            <div
              title={`${user?.name} (${user?.role})`}
              className="w-7 h-7 rounded bg-foreground text-surface flex items-center justify-center font-mono text-xs font-semibold shadow-subtle"
            >
              {user?.name?.charAt(0) || "M"}
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1 text-muted hover:text-error rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.aside>
  );
}
