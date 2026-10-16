import { useState } from "react";
import { FileText, UploadCloud, FolderClosed, Download, Trash2, Plus } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";

interface PrivateFileItem {
  id: string;
  name: string;
  folder: string;
  size: string;
  updatedAt: string;
}

export default function Resources() {
  const [files, setFiles] = useState<PrivateFileItem[]>([
    { id: "pf-1", name: "CS201_Syllabus_and_Rubric_2026.pdf", folder: "/CS201/Reference", size: "1.2 MB", updatedAt: "10 Oct 2026" },
    { id: "pf-2", name: "Python_3.11_Runtime_Notes.pdf", folder: "/CS201/Module_01", size: "2.4 MB", updatedAt: "11 Oct 2026" },
    { id: "pf-3", name: "exp01_backup_solution.py", folder: "/Private_Files/Drafts", size: "4.2 KB", updatedAt: "14 Oct 2026" },
    { id: "pf-4", name: "Data_Structures_Trees_Slides.pdf", folder: "/CS301/Module_02", size: "5.1 MB", updatedAt: "12 Oct 2026" },
  ]);
  const [newFileName, setNewFileName] = useState("");

  const handleAddMockFile = () => {
    const name = newFileName.trim() || `lab_notes_${files.length + 1}.pdf`;
    setFiles((prev) => [
      {
        id: `pf-${Date.now()}`,
        name,
        folder: "/Private_Files/Uploads",
        size: "340 KB",
        updatedAt: "Just now",
      },
      ...prev,
    ]);
    setNewFileName("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 blueprint-grid">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            MOODLE REPOSITORY // PRIVATE FILES &amp; COURSE MATERIALS
          </div>
          <h1 className="font-serif text-3xl text-foreground">Private Files &amp; Course Repository</h1>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-muted">STORAGE QUOTA: 8.7 MB / 100 MB (8.7%)</span>
          <StatusBadge status="Active" />
        </div>
      </div>

      {/* Upload Dropzone Bar */}
      <Card className="p-5 bg-surface-soft border-dashed border-2 border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded bg-surface border border-border text-foreground">
            <UploadCloud className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Upload to Moodle Private Files</h2>
            <p className="text-xs text-muted">
              Store draft code files, lab observation datasets, and reference PDFs across courses.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="e.g. experiment_02_draft.py"
            className="bg-surface border border-border rounded-md px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none focus:border-primary-600"
          />
          <Button variant="primary" size="sm" onClick={handleAddMockFile}>
            <Plus className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </Button>
        </div>
      </Card>

      {/* File Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-surface-soft flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderClosed className="w-4 h-4 text-muted" />
            <span className="font-mono text-xs font-semibold uppercase text-foreground">
              Directory Listing ({files.length} items)
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted">MAX ATTACHMENT SIZE: 50 MB</span>
        </div>
        <div className="divide-y divide-border">
          {files.map((f) => (
            <div
              key={f.id}
              className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-soft transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2 rounded bg-surface-elevated border border-border text-foreground">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                  <p className="font-mono text-[11px] text-muted">{f.folder}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-mono text-xs text-muted hidden sm:inline">{f.size}</span>
                <span className="font-mono text-xs text-muted hidden md:inline">{f.updatedAt}</span>
                <Button variant="ghost" size="icon" title="Download">
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete from Private Files"
                  onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                >
                  <Trash2 className="w-4 h-4 text-muted hover:text-error" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
