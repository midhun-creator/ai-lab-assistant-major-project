import { useState, useEffect } from "react";
import { 
  Users,
  Search,
  XCircle,
  Save,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { api } from "../lib/api";
import type { Course } from "../lib/types";
import { cn } from "../lib/utils";

const STUDENTS = [
  { id: "u1", name: "Midhun", roll: "21CS01" },
  { id: "u2", name: "Arjun K.", roll: "21CS02" },
  { id: "u3", name: "Priya M.", roll: "21CS03" },
  { id: "u4", name: "Rahul T.", roll: "21CS04" },
  { id: "u5", name: "Sneha V.", roll: "21CS05" },
];

export default function TeacherAttendance() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent">>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const c = await api.courses.getAll();
      setCourses(c);
      if (c.length > 0) setSelectedCourse(c[0].id);
      
      // Initialize everyone as present
      const init: Record<string, "present" | "absent"> = {};
      STUDENTS.forEach(s => init[s.id] = "present");
      setAttendance(init);
      
      setLoading(false);
    }
    load();
  }, []);

  const toggleStatus = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present"
    }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Attendance saved successfully!");
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const presentCount = Object.values(attendance).filter(s => s === "present").length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary">Mark Attendance</h1>
          <p className="text-text-secondary mt-1">Manage daily attendance for your lab sessions.</p>
        </div>
      </div>

      <div className="card-container space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4 border-b border-slate-100 pb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-text-primary mb-1.5">Select Course / Lab</label>
            <select 
              value={selectedCourse} 
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
          </div>
          <div className="w-48 shrink-0">
            <label className="block text-sm font-semibold text-text-primary mb-1.5">Date</label>
            <input 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="w-full md:w-64 shrink-0 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-secondary" />
            </div>
            <input 
              type="text"
              placeholder="Search student..."
              className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between bg-surface-blueish p-4 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Total Students</p>
                <p className="font-bold text-text-primary">{STUDENTS.length}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-xs text-text-secondary">Present</p>
                <p className="font-bold text-emerald-600">{presentCount}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-text-secondary">Absent</p>
                <p className="font-bold text-amber-600">{STUDENTS.length - presentCount}</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold shadow-md flex items-center space-x-2 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Attendance</span>
          </button>
        </div>

        {/* Student List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-text-secondary">
                <th className="p-4 font-semibold w-16">Roll No</th>
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {STUDENTS.map((s) => {
                const isPresent = attendance[s.id] === "present";
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-text-secondary font-mono text-xs">{s.roll}</td>
                    <td className="p-4 font-semibold text-text-primary">{s.name}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleStatus(s.id)}
                        className={cn(
                          "inline-flex items-center justify-center w-28 py-1.5 rounded-lg text-xs font-bold transition-all border",
                          isPresent 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        )}
                      >
                        {isPresent ? "Present" : "Absent"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
