// User Types
export type Role = "student" | "teacher" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  group?: string;
  lastAccess?: string;
}

// Course Hierarchy
export interface Course {
  id: string;
  code: string;
  name: string;
  category?: string;
  teacherId: string;
  description: string;
  progress?: number;
  totalModules: number;
}

export type ModuleStatus = "locked" | "in-progress" | "completed";

export interface Module {
  id: string;
  courseId: string;
  title: string;
  summary?: string;
  order: number;
  restrictionText?: string;
}

// Moodle Activity & Resource Types
export type ResourceType =
  | "notes"
  | "presentation"
  | "pdf"
  | "zip"
  | "link"
  | "page"
  | "folder"
  | "forum"
  | "quiz"
  | "glossary"
  | "workshop";

export interface Resource {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  type: ResourceType;
  url: string;
  size?: string;
  description?: string;
  completionType?: "manual" | "automatic";
  completionRule?: string;
  completed?: boolean;
}

// Forum Discussion
export interface ForumPost {
  id: string;
  courseId: string;
  title: string;
  authorName: string;
  authorRole: Role;
  createdAt: string;
  pinned?: boolean;
  repliesCount: number;
  body: string;
}

// Experiment & Digital Record
export type CodeStatus = "Not Started" | "In Progress" | "Submitted" | "Passed" | "Failed";
export type RecordStatus = "Not Started" | "Writing" | "Ready to Submit" | "Submitted" | "Under Review" | "Correction Required" | "Verified";

export interface Experiment {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  objective: string;
  theory: string;
  algorithm: string;
  instructions: string;
  expectedOutput: string;
  language: string;
  marks: number;
  dueDate: string;
}

export interface TestCase {
  id: string;
  experimentId: string;
  input: string;
  expectedOutput: string;
  hidden: boolean;
}

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
  error?: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  testResults?: TestCaseResult[];
}

export interface LabRecord {
  id: string;
  experimentId: string;
  studentId: string;
  codeStatus: CodeStatus;
  recordStatus: RecordStatus;
  codeContent?: string;
  theoryContent?: string;
  algorithmContent?: string;
  outputContent?: string;
  submittedAt?: string;
  reviewedAt?: string;
  marksObtained?: number;
  teacherFeedback?: string;
  aiFeedback?: string;
  reviewerId?: string;
}

// Assignments
export type AssignmentStatus = "Not Submitted" | "Draft" | "Submitted" | "Under Review" | "Graded";

export interface Assignment {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  instructions: string;
  dueDate: string;
  marks: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: AssignmentStatus;
  fileUrl?: string;
  textContent?: string;
  submittedAt?: string;
  marksObtained?: number;
  teacherFeedback?: string;
}

// Notifications
export type NotificationType =
  | "assignment"
  | "resource"
  | "verified"
  | "attendance"
  | "feedback"
  | "announcement"
  | "deadline"
  | "exam"
  | "ai_feedback"
  | "plagiarism"
  | "marks";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  link?: string;
}

// Calendar
export type EventType = "lab" | "assignment" | "exam" | "record" | "announcement" | "quiz" | "milestone";

export interface CalendarEvent {
  id: string;
  courseId?: string;
  title: string;
  type: EventType;
  date: string;
  link?: string;
}

// Attendance
export interface AttendanceSession {
  id: string;
  courseId: string;
  date: string;
  type: "lab" | "lecture";
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: "present" | "absent" | "late";
}

// Additional Database-Ready Entities
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  role: "student" | "teacher" | "ta";
  group?: string;
}

// Quiz / Viva
export type QuestionType = "multiple_choice" | "short_answer" | "code";

export interface Quiz {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  timeLimit?: number;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

// Exam
export interface Exam {
  id: string;
  courseId: string;
  title: string;
  date: string;
  duration: number;
  totalMarks: number;
  questions: ExamQuestion[];
}

export interface ExamQuestion {
  id: string;
  examId: string;
  text: string;
  type: "multiple_choice" | "short_answer" | "code";
  options?: string[];
  correctAnswer?: string;
  marks: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  startedAt: string;
  completedAt?: string;
  score?: number;
  answers: Record<string, string>;
  violations: ExamViolation[];
}

export interface ExamViolation {
  id: string;
  type: "tab_switch" | "focus_loss" | "copy_paste" | "right_click";
  timestamp: string;
  description: string;
}

// Feedback
export interface Feedback {
  id: string;
  targetId: string;
  targetType: "lab_record" | "assignment";
  teacherId: string;
  content: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  targetId: string;
  targetType: "lab_record" | "assignment" | "exam";
  score: number;
  maxScore: number;
}

// Plagiarism
export interface PlagiarismResult {
  id: string;
  experimentId: string;
  runAt: string;
  pairs: PlagiarismPair[];
  status: "pending" | "completed";
}

export interface PlagiarismPair {
  id: string;
  studentAId: string;
  studentBId: string;
  similarityScore: number;
  flagged: boolean;
  teacherDecision?: "cleared" | "flagged" | "pending";
  teacherNote?: string;
  snippetA?: string;
  snippetB?: string;
}
