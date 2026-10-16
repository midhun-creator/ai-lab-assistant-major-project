import {
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  Send,
  X,
  UserCheck,
  FolderClosed,
  BarChart3,
  Calendar,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import GlobalSearch from "./GlobalSearch";
import { SidebarToggleIcon } from "../ui/SidebarToggleIcon";
import { cn } from "../../lib/utils";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/courses": "My courses",
  "/assignments": "Assignments",
  "/submissions": "Submissions",
  "/attendance": "Attendance",
  "/reports": "Grades & Telemetry",
  "/resources": "Private files & Repository",
  "/ai-tutor": "Socratic AI Tutor",
  "/notifications": "Notifications",
  "/calendar": "Calendar",
  "/teacher": "Faculty Dashboard",
  "/teacher/records": "Submissions & Record Grading",
  "/teacher/courses": "Course Management",
  "/teacher/attendance": "Attendance Register",
  "/teacher/reports": "Course Reports",
  "/teacher/plagiarism": "AST Plagiarism Matrix",
  "/admin": "Site administration",
  "/admin/users": "Users & Cohorts",
  "/admin/reports": "Server Reports",
  "/admin/settings": "Plugins & Security",
};

interface HeaderProps {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({ sidebarOpen = true, onToggleSidebar }: HeaderProps) {
  const { user, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const canEditCourse = user?.role === "teacher" || user?.role === "admin";

  const [searchOpen, setSearchOpen] = useState(false);
  const [msgDrawerOpen, setMsgDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState<boolean>(() => {
    return localStorage.getItem("moodle_edit_mode") === "true";
  });
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "Prof. Sarah Jenkins",
      time: "10:15 AM",
      text: "Reminder: Please mark Module 1 notes as Done once reviewed and submit Experiment 01 before tonight's cutoff.",
      self: false,
    },
  ]);

  useEffect(() => {
    if (!canEditCourse && editMode) {
      setEditMode(false);
      localStorage.setItem("moodle_edit_mode", "false");
      window.dispatchEvent(new CustomEvent("moodle-edit-mode-change", { detail: false }));
    }
  }, [canEditCourse, editMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleEditMode = () => {
    if (!canEditCourse) return;
    const next = !editMode;
    setEditMode(next);
    localStorage.setItem("moodle_edit_mode", String(next));
    window.dispatchEvent(new CustomEvent("moodle-edit-mode-change", { detail: next }));
  };

  const sendDirectMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: user?.name || "You", time: "Just now", text: chatInput, self: true },
    ]);
    setChatInput("");
  };

  const currentLabel =
    ROUTE_LABELS[location.pathname] ||
    (location.pathname.startsWith("/courses/")
      ? `My courses / ${location.pathname.split("/")[2]?.toUpperCase()}`
      : location.pathname.startsWith("/labs/")
      ? `My courses / CS201 / ${location.pathname.split("/")[2]?.toUpperCase()}`
      : "Dashboard");

  return (
    <>
      <header className="h-12 flex items-center justify-between px-5 bg-surface/90 border-b border-border shrink-0 z-20">
        {/* Left: Custom Squircle Sidebar Toggle + Breadcrumb Trail */}
        <div className="flex items-center space-x-2.5 text-xs min-w-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              title={sidebarOpen ? "Collapse sidebar (⌘B)" : "Expand sidebar (⌘B)"}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="group p-1.5 rounded-lg text-foreground/80 hover:text-foreground hover:bg-surface-elevated/80 border border-transparent hover:border-border focus:outline-none transition-all shrink-0"
            >
              <SidebarToggleIcon
                isOpen={sidebarOpen}
                size={20}
                className="transition-transform duration-200 group-hover:scale-105"
              />
            </button>
          )}

          <div className="h-3.5 w-px bg-border" />

          <Link
            to={user?.role === "teacher" ? "/teacher" : user?.role === "admin" ? "/admin" : "/dashboard"}
            className="font-mono text-[11px] uppercase tracking-wider text-muted hover:text-foreground transition-colors"
          >
            HOME
          </Link>
          <span className="text-border">/</span>
          <span className="font-medium text-foreground truncate">{currentLabel}</span>
        </div>

        {/* Right: Command Palette, Notifications, Messaging, User Menu & Instructor Edit Mode */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center justify-between w-60 px-2.5 py-1 text-xs bg-surface-soft hover:bg-surface-elevated border border-border rounded-md text-muted transition-colors focus:outline-none"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 text-muted shrink-0" />
              <span className="truncate">Jump to course, lab, command...</span>
            </span>
            <kbd className="px-1.5 py-0.2 bg-surface border border-border rounded font-mono text-[10px] text-foreground">
              ⌘K
            </kbd>
          </button>

          {/* Moodle Notifications Icon */}
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            title="Notifications"
            className="relative p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-soft border border-transparent hover:border-border focus:outline-none transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 block h-1.5 w-1.5 rounded-full bg-error" />
          </button>

          {/* Moodle Messaging Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMsgDrawerOpen((v) => !v)}
            title="Course & Direct Messaging"
            className={cn(
              "relative p-1.5 rounded-md border focus:outline-none transition-colors",
              msgDrawerOpen
                ? "bg-surface-elevated text-foreground border-border"
                : "text-muted hover:text-foreground hover:bg-surface-soft border-transparent hover:border-border"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 font-mono text-[9px] px-1 rounded-full bg-primary-600 text-white">
              1
            </span>
          </button>

          {/* Moodle Quick Access Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center space-x-1.5 px-2 py-1 rounded-md hover:bg-surface-soft border border-transparent hover:border-border focus:outline-none transition-colors"
            >
              <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-foreground font-semibold">
                {user?.role || "student"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted" />
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-60 bg-surface rounded-card border border-border shadow-elevated py-1.5 z-50 text-xs"
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <div className="px-3.5 py-2 border-b border-border">
                  <p className="font-semibold text-foreground">{user?.name}</p>
                  <p className="font-mono text-[10px] text-muted">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    navigate(user?.role === "teacher" ? "/teacher/reports" : "/reports");
                    setUserMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-surface-soft flex items-center gap-2.5 text-foreground"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-muted" />
                  <span>Grades</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/calendar");
                    setUserMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-surface-soft flex items-center gap-2.5 text-foreground"
                >
                  <Calendar className="w-3.5 h-3.5 text-muted" />
                  <span>Calendar</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/resources");
                    setUserMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-surface-soft flex items-center gap-2.5 text-foreground"
                >
                  <FolderClosed className="w-3.5 h-3.5 text-muted" />
                  <span>Private files</span>
                </button>

                <div className="border-t border-border mt-1 pt-1 px-3.5 py-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted block mb-1.5 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Switch role to...
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {(["student", "teacher", "admin"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          login(r);
                          setUserMenuOpen(false);
                          if (r === "student") {
                            setEditMode(false);
                            localStorage.setItem("moodle_edit_mode", "false");
                            window.dispatchEvent(new CustomEvent("moodle-edit-mode-change", { detail: false }));
                          }
                        }}
                        className={cn(
                          "px-2 py-1 rounded font-mono text-[10px] uppercase border text-center transition-colors",
                          user?.role === r
                            ? "bg-foreground text-surface border-foreground font-semibold"
                            : "bg-surface-soft text-muted border-border hover:text-foreground"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-surface-soft flex items-center gap-2.5 text-error font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {canEditCourse && (
            <>
              <div className="h-3.5 w-px bg-border" />
              <label className="flex items-center gap-2 cursor-pointer select-none pl-1">
                <span className="font-mono text-[11px] font-medium text-foreground hidden sm:inline">
                  Edit mode
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editMode}
                  onClick={toggleEditMode}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 focus:outline-none",
                    editMode ? "bg-primary-600 border-primary-600" : "bg-surface-elevated border-border"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 mt-px",
                      editMode ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </label>
            </>
          )}
        </div>
      </header>

      {/* Moodle Slide-Over Messaging Drawer */}
      {msgDrawerOpen && (
        <div className="fixed inset-y-2.5 right-2.5 top-14 w-80 bg-surface rounded-r-xl border border-border shadow-elevated z-30 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-surface-soft flex items-center justify-between">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted block">
                MOODLE MESSAGING
              </span>
              <h3 className="font-serif text-base text-foreground">Course &amp; Direct Messages</h3>
            </div>
            <button
              onClick={() => setMsgDrawerOpen(false)}
              className="p-1 text-muted hover:text-foreground rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-2 border-b border-border bg-surface flex gap-1.5 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-foreground text-surface">Direct (1)</span>
            <span className="px-2 py-0.5 rounded bg-surface-elevated text-muted">Group: Batch A</span>
            <span className="px-2 py-0.5 rounded bg-surface-elevated text-muted">Starred</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-md border text-xs leading-relaxed",
                  m.self
                    ? "bg-foreground text-surface border-foreground ml-4"
                    : "bg-surface-soft text-foreground border-border mr-4"
                )}
              >
                <div className="flex items-center justify-between font-mono text-[9px] opacity-70 mb-1">
                  <span>{m.sender}</span>
                  <span>{m.time}</span>
                </div>
                <p>{m.text}</p>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border bg-surface-soft flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendDirectMessage()}
              placeholder="Write a message to Prof. Sarah..."
              className="flex-1 bg-surface border border-border rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary-600"
            />
            <button
              onClick={sendDirectMessage}
              className="p-1.5 bg-foreground text-surface rounded hover:opacity-90"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
