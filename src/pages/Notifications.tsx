import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen,
  FileCheck,
  CalendarCheck,
  MessageSquare,
  UploadCloud,
  Megaphone,
  CheckCircle2,
  Bot,
  ShieldAlert,
  Star,
  Clock,
  ArrowRight,
  Loader2
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";
import type { ElementType } from "react";
import { api, CURRENT_USER } from "../lib/api";
import type { Notification, NotificationType } from "../lib/types";

const TYPE_META: Record<NotificationType, { icon: ElementType; color: string; bg: string; label: string }> = {
  assignment:   { icon: FileCheck,     color: "text-blue-600",    bg: "bg-blue-50",    label: "Assignment" },
  resource:     { icon: BookOpen,      color: "text-emerald-600", bg: "bg-emerald-50", label: "Resource" },
  verified:     { icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50", label: "Verified" },
  attendance:   { icon: CalendarCheck, color: "text-amber-600",   bg: "bg-amber-50",   label: "Attendance" },
  feedback:     { icon: MessageSquare, color: "text-purple-600",  bg: "bg-purple-50",  label: "Teacher Feedback" },
  announcement: { icon: Megaphone,     color: "text-rose-600",    bg: "bg-rose-50",    label: "Announcement" },
  deadline:     { icon: UploadCloud,   color: "text-red-600",     bg: "bg-red-50",     label: "Deadline" },
  exam:         { icon: Clock,         color: "text-orange-600",  bg: "bg-orange-50",  label: "Exam" },
  ai_feedback:  { icon: Bot,           color: "text-ai-purple",   bg: "bg-violet-50",  label: "AI Feedback" },
  plagiarism:   { icon: ShieldAlert,   color: "text-amber-700",   bg: "bg-amber-50",   label: "Plagiarism Alert" },
  marks:        { icon: Star,          color: "text-indigo-600",  bg: "bg-indigo-50",  label: "Marks Published" },
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    api.notifications.getByUser(CURRENT_USER.id).then(n => {
      setNotifications(n);
      setLoading(false);
    });
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    api.notifications.markRead(id);
  };

  const displayed = filter === "unread" ? notifications.filter(n => !n.read) : notifications;
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary">Notifications</h1>
          <p className="text-text-secondary mt-1">
            {unread > 0 ? <span className="font-medium text-primary-600">{unread} unread</span> : "All caught up!"} · {notifications.length} total
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors px-4 py-2 rounded-lg hover:bg-primary-50 border border-transparent hover:border-primary-100"
          >
            Mark all as read
          </button>
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            {(["all", "unread"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("px-4 py-2 text-sm font-medium capitalize transition-colors",
                  filter === f ? "bg-primary-600 text-white" : "bg-white text-text-secondary hover:bg-slate-50"
                )}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : displayed.length === 0 ? (
        <div className="card-container py-16 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
          <h3 className="font-semibold text-text-primary mb-1">All caught up!</h3>
          <p className="text-sm text-text-secondary">No {filter === "unread" ? "unread " : ""}notifications.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((n, i) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.announcement;
            const Icon = meta.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  markRead(n.id);
                  if (n.link) navigate(n.link);
                }}
                className={cn(
                  "flex items-start space-x-4 p-4 rounded-xl border transition-all cursor-pointer group",
                  !n.read
                    ? "bg-primary-50/60 border-primary-200/80 hover:bg-primary-50"
                    : "bg-white border-slate-100 hover:bg-slate-50"
                )}
              >
                <div className={cn("p-2.5 rounded-xl shrink-0 mt-0.5", meta.bg)}>
                  <Icon className={cn("w-5 h-5", meta.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("font-semibold text-sm", !n.read ? "text-text-primary" : "text-text-secondary")}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-text-secondary">{n.time}</span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0"></span>}
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">{n.body}</p>
                  <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-2", meta.bg, meta.color)}>
                    {meta.label}
                  </span>
                </div>
                {n.link && (
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors shrink-0 mt-1.5" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
