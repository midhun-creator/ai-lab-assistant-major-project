import { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronRight, Save, X, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { Course, Module } from "../lib/types";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";

export default function TeacherCourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Record<string, Module[]>>({});
  const [expandedCourse, setExpandedCourse] = useState<string | null>("cs201");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const c = await api.courses.getAll();
      setCourses(c);
      if (c.length > 0) {
        const m = await api.modules.getByCourse(c[0].id);
        setModules({ [c[0].id]: m });
      }
    }
    load();
  }, []);

  const toggleCourse = async (courseId: string) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      if (!modules[courseId]) {
        const m = await api.modules.getByCourse(courseId);
        setModules((prev) => ({ ...prev, [courseId]: m }));
      }
    }
  };

  const openCourseInMoodleEditMode = (courseId: string) => {
    localStorage.setItem("moodle_edit_mode", "true");
    window.dispatchEvent(new CustomEvent("moodle-edit-mode-change", { detail: true }));
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 blueprint-grid">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            CURRICULUM ARCHITECTURE // MOODLE COURSE BUILDER
          </div>
          <h1 className="font-serif text-3xl text-foreground">Course &amp; Module Administration</h1>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>Provision New Course</span>
        </Button>
      </div>

      <div className="space-y-4">
        {courses.map((course) => {
          const isExpanded = expandedCourse === course.id;
          const courseModules = modules[course.id] || [];

          return (
            <Card key={course.id} className="!p-0 overflow-hidden">
              <div
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-surface-soft transition-colors"
                onClick={() => toggleCourse(course.id)}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-1 text-muted">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground">
                        {course.code}
                      </span>
                      <h2 className="font-serif text-xl text-foreground">{course.name}</h2>
                      <StatusBadge status="Active" />
                    </div>
                    <p className="text-xs text-muted mt-1">{course.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openCourseInMoodleEditMode(course.id)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Open in Moodle Edit Mode →</span>
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="bg-surface-soft border-t border-border p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                      CONFIGURED SYLLABUS SECTIONS ({courseModules.length})
                    </span>
                    <button
                      onClick={() => openCourseInMoodleEditMode(course.id)}
                      className="font-mono text-xs text-primary-600 hover:underline"
                    >
                      + Add or reorder activities in Course Builder →
                    </button>
                  </div>

                  <div className="divide-y divide-border border border-border rounded-md bg-surface">
                    {courseModules.map((mod) => (
                      <div key={mod.id} className="px-4 py-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-semibold text-foreground mr-2">
                            SEC 0{mod.order}:
                          </span>
                          <span className="font-medium text-foreground">{mod.title}</span>
                        </div>
                        <span className="font-mono text-[10px] text-muted">PUBLISHED</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-ide-bg/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-card border border-border shadow-modal w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-surface-soft flex items-center justify-between">
              <h2 className="font-serif text-xl text-foreground">Provision New Course</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted mb-1">COURSE CODE</label>
                <input className="w-full border border-border rounded-md p-2 bg-surface-soft" placeholder="e.g. CS401" />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted mb-1">COURSE TITLE</label>
                <input className="w-full border border-border rounded-md p-2 bg-surface-soft" placeholder="e.g. Operating Systems Lab" />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted mb-1">SYLLABUS SUMMARY</label>
                <textarea className="w-full border border-border rounded-md p-2 bg-surface-soft h-20" />
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-border bg-surface-soft flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
                <Save className="w-3.5 h-3.5" />
                <span>Create Course</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
