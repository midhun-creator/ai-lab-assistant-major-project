import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { cn } from "../lib/utils";
import { api } from "../lib/api";
import type { CalendarEvent, EventType } from "../lib/types";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const EVENT_TAG: Record<EventType, { tag: string; style: string }> = {
  lab:          { tag: "LAB",  style: "bg-primary-50 text-primary-700 border-primary-200" },
  assignment:   { tag: "ASGN", style: "bg-warning/10 text-warning border-warning/30" },
  exam:         { tag: "EXAM", style: "bg-error/10 text-error border-error/30" },
  record:       { tag: "REC",  style: "bg-surface-elevated text-foreground border-border" },
  announcement: { tag: "INFO", style: "bg-surface-elevated text-muted border-border" },
  quiz:         { tag: "QUIZ", style: "bg-primary-50 text-primary-700 border-primary-200" },
  milestone:    { tag: "MILE", style: "bg-success/10 text-success border-success/30" },
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.calendar.getEvents().then((e) => {
      setEvents(e);
      setLoading(false);
    });
  }, []);

  const getDay = (iso: string) => new Date(iso).getDate();
  const today = 14;

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 blueprint-grid">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            CHRONOLOGICAL SCHEDULE // OCTOBER 2026
          </div>
          <h1 className="font-serif text-3xl text-foreground">Academic &amp; Laboratory Schedule</h1>
        </div>
        <StatusBadge status="Active" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
          {/* Calendar Matrix */}
          <Card className="xl:col-span-8 !p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-soft">
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-xl text-foreground">October 2026</h2>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-surface border border-border text-muted">
                  SEMESTER 04
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <button className="p-1.5 rounded border border-border bg-surface hover:bg-surface-elevated text-muted">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="px-2.5 py-1 font-mono text-xs font-medium text-foreground bg-surface border border-border rounded">
                  TODAY (14 OCT)
                </button>
                <button className="p-1.5 rounded border border-border bg-surface hover:bg-surface-elevated text-muted">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-border bg-surface">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="py-2.5 text-center font-mono text-[10px] font-semibold text-muted tracking-widest"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 bg-surface">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const dayEvents = events.filter((e) => getDay(e.date) === day);
                const isToday = day === today;
                return (
                  <div
                    key={day}
                    className={cn(
                      "border-b border-r border-border h-24 p-2 transition-colors",
                      isToday ? "bg-primary-50/40" : "hover:bg-surface-soft"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          "font-mono text-xs px-1.5 py-0.5 rounded",
                          isToday
                            ? "bg-foreground text-surface font-semibold"
                            : "text-muted"
                        )}
                      >
                        {String(day).padStart(2, "0")}
                      </span>
                      {isToday && (
                        <span className="font-mono text-[9px] uppercase text-primary-600 font-semibold">
                          NOW
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const meta = EVENT_TAG[ev.type];
                        return (
                          <button
                            key={ev.id}
                            onClick={() => ev.link && navigate(ev.link)}
                            className={cn(
                              "w-full text-left font-mono text-[10px] px-1.5 py-0.5 rounded border truncate transition-opacity hover:opacity-80",
                              meta.style
                            )}
                          >
                            {meta.tag}: {ev.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Right 4 Cols: Chronological Dispatch Queue */}
          <Card className="xl:col-span-4 !p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-surface-soft">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                SCHEDULED MILESTONES
              </span>
              <h3 className="font-serif text-lg text-foreground">Upcoming Dispatches</h3>
            </div>
            <div className="divide-y divide-border">
              {sortedEvents.map((ev) => {
                const meta = EVENT_TAG[ev.type];
                return (
                  <button
                    key={ev.id}
                    onClick={() => ev.link && navigate(ev.link)}
                    className="w-full p-4 text-left hover:bg-surface-soft transition-colors flex items-start justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border font-semibold",
                            meta.style
                          )}
                        >
                          {meta.tag}
                        </span>
                        <span className="font-mono text-[11px] text-muted">
                          {new Date(ev.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary-600 transition-colors">
                        {ev.title}
                      </p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
