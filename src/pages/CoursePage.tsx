import { useState, useEffect, useCallback } from "react";
import { 
  ChevronRight, 
  ChevronDown,
  Download,
  Lock,
  ArrowUpRight,
  Loader2,
  ListTree,
  PanelRightOpen,
  Plus,
  CheckCircle2,
  Circle,
  MessageSquare,
  Users,
  HelpCircle,
  Award,
  BookOpen,
  FlaskConical,
  FileText,
  CheckSquare,
  FolderClosed,
  Globe,
  X,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";
import { cn } from "../lib/utils";
import { api } from "../lib/api";
import type { Course, User, ForumPost, ResourceType } from "../lib/types";

type SectionItem = {
  id: string;
  resourceId?: string;
  type: ResourceType | "experiment" | "assignment";
  title: string;
  code: string;
  description?: string;
  size?: string;
  link?: string;
  completionType?: "manual" | "automatic";
  completionRule?: string;
  completed: boolean;
  hiddenFromStudents?: boolean;
};

type Section = {
  id: string;
  order: number;
  title: string;
  summary?: string;
  restrictionText?: string;
  status: "locked" | "in-progress" | "completed";
  hiddenFromStudents?: boolean;
  items: SectionItem[];
};

type SecondaryTab = "course" | "participants" | "grades" | "forums" | "questions" | "competencies";

const MOODLE_ACTIVITY_CHOOSER: {
  category: "activity" | "resource";
  type: ResourceType;
  label: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  { category: "activity", type: "quiz", label: "Quiz / Concept Check", desc: "Time-bounded MCQ, short answer, and coding exam with automatic grading.", icon: HelpCircle },
  { category: "activity", type: "forum", label: "Discussion Forum", desc: "Asynchronous Q&A and announcement threads for course cohorts.", icon: MessageSquare },
  { category: "activity", type: "workshop", label: "Peer Review Workshop", desc: "Multi-stage submission and peer code review rubric activity.", icon: Users },
  { category: "activity", type: "glossary", label: "Technical Glossary", desc: "Collaborative dictionary of programming terms and runtime definitions.", icon: BookOpen },
  { category: "resource", type: "pdf", label: "File / Specification PDF", desc: "Upload a syllabus, lab sheet, or reference manual PDF.", icon: FileText },
  { category: "resource", type: "notes", label: "Lecture Notes / Page", desc: "Structured markdown or rich-text instructional document.", icon: BookOpen },
  { category: "resource", type: "folder", label: "Code Dataset Folder", desc: "Bundle starter scripts and test fixtures in a downloadable directory.", icon: FolderClosed },
  { category: "resource", type: "link", label: "External URL / LTI Tool", desc: "Link to external documentation, GitHub repositories, or LTI 1.3 tools.", icon: Globe },
];

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Moodle 4+ Layout & Navigation States
  const [activeTab, setActiveTab] = useState<SecondaryTab>("course");
  const [courseIndexOpen, setCourseIndexOpen] = useState<boolean>(true);
  const [blockDrawerOpen, setBlockDrawerOpen] = useState<boolean>(true);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState<boolean>(() => {
    return localStorage.getItem("moodle_edit_mode") === "true";
  });

  // Strict Moodle Role Check: Only Teacher and Admin can use Edit Mode
  const isStaff = user?.role === "teacher" || user?.role === "admin";
  const canEdit = isStaff && editMode;

  // Inline Rename State (Moodle Pencil Icon workflow)
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState<string>("");

  // Moodle Activity Chooser Modal States
  const [chooserModuleId, setChooserModuleId] = useState<string | null>(null);
  const [chooserFilter, setChooserFilter] = useState<"all" | "activity" | "resource">("all");
  const [newActType, setNewActType] = useState<ResourceType>("quiz");
  const [newActTitle, setNewActTitle] = useState("");
  const [newActDesc, setNewActDesc] = useState("");

  // Participant & Forum States
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      setEditMode(Boolean(custom.detail));
    };
    window.addEventListener("moodle-edit-mode-change", handler);
    return () => window.removeEventListener("moodle-edit-mode-change", handler);
  }, []);

  const loadCourseData = useCallback(async () => {
    if (!courseId) return;
    const [c, allUsers, posts] = await Promise.all([
      api.courses.getById(courseId),
      api.users.getAll(),
      api.forums.getByCourse(courseId),
    ]);
    if (!c) {
      setLoading(false);
      return;
    }
    setCourse(c);
    setParticipants(allUsers);
    setForumPosts(posts);

    const modules = await api.modules.getByCourse(courseId);

    const loadedSections: Section[] = await Promise.all(
      modules.map(async (m) => {
        const [resources, experiments, assignments] = await Promise.all([
          api.resources.getByModule(m.id),
          api.experiments.getByModule(m.id),
          api.assignments.getByModule(m.id),
        ]);

        const items: SectionItem[] = [];

        resources.forEach((r, idx) => {
          items.push({
            id: r.id,
            resourceId: r.id,
            type: r.type,
            code: `RES-0${idx + 1}`,
            title: r.title,
            description: r.description,
            size: r.size,
            link: r.url,
            completionType: r.completionType || "manual",
            completionRule: r.completionRule || "View",
            completed: Boolean(r.completed),
            hiddenFromStudents: false,
          });
        });

        experiments.forEach((e, idx) => {
          items.push({
            id: e.id,
            type: "experiment",
            code: `EXP-0${idx + 1}`,
            title: e.title,
            description: e.objective,
            link: `/labs/${e.id}`,
            completionType: "automatic",
            completionRule: "Submit code & verify lab record",
            completed: e.id === "exp-01",
            hiddenFromStudents: false,
          });
        });

        assignments.forEach((a, idx) => {
          items.push({
            id: a.id,
            type: "assignment",
            code: `ASGN-0${idx + 1}`,
            title: a.title,
            description: a.instructions,
            link: `/assignments`,
            completionType: "automatic",
            completionRule: "Make a submission & receive a grade",
            completed: a.id === "a1",
            hiddenFromStudents: false,
          });
        });

        let status: Section["status"] = "in-progress";
        if (m.order <= 1) status = "completed";
        else if (m.order >= 3) status = "locked";

        return {
          id: m.id,
          order: m.order,
          title: m.title,
          summary: m.summary,
          restrictionText: m.restrictionText,
          status,
          hiddenFromStudents: false,
          items,
        };
      })
    );

    setSections(loadedSections);
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const handleToggleManualCompletion = async (item: SectionItem) => {
    if (item.resourceId) {
      await api.resources.toggleCompletion(item.resourceId);
      loadCourseData();
    } else {
      setSections((prev) =>
        prev.map((s) => ({
          ...s,
          items: s.items.map((it) =>
            it.id === item.id ? { ...it, completed: !it.completed } : it
          ),
        }))
      );
    }
  };

  // Inline Edit Mode Handlers (Rename, Hide/Show, Reorder, Delete)
  const startInlineRename = (item: SectionItem) => {
    setEditingItemId(item.id);
    setEditingTitleValue(item.title);
  };

  const commitInlineRename = (sectionId: string, itemId: string) => {
    if (!editingTitleValue.trim()) {
      setEditingItemId(null);
      return;
    }
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((it) =>
                it.id === itemId ? { ...it, title: editingTitleValue.trim() } : it
              ),
            }
          : s
      )
    );
    setEditingItemId(null);
  };

  const toggleItemVisibility = (sectionId: string, itemId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((it) =>
                it.id === itemId
                  ? { ...it, hiddenFromStudents: !it.hiddenFromStudents }
                  : it
              ),
            }
          : s
      )
    );
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, hiddenFromStudents: !s.hiddenFromStudents } : s
      )
    );
  };

  const moveItemInSection = (sectionId: string, index: number, direction: -1 | 1) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const targetIdx = index + direction;
        if (targetIdx < 0 || targetIdx >= s.items.length) return s;
        const nextItems = [...s.items];
        const [moved] = nextItems.splice(index, 1);
        nextItems.splice(targetIdx, 0, moved);
        return { ...s, items: nextItems };
      })
    );
  };

  const deleteItemFromSection = (sectionId: string, itemId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((it) => it.id !== itemId) }
          : s
      )
    );
  };

  const deleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const handleCreateActivity = async () => {
    if (!chooserModuleId || !courseId || !newActTitle.trim()) return;
    await api.resources.create(
      chooserModuleId,
      courseId,
      newActTitle.trim(),
      newActType,
      newActDesc.trim() || undefined
    );
    setChooserModuleId(null);
    setNewActTitle("");
    setNewActDesc("");
    loadCourseData();
  };

  const handleAddSection = async () => {
    if (!courseId) return;
    await api.modules.create(
      courseId,
      `MODULE ${sections.length} — ADVANCED TOPICS & CAPSTONE`,
      "Newly added Moodle topic section."
    );
    loadCourseData();
  };

  const handleCreateForumPost = async () => {
    if (!courseId || !newPostTitle.trim() || !newPostBody.trim()) return;
    await api.forums.createPost(
      courseId,
      newPostTitle.trim(),
      newPostBody.trim(),
      user?.name || "Midhun",
      user?.role || "student"
    );
    setNewPostTitle("");
    setNewPostBody("");
    loadCourseData();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-20 text-muted">Course not found.</div>;
  }

  const visibleSections = sections.filter((s) => (isStaff ? true : !s.hiddenFromStudents));
  const allItems = visibleSections.flatMap((s) =>
    s.items.filter((it) => (isStaff ? true : !it.hiddenFromStudents))
  );
  const completedCount = allItems.filter((i) => i.completed).length;
  const liveProgress =
    allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : course.progress || 0;

  const SECONDARY_TABS: { id: SecondaryTab; label: string; count?: number }[] = [
    { id: "course", label: "Course" },
    { id: "participants", label: "Participants", count: participants.length },
    { id: "grades", label: "Grades" },
    { id: "forums", label: "Forums & Announcements", count: forumPosts.length },
    { id: "questions", label: "Question bank", count: 5 },
    { id: "competencies", label: "Competencies", count: 4 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Top Course Banner + Drawer Toggles */}
      <Card className="p-6 blueprint-grid">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2 font-mono text-xs text-muted uppercase tracking-wider">
            <Link to="/courses" className="hover:text-foreground transition-colors">
              MY COURSES
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{course.category || "DEPT-CS"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-semibold">{course.code}</span>
          </div>

          {/* Moodle 4+ Left Course Index & Right Block Drawer Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCourseIndexOpen((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[11px] border transition-colors",
                courseIndexOpen
                  ? "bg-foreground text-surface border-foreground"
                  : "bg-surface text-muted border-border hover:text-foreground"
              )}
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>Course index</span>
            </button>
            <button
              onClick={() => setBlockDrawerOpen((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[11px] border transition-colors",
                blockDrawerOpen
                  ? "bg-foreground text-surface border-foreground"
                  : "bg-surface text-muted border-border hover:text-foreground"
              )}
            >
              <PanelRightOpen className="w-3.5 h-3.5" />
              <span>Block drawer</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif text-3xl md:text-4xl text-foreground">{course.name}</h1>
              {canEdit && (
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-primary-600 text-white font-semibold">
                  INSTRUCTOR EDIT MODE ACTIVE
                </span>
              )}
            </div>
            <p className="text-sm text-muted mt-1.5 max-w-2xl">{course.description}</p>
          </div>

          <div className="w-full md:w-64 pt-4 md:pt-0 border-t md:border-t-0 border-border">
            <div className="flex items-center justify-between font-mono text-xs mb-1.5">
              <span className="text-muted">ACTIVITY COMPLETION</span>
              <span className="font-semibold text-foreground">
                {completedCount}/{allItems.length} ({liveProgress}%)
              </span>
            </div>
            <div className="w-full bg-surface-elevated rounded-sm h-1.5 overflow-hidden">
              <div
                className="bg-foreground h-1.5 transition-all duration-500"
                style={{ width: `${liveProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Moodle 4+ Contextual Secondary Navigation Bar */}
        <div className="mt-6 pt-3 border-t border-border flex items-center gap-1 overflow-x-auto">
          {SECONDARY_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "px-3.5 py-2 rounded-md font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shrink-0",
                activeTab === t.id
                  ? "bg-foreground text-surface font-semibold"
                  : "text-muted hover:text-foreground hover:bg-surface-elevated"
              )}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded text-[10px]",
                    activeTab === t.id ? "bg-white/20 text-white" : "bg-surface-elevated text-muted"
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* TAB 1: MAIN MOODLE COURSE VIEW (WITH COURSE INDEX & BLOCK DRAWER) */}
      {activeTab === "course" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Moodle Course Index Drawer */}
          {courseIndexOpen && (
            <Card className="lg:col-span-3 p-4 space-y-3 sticky top-20">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  Course Index
                </span>
                <button
                  onClick={() =>
                    setCollapsedSections(
                      Object.keys(collapsedSections).length > 0
                        ? {}
                        : Object.fromEntries(visibleSections.map((s) => [s.id, true]))
                    )
                  }
                  className="font-mono text-[10px] text-primary-600 hover:underline"
                >
                  {Object.keys(collapsedSections).length > 0 ? "Expand all" : "Collapse all"}
                </button>
              </div>

              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                {visibleSections.map((sec) => (
                  <div key={sec.id} className="space-y-1">
                    <a
                      href={`#section-${sec.id}`}
                      className="flex items-center justify-between text-xs font-semibold text-foreground hover:text-primary-600 py-1"
                    >
                      <span className="truncate">{sec.title.split("—")[0]}</span>
                      {sec.status === "locked" && <Lock className="w-3 h-3 text-muted shrink-0" />}
                    </a>
                    <div className="pl-2.5 border-l border-border space-y-1">
                      {sec.items
                        .filter((it) => (isStaff ? true : !it.hiddenFromStudents))
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 text-[11px] text-muted py-0.5 truncate"
                          >
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full shrink-0",
                                item.completed
                                  ? "bg-success"
                                  : "border border-muted bg-transparent"
                              )}
                            />
                            <span className="truncate">{item.title}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Center Course Sections & Activities */}
          <div
            className={cn(
              "space-y-5",
              courseIndexOpen && blockDrawerOpen
                ? "lg:col-span-6"
                : courseIndexOpen || blockDrawerOpen
                ? "lg:col-span-9"
                : "lg:col-span-12"
            )}
          >
            {visibleSections.map((section) => {
              const isLocked = section.status === "locked" && !canEdit;
              const isCollapsed = Boolean(collapsedSections[section.id]);
              const visibleItems = section.items.filter((it) =>
                isStaff ? true : !it.hiddenFromStudents
              );

              return (
                <Card
                  key={section.id}
                  id={`section-${section.id}`}
                  className={cn(
                    "!p-0 overflow-hidden",
                    isLocked && "opacity-75",
                    section.hiddenFromStudents && "border-dashed border-warning/60"
                  )}
                >
                  {/* Section Header */}
                  <div className="bg-surface-soft border-b border-border px-5 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setCollapsedSections((prev) => ({
                            ...prev,
                            [section.id]: !prev[section.id],
                          }))
                        }
                        className="flex items-center gap-2.5 text-left min-w-0"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted shrink-0" />
                        )}
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border text-foreground shrink-0">
                          {section.order === 0 ? "GEN" : `SEC 0${section.order}`}
                        </span>
                        <h2 className="font-sans text-sm font-semibold text-foreground truncate">
                          {section.title}
                        </h2>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        {section.hiddenFromStudents && (
                          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-warning/15 text-warning border border-warning/30">
                            Hidden from students
                          </span>
                        )}

                        {canEdit ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleSectionVisibility(section.id)}
                              title={section.hiddenFromStudents ? "Show topic" : "Hide topic"}
                              className="p-1.5 rounded bg-surface border border-border text-muted hover:text-foreground"
                            >
                              {section.hiddenFromStudents ? (
                                <EyeOff className="w-3.5 h-3.5 text-warning" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {section.order > 0 && (
                              <button
                                type="button"
                                onClick={() => deleteSection(section.id)}
                                title="Delete topic section"
                                className="p-1.5 rounded bg-surface border border-border text-muted hover:text-error"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ) : isLocked ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded">
                            <Lock className="w-3 h-3" /> Restricted
                          </span>
                        ) : (
                          <StatusBadge
                            status={
                              section.status === "completed" ? "Completed" : "In Progress"
                            }
                          />
                        )}
                      </div>
                    </div>

                    {section.summary && !isCollapsed && (
                      <p className="text-xs text-muted mt-2 pl-7">{section.summary}</p>
                    )}

                    {section.restrictionText && !isCollapsed && (
                      <div className="mt-2.5 ml-7 p-2.5 rounded bg-surface border border-border flex items-center gap-2 font-mono text-[11px] text-muted">
                        <Lock className="w-3.5 h-3.5 text-warning shrink-0" />
                        <span>{section.restrictionText}</span>
                      </div>
                    )}
                  </div>

                  {/* Section Activities & Resources */}
                  {!isCollapsed && (
                    <div className="divide-y divide-border">
                      {visibleItems.map((item, idx) => {
                        const isRenaming = editingItemId === item.id;

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                              !isLocked && "hover:bg-surface-soft",
                              item.hiddenFromStudents && "bg-surface-soft/60 opacity-75"
                            )}
                          >
                            <div className="flex items-start gap-3.5 min-w-0 flex-1">
                              <div
                                className={cn(
                                  "p-2 rounded border shrink-0 mt-0.5",
                                  item.type === "experiment"
                                    ? "bg-primary-50 border-primary-200 text-primary-700"
                                    : item.type === "forum"
                                    ? "bg-amber-50 border-amber-200 text-amber-700"
                                    : item.type === "quiz"
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-surface-elevated border-border text-foreground"
                                )}
                              >
                                {item.type === "experiment" ? (
                                  <FlaskConical className="w-4 h-4" />
                                ) : item.type === "forum" ? (
                                  <MessageSquare className="w-4 h-4" />
                                ) : item.type === "quiz" ? (
                                  <HelpCircle className="w-4 h-4" />
                                ) : item.type === "assignment" ? (
                                  <CheckSquare className="w-4 h-4" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-muted">
                                    {item.type}
                                  </span>

                                  {isRenaming ? (
                                    <div className="flex items-center gap-1.5 flex-1">
                                      <input
                                        autoFocus
                                        type="text"
                                        value={editingTitleValue}
                                        onChange={(e) => setEditingTitleValue(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter")
                                            commitInlineRename(section.id, item.id);
                                          if (e.key === "Escape") setEditingItemId(null);
                                        }}
                                        className="bg-surface border border-primary-600 rounded px-2 py-0.5 text-xs font-medium text-foreground focus:outline-none flex-1"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => commitInlineRename(section.id, item.id)}
                                        className="p-1 rounded bg-foreground text-surface"
                                        title="Save title"
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      {item.link === "#forum" ? (
                                        <button
                                          onClick={() => setActiveTab("forums")}
                                          className="text-sm font-medium text-foreground hover:text-primary-600 text-left"
                                        >
                                          {item.title}
                                        </button>
                                      ) : item.link && item.link !== "#" && !isLocked ? (
                                        <Link
                                          to={item.link}
                                          className="text-sm font-medium text-foreground hover:text-primary-600 inline-flex items-center gap-1"
                                        >
                                          <span>{item.title}</span>
                                          <ArrowUpRight className="w-3.5 h-3.5 text-muted" />
                                        </Link>
                                      ) : (
                                        <span className="text-sm font-medium text-foreground">
                                          {item.title}
                                        </span>
                                      )}

                                      {/* Moodle Inline Pencil Rename Trigger */}
                                      {canEdit && (
                                        <button
                                          type="button"
                                          onClick={() => startInlineRename(item)}
                                          title="Edit title inline"
                                          className="p-1 text-muted hover:text-primary-600 rounded"
                                        >
                                          <Pencil className="w-3 h-3" />
                                        </button>
                                      )}
                                    </>
                                  )}

                                  {item.hiddenFromStudents && (
                                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-warning/15 text-warning border border-warning/30">
                                      Hidden from students
                                    </span>
                                  )}

                                  {item.size && (
                                    <span className="font-mono text-[10px] text-muted">
                                      ({item.size})
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-muted mt-1 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right Side: Either Instructor Edit Toolbar OR Student Completion Pills */}
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              {canEdit ? (
                                <div className="flex items-center gap-1 bg-surface-soft p-1 rounded border border-border">
                                  <button
                                    type="button"
                                    onClick={() => moveItemInSection(section.id, idx, -1)}
                                    disabled={idx === 0}
                                    title="Move up"
                                    className="p-1 text-muted hover:text-foreground disabled:opacity-30 rounded"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveItemInSection(section.id, idx, 1)}
                                    disabled={idx === visibleItems.length - 1}
                                    title="Move down"
                                    className="p-1 text-muted hover:text-foreground disabled:opacity-30 rounded"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleItemVisibility(section.id, item.id)}
                                    title={
                                      item.hiddenFromStudents
                                        ? "Show to students"
                                        : "Hide from students"
                                    }
                                    className="p-1 text-muted hover:text-foreground rounded"
                                  >
                                    {item.hiddenFromStudents ? (
                                      <EyeOff className="w-3.5 h-3.5 text-warning" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteItemFromSection(section.id, item.id)}
                                    title="Delete activity"
                                    className="p-1 text-muted hover:text-error rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {item.completionType === "manual" ? (
                                    <button
                                      type="button"
                                      disabled={isLocked}
                                      onClick={() => handleToggleManualCompletion(item)}
                                      className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[11px] border transition-colors",
                                        item.completed
                                          ? "bg-success/10 text-success border-success/30 font-semibold"
                                          : "bg-surface text-muted border-border hover:text-foreground"
                                      )}
                                    >
                                      {item.completed ? (
                                        <>
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>Done</span>
                                        </>
                                      ) : (
                                        <>
                                          <Circle className="w-3.5 h-3.5" />
                                          <span>Mark as done</span>
                                        </>
                                      )}
                                    </button>
                                  ) : (
                                    <span
                                      className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] border",
                                        item.completed
                                          ? "bg-success/10 text-success border-success/30 font-semibold"
                                          : "bg-surface-soft text-muted border-border"
                                      )}
                                    >
                                      {item.completed ? "Done:" : "To do:"} {item.completionRule}
                                    </span>
                                  )}

                                  {["notes", "presentation", "pdf"].includes(item.type) &&
                                    !isLocked && (
                                      <Button variant="ghost" size="icon" title="Download resource">
                                        <Download className="w-4 h-4" />
                                      </Button>
                                    )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Moodle Edit Mode: "+ Add an activity or resource" Button */}
                      {canEdit && (
                        <div className="p-3 bg-surface-soft flex justify-center">
                          <button
                            type="button"
                            onClick={() => setChooserModuleId(section.id)}
                            className="w-full py-2 border border-dashed border-primary-500/60 rounded-md font-mono text-xs text-primary-700 hover:bg-primary-50/60 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add an activity or resource</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}

            {canEdit && (
              <button
                type="button"
                onClick={handleAddSection}
                className="w-full py-3 border-2 border-dashed border-border hover:border-foreground rounded-card font-mono text-xs font-semibold uppercase text-foreground flex items-center justify-center gap-2 transition-colors bg-surface"
              >
                <Plus className="w-4 h-4" />
                <span>Add topic / course section</span>
              </button>
            )}
          </div>

          {/* Right Moodle Block Drawer */}
          {blockDrawerOpen && (
            <div className="lg:col-span-3 space-y-4 sticky top-20">
              {/* Completion Progress Block */}
              <Card className="p-4 space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  MOODLE BLOCK // COMPLETION
                </div>
                <h3 className="font-serif text-base text-foreground">Completion Progress</h3>
                <div className="grid grid-cols-7 gap-1">
                  {allItems.map((it) => (
                    <div
                      key={it.id}
                      title={`${it.title}: ${it.completed ? "Completed" : "To do"}`}
                      className={cn(
                        "h-5 rounded-sm border",
                        it.completed
                          ? "bg-success border-success"
                          : "bg-surface-elevated border-border"
                      )}
                    />
                  ))}
                </div>
                <p className="font-mono text-[11px] text-muted">
                  {completedCount} of {allItems.length} activities completed ({liveProgress}%)
                </p>
              </Card>

              {/* Latest Announcements Block */}
              <Card className="p-4 space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  MOODLE BLOCK // FORUM
                </div>
                <h3 className="font-serif text-base text-foreground">Latest Announcements</h3>
                <div className="space-y-2.5 divide-y divide-border">
                  {forumPosts.slice(0, 2).map((fp) => (
                    <div key={fp.id} className="pt-2 first:pt-0">
                      <button
                        onClick={() => setActiveTab("forums")}
                        className="text-xs font-medium text-foreground hover:text-primary-600 text-left line-clamp-1"
                      >
                        {fp.title}
                      </button>
                      <span className="font-mono text-[10px] text-muted block">
                        {fp.authorName} · {fp.repliesCount} replies
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Upcoming Deadlines Block */}
              <Card className="p-4 space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  MOODLE BLOCK // TIMELINE
                </div>
                <h3 className="font-serif text-base text-foreground">Upcoming Events</h3>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded bg-surface-soft border border-border">
                    <span className="text-error text-[10px] block font-semibold">TODAY // 23:59</span>
                    <button
                      onClick={() => navigate("/labs/exp-01")}
                      className="text-foreground hover:underline text-left font-sans font-medium text-xs"
                    >
                      Experiment 01 Record Due
                    </button>
                  </div>
                  <div className="p-2.5 rounded bg-surface-soft border border-border">
                    <span className="text-muted text-[10px] block">15 NOV // 10:00</span>
                    <button
                      onClick={() => navigate("/exam/exam-01")}
                      className="text-foreground hover:underline text-left font-sans font-medium text-xs"
                    >
                      CS201 Mid-Term Exam
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MOODLE PARTICIPANTS & GROUPS DIRECTORY */}
      {activeTab === "participants" && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-border bg-surface-soft flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                ENROLLED COHORT &amp; GROUPS
              </span>
              <h2 className="font-serif text-xl text-foreground">
                Course Participants ({participants.length})
              </h2>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-surface border border-border rounded px-3 py-1.5 text-foreground"
              >
                <option value="all">Role: All</option>
                <option value="student">Role: Student</option>
                <option value="teacher">Role: Teacher</option>
              </select>
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="bg-surface border border-border rounded px-3 py-1.5 text-foreground"
              >
                <option value="all">Group: All Groups</option>
                <option value="Batch A (Lab 1)">Batch A (Lab 1)</option>
                <option value="Batch B (Lab 2)">Batch B (Lab 2)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted bg-surface">
                  <th className="py-3.5 px-5">Full name</th>
                  <th className="py-3.5 px-5">Roles</th>
                  <th className="py-3.5 px-5">Groups</th>
                  <th className="py-3.5 px-5">Last access to course</th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {participants
                  .filter((u) => (roleFilter === "all" ? true : u.role === roleFilter))
                  .filter((u) => (groupFilter === "all" ? true : u.group === groupFilter))
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-surface-soft transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-foreground">{u.name}</div>
                        <div className="font-mono text-[11px] text-muted">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs uppercase text-foreground">
                        {u.role}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-muted">
                        {u.group || "Batch A (Lab 1)"}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-muted">
                        {u.lastAccess || "Today"}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <StatusBadge status="Active" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: MOODLE GRADEBOOK (USER REPORT) */}
      {activeTab === "grades" && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-border bg-surface-soft flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                MOODLE GRADEBOOK // USER REPORT
              </span>
              <h2 className="font-serif text-xl text-foreground">
                Course Gradebook — {course.name}
              </h2>
            </div>
            <StatusBadge status="Verified" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted bg-surface">
                  <th className="py-3.5 px-5">Grade item</th>
                  <th className="py-3.5 px-5">Calculated weight</th>
                  <th className="py-3.5 px-5">Grade</th>
                  <th className="py-3.5 px-5">Range</th>
                  <th className="py-3.5 px-5">Percentage</th>
                  <th className="py-3.5 px-5">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                <tr className="bg-surface-elevated/60 font-mono font-semibold text-foreground">
                  <td className="py-3 px-5" colSpan={6}>
                    ▼ Category: Laboratory Experiments &amp; Digital Records (Weight: 40%)
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-foreground pl-8">
                    Experiment 01: Basic I/O &amp; Types
                  </td>
                  <td className="py-3.5 px-5 font-mono text-muted">20.00%</td>
                  <td className="py-3.5 px-5 font-mono font-semibold text-foreground">9.50</td>
                  <td className="py-3.5 px-5 font-mono text-muted">0–10</td>
                  <td className="py-3.5 px-5 font-mono text-success font-semibold">95.00%</td>
                  <td className="py-3.5 px-5 text-muted">
                    Clean standard I/O pipeline; add ValueError guard.
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-foreground pl-8">
                    Experiment 02: Pattern Printing
                  </td>
                  <td className="py-3.5 px-5 font-mono text-muted">20.00%</td>
                  <td className="py-3.5 px-5 font-mono text-muted">—</td>
                  <td className="py-3.5 px-5 font-mono text-muted">0–10</td>
                  <td className="py-3.5 px-5 font-mono text-muted">—</td>
                  <td className="py-3.5 px-5 text-muted">Pending submission</td>
                </tr>
                <tr className="bg-surface-elevated/60 font-mono font-semibold text-foreground">
                  <td className="py-3 px-5" colSpan={6}>
                    ▼ Category: Course Assignments (Weight: 30%)
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-foreground pl-8">
                    Assignment 01: Number Guesser
                  </td>
                  <td className="py-3.5 px-5 font-mono text-muted">15.00%</td>
                  <td className="py-3.5 px-5 font-mono font-semibold text-foreground">9.00</td>
                  <td className="py-3.5 px-5 font-mono text-muted">0–10</td>
                  <td className="py-3.5 px-5 font-mono text-success font-semibold">90.00%</td>
                  <td className="py-3.5 px-5 text-muted">Optimal O(log N) binary search bounds.</td>
                </tr>
                <tr className="bg-surface-elevated/60 font-mono font-semibold text-foreground">
                  <td className="py-3 px-5" colSpan={6}>
                    ▼ Category: Proctored Examinations &amp; Quizzes (Weight: 30%)
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-foreground pl-8">
                    Module 1 Concept Check Quiz
                  </td>
                  <td className="py-3.5 px-5 font-mono text-muted">10.00%</td>
                  <td className="py-3.5 px-5 font-mono font-semibold text-foreground">5.00</td>
                  <td className="py-3.5 px-5 font-mono text-muted">0–5</td>
                  <td className="py-3.5 px-5 font-mono text-success font-semibold">100.00%</td>
                  <td className="py-3.5 px-5 text-muted">Full mastery verified.</td>
                </tr>
                <tr className="bg-surface-soft font-mono font-bold text-foreground border-t-2 border-foreground">
                  <td className="py-4 px-5">COURSE TOTAL (AGGREGATE)</td>
                  <td className="py-4 px-5">100.00%</td>
                  <td className="py-4 px-5">23.50 / 25.00</td>
                  <td className="py-4 px-5">0–100</td>
                  <td className="py-4 px-5 text-primary-600">94.00% (A+)</td>
                  <td className="py-4 px-5">First Class with Distinction</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: MOODLE ANNOUNCEMENTS & DISCUSSION FORUM */}
      {activeTab === "forums" && (
        <div className="space-y-5">
          <Card className="p-5 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              START NEW DISCUSSION TOPIC
            </span>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Discussion subject..."
                className="bg-surface-soft border border-border rounded-md px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary-600"
              />
              <textarea
                value={newPostBody}
                onChange={(e) => setNewPostBody(e.target.value)}
                rows={2}
                placeholder="Write your question or announcement to the course cohort..."
                className="bg-surface-soft border border-border rounded-md p-3 text-xs text-foreground focus:outline-none focus:border-primary-600"
              />
              <div className="flex justify-end">
                <Button variant="primary" size="sm" onClick={handleCreateForumPost}>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post to Forum</span>
                </Button>
              </div>
            </div>
          </Card>

          <Card className="divide-y divide-border">
            {forumPosts.map((fp) => (
              <div key={fp.id} className="p-5 space-y-2 hover:bg-surface-soft transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {fp.pinned && (
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-foreground text-surface">
                        PINNED
                      </span>
                    )}
                    <h3 className="font-semibold text-sm text-foreground">{fp.title}</h3>
                  </div>
                  <span className="font-mono text-[10px] text-muted">
                    {fp.repliesCount} REPLIES
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">{fp.body}</p>
                <div className="font-mono text-[10px] text-muted pt-1">
                  POSTED BY {fp.authorName.toUpperCase()} ({fp.authorRole.toUpperCase()}) ·{" "}
                  {new Date(fp.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* TAB 5: MOODLE QUESTION BANK */}
      {activeTab === "questions" && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-border bg-surface-soft flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                MOODLE QUESTION BANK // DEFAULT FOR CS201
              </span>
              <h2 className="font-serif text-xl text-foreground">
                Standardized Assessment Question Repository
              </h2>
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate("/exam/exam-01")}>
              <span>Preview Proctored Exam</span>
            </Button>
          </div>
          <div className="divide-y divide-border text-xs">
            {[
              { id: "QB-01", type: "MULTIPLE CHOICE", title: "Output of print(type(5))", marks: "5.0" },
              { id: "QB-02", type: "MULTIPLE CHOICE", title: "Standard input acquisition function in Python", marks: "5.0" },
              { id: "QB-03", type: "MULTIPLE CHOICE", title: "Integer conversion via int('42')", marks: "5.0" },
              { id: "QB-04", type: "SHORT ANSWER", title: "Mutable lists vs. immutable tuples in memory", marks: "10.0" },
              { id: "QB-05", type: "CODE RUNNER (JUDGE0)", title: "Iterative range(1, 11) stdout loop", marks: "15.0" },
            ].map((q) => (
              <div key={q.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground">
                    {q.id}
                  </span>
                  <span className="font-mono text-[10px] text-primary-600 font-semibold">
                    [{q.type}]
                  </span>
                  <span className="font-medium text-foreground">{q.title}</span>
                </div>
                <span className="font-mono text-muted">{q.marks} PTS</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 6: MOODLE COMPETENCY FRAMEWORK */}
      {activeTab === "competencies" && (
        <Card className="divide-y divide-border">
          {[
            { code: "CO-01", title: "Construct type-safe standard I/O pipelines in Python 3", rating: "Proficient", linked: "Experiment 01, Quiz 01" },
            { code: "CO-02", title: "Design deterministic branching and nested iteration loops", rating: "Proficient", linked: "Experiment 02, Assignment 01" },
            { code: "CO-03", title: "Analyze time and space complexity of sequence operations", rating: "In Review", linked: "Assignment 02" },
            { code: "CO-04", title: "Defend algorithmic trade-offs in oral viva voce examinations", rating: "Proficient", linked: "Socratic Viva Simulator" },
          ].map((comp) => (
            <div key={comp.code} className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded bg-surface-elevated border border-border">
                  <Award className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-foreground">{comp.code}</span>
                    <span className="text-sm font-medium text-foreground">{comp.title}</span>
                  </div>
                  <p className="font-mono text-[11px] text-muted mt-1">
                    LINKED EVIDENCE: {comp.linked}
                  </p>
                </div>
              </div>
              <StatusBadge status={comp.rating === "Proficient" ? "Verified" : "Pending"} />
            </div>
          ))}
        </Card>
      )}

      {/* MOODLE "ADD AN ACTIVITY OR RESOURCE" MODAL */}
      {chooserModuleId && (
        <div className="fixed inset-0 bg-ide-bg/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-card border border-border shadow-modal max-w-2xl w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-surface-soft flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  MOODLE ACTIVITY CHOOSER
                </span>
                <h2 className="font-serif text-xl text-foreground">
                  Add an activity or resource
                </h2>
              </div>
              <button
                onClick={() => setChooserModuleId(null)}
                className="p-1 text-muted hover:text-foreground rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex gap-1.5 border-b border-border pb-3">
                {(["all", "activity", "resource"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setChooserFilter(tab)}
                    className={cn(
                      "px-3 py-1 rounded font-mono text-xs uppercase border transition-colors",
                      chooserFilter === tab
                        ? "bg-foreground text-surface border-foreground font-semibold"
                        : "bg-surface-soft text-muted border-border hover:text-foreground"
                    )}
                  >
                    {tab === "all" ? "All" : tab === "activity" ? "Activities" : "Resources"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto">
                {MOODLE_ACTIVITY_CHOOSER.filter((item) =>
                  chooserFilter === "all" ? true : item.category === chooserFilter
                ).map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setNewActType(item.type)}
                    className={cn(
                      "p-3 rounded-md border text-left transition-all flex items-start gap-3",
                      newActType === item.type
                        ? "border-primary-600 bg-primary-50/50"
                        : "border-border bg-surface hover:bg-surface-soft"
                    )}
                  >
                    <item.icon className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">{item.label}</div>
                      <div className="text-[11px] text-muted mt-0.5 line-clamp-2">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-border space-y-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                    ACTIVITY / RESOURCE TITLE
                  </label>
                  <input
                    type="text"
                    value={newActTitle}
                    onChange={(e) => setNewActTitle(e.target.value)}
                    placeholder="e.g. Week 3 Coding Quiz or Lecture Slides..."
                    className="w-full bg-surface-soft border border-border rounded-md px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary-600"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                    DESCRIPTION &amp; COMPLETION CONDITION (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={newActDesc}
                    onChange={(e) => setNewActDesc(e.target.value)}
                    placeholder="e.g. Complete all 5 questions with >= 80% score"
                    className="w-full bg-surface-soft border border-border rounded-md px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary-600"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-border bg-surface-soft flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setChooserModuleId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateActivity}
                disabled={!newActTitle.trim()}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Course Section</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
