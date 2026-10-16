import { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import type { Assignment, Course } from "../lib/types";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [allAsgn, cList] = await Promise.all([
        api.assignments.getAll(),
        api.courses.getAll(),
      ]);
      setAssignments(allAsgn);
      
      const cMap: Record<string, Course> = {};
      cList.forEach(c => cMap[c.id] = c);
      setCourses(cMap);
      
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted">COURSEWORK LEDGER</div>
        <h1 className="font-serif text-3xl text-foreground">Assignments</h1>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-soft border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted">
                <th className="py-3.5 px-5">Assignment</th>
                <th className="py-3.5 px-5">Course</th>
                <th className="py-3.5 px-5">Due Date</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Max Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignments.map((assignment) => {
                const course = courses[assignment.courseId];
                const dueDateStr = new Date(assignment.dueDate).toLocaleDateString();

                return (
                  <tr key={assignment.id} className="hover:bg-surface-soft transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded bg-surface-elevated border border-border text-foreground">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-medium text-sm text-foreground block">{assignment.title}</span>
                          <span className="font-mono text-[11px] text-muted">{assignment.instructions}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-mono text-xs text-foreground">
                      {course ? `${course.code} — ${course.name}` : assignment.courseId.toUpperCase()}
                    </td>
                    <td className="py-4 px-5 font-mono text-xs text-muted">
                      {dueDateStr}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status="Pending" />
                    </td>
                    <td className="py-4 px-5 text-right font-mono text-xs font-semibold text-foreground">
                      {assignment.marks} PTS
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
