import type { 
  Course, Module, Resource, Experiment, LabRecord, 
  Assignment, AssignmentSubmission, Notification, CalendarEvent, User, CodeStatus,
  Exam, ExamAttempt, PlagiarismResult, TestCase, TestCaseResult, ForumPost, ResourceType
} from './types';

export const CURRENT_USER: User = {
  id: "u-101",
  name: "Midhun",
  email: "midhun@gpc.edu.in",
  role: "student",
  group: "Batch A (Lab 1)",
  lastAccess: "Just now"
};

export const TEACHER_USER: User = {
  id: "u-201",
  name: "Prof. Sarah Jenkins",
  email: "sarah@gpc.edu.in",
  role: "teacher",
  group: "All Groups",
  lastAccess: "12 mins ago"
};

let db = {
  users: [
    CURRENT_USER,
    TEACHER_USER,
    { id: "u-102", name: "Alice Smith", email: "alice@gpc.edu.in", role: "student", group: "Batch A (Lab 1)", lastAccess: "1 hour ago" },
    { id: "u-103", name: "Bob Johnson", email: "bob@gpc.edu.in", role: "student", group: "Batch B (Lab 2)", lastAccess: "2 days ago" },
    { id: "u-104", name: "Charlie Davis", email: "charlie@gpc.edu.in", role: "student", group: "Batch B (Lab 2)", lastAccess: "5 hours ago" },
  ] as User[],
  enrollments: [
    { id: "e1", userId: "u-101", courseId: "cs201", enrolledAt: "2026-08-01T00:00:00Z", role: "student", group: "Batch A (Lab 1)" },
    { id: "e2", userId: "u-102", courseId: "cs201", enrolledAt: "2026-08-01T00:00:00Z", role: "student", group: "Batch A (Lab 1)" },
    { id: "e3", userId: "u-103", courseId: "cs201", enrolledAt: "2026-08-01T00:00:00Z", role: "student", group: "Batch B (Lab 2)" },
    { id: "e4", userId: "u-104", courseId: "cs201", enrolledAt: "2026-08-01T00:00:00Z", role: "student", group: "Batch B (Lab 2)" },
    { id: "e5", userId: "u-201", courseId: "cs201", enrolledAt: "2026-08-01T00:00:00Z", role: "teacher", group: "All Groups" },
  ],
  attendanceSessions: [
    { id: "att-s1", courseId: "cs201", date: "2026-10-10T10:00:00Z", type: "lab" },
    { id: "att-s2", courseId: "cs201", date: "2026-10-12T10:00:00Z", type: "lecture" },
  ],
  attendanceRecords: [
    { id: "ar1", sessionId: "att-s1", studentId: "u-101", status: "present" },
    { id: "ar2", sessionId: "att-s1", studentId: "u-102", status: "present" },
    { id: "ar3", sessionId: "att-s1", studentId: "u-103", status: "absent" },
    { id: "ar4", sessionId: "att-s1", studentId: "u-104", status: "absent" },
    { id: "ar5", sessionId: "att-s2", studentId: "u-101", status: "present" },
    { id: "ar6", sessionId: "att-s2", studentId: "u-102", status: "absent" },
    { id: "ar7", sessionId: "att-s2", studentId: "u-103", status: "absent" },
    { id: "ar8", sessionId: "att-s2", studentId: "u-104", status: "present" },
  ],
  courses: [
    { id: "cs201", code: "CS201", category: "Dept. of Computer Science / Semester 04", name: "Python Programming", teacherId: "u-201", description: "Foundational syntax, control structures, and standard I/O pipelines in Python 3.", progress: 83, totalModules: 4 },
    { id: "cs301", code: "CS301", category: "Dept. of Computer Science / Semester 04", name: "Data Structures", teacherId: "u-201", description: "Algorithmic complexity, linked lists, trees, and graph traversal implementations.", progress: 45, totalModules: 6 },
  ] as Course[],
  modules: [
    { id: "m0", courseId: "cs201", title: "GENERAL — COURSE ORIENTATION & ANNOUNCEMENTS", summary: "Official course announcements, syllabus specification, evaluation rubric, and lab safety rules.", order: 0 },
    { id: "m1", courseId: "cs201", title: "MODULE 1 — PYTHON BASICS & STANDARD I/O", summary: "Variables, dynamic typing, standard input/output streams, and type conversion.", order: 1 },
    { id: "m2", courseId: "cs201", title: "MODULE 2 — CONTROL FLOW & ITERATION", summary: "Conditional branching, loop invariants, and nested iteration patterns.", order: 2 },
    { id: "m3", courseId: "cs201", title: "MODULE 3 — SEQUENCES, LISTS & DICTIONARIES", summary: "Hash maps, list comprehensions, and memory mutability.", order: 3, restrictionText: "Not available unless: The activity Experiment 02: Pattern Printing is marked complete" },
  ] as Module[],
  resources: [
    { id: "r0-1", moduleId: "m0", courseId: "cs201", title: "Course Announcements & Faculty Dispatches", type: "forum", url: "#forum", description: "Mandatory subscription forum for exam dates and lab schedule updates.", completionType: "automatic", completionRule: "View", completed: true },
    { id: "r0-2", moduleId: "m0", courseId: "cs201", title: "CS201 Syllabus & Rubrics Specification (2026)", type: "pdf", url: "#", size: "1.2 MB", completionType: "manual", completed: true },
    { id: "r1", moduleId: "m1", courseId: "cs201", title: "Python 3.11 Runtime & I/O Reference", type: "notes", url: "#", size: "2.4 MB", completionType: "manual", completed: true },
    { id: "r2", moduleId: "m1", courseId: "cs201", title: "Type Systems & Memory Binding Slides", type: "presentation", url: "#", size: "5.1 MB", completionType: "manual", completed: true },
    { id: "r2-q", moduleId: "m1", courseId: "cs201", title: "Module 1 Concept Check Quiz", type: "quiz", url: "/ai-tutor", completionType: "automatic", completionRule: "Receive a passing grade", completed: false },
    { id: "r3", moduleId: "m2", courseId: "cs201", title: "Control Flow & Loop Invariants", type: "notes", url: "#", size: "1.8 MB", completionType: "manual", completed: false },
    { id: "r4", moduleId: "m2", courseId: "cs201", title: "Peer Code Review Workshop: Loop Optimization", type: "workshop", url: "#", completionType: "automatic", completionRule: "Submit work & assess 2 peers", completed: false },
  ] as Resource[],
  forumPosts: [
    {
      id: "fp-1",
      courseId: "cs201",
      title: "Lab Record Verification Schedule for Batch A & Batch B",
      authorName: "Prof. Sarah Jenkins",
      authorRole: "teacher",
      createdAt: "2026-10-13T11:30:00Z",
      pinned: true,
      repliesCount: 4,
      body: "Please ensure Stage 1 code execution for Experiment 01 passes all visible and hidden test cases in the Lab Workspace before submitting your Stage 2 Digital Lab Record."
    },
    {
      id: "fp-2",
      courseId: "cs201",
      title: "Clarification on ValueError handling in Experiment 01",
      authorName: "Midhun",
      authorRole: "student",
      createdAt: "2026-10-14T08:15:00Z",
      pinned: false,
      repliesCount: 2,
      body: "Should our program re-prompt the user in a while-loop when int(input()) raises a ValueError, or exit with a formatted diagnostic message?"
    }
  ] as ForumPost[],
  experiments: [
    { 
      id: "exp-01", moduleId: "m1", courseId: "cs201", 
      title: "Experiment 01: Basic I/O & Types", 
      objective: "Implement standard input acquisition, explicit integer type casting, and formatted stdout interpolation in Python.",
      theory: "Python provides the built-in print() function to write to standard output and input() to read newline-delimited strings from standard input. Explicit casting via int() or float() is required prior to numeric operations.",
      algorithm: "1. Start\n2. Read user name string from stdin via input()\n3. Bind string to identifier 'name'\n4. Read age token from stdin and cast via int()\n5. Emit formatted greeting to stdout\n6. Stop",
      instructions: "Follow the algorithm specification and verify against all test cases.",
      expectedOutput: "Enter your name: Midhun\nEnter your age: 20\nHello, Midhun!\nYou are 20 years old.",
      language: "python", marks: 10, dueDate: "2026-10-28T23:59:59Z"
    },
    { id: "exp-02", moduleId: "m2", courseId: "cs201", title: "Experiment 02: Pattern Printing", objective: "Construct nested iteration loops to emit geometric character patterns.", theory: "Nested for-loops control row and column indices independently across standard output.", algorithm: "1. Start\n2. Initialize outer loop for row index\n3. Initialize inner loop for column output\n4. Stop", instructions: "Use nested for-loops.", expectedOutput: "*\n**\n***", language: "python", marks: 10, dueDate: "2026-11-05T23:59:59Z" }
  ] as Experiment[],
  testCases: [
    { id: "tc-01-1", experimentId: "exp-01", input: "Midhun\n20", expectedOutput: "Enter your name: \nEnter your age: \nHello, Midhun!\nYou are 20 years old.", hidden: false },
    { id: "tc-01-2", experimentId: "exp-01", input: "Alice\n18", expectedOutput: "Enter your name: \nEnter your age: \nHello, Alice!\nYou are 18 years old.", hidden: true },
  ] as TestCase[],
  labRecords: [
    {
      id: "rec1", experimentId: "exp-01", studentId: "u-101", 
      codeStatus: "Submitted" as CodeStatus, recordStatus: "Not Started" as const,
      codeContent: "name = input('Enter your name: ')\nage = int(input('Enter your age: '))\nprint(f'Hello, {name}!')\nprint(f'You are {age} years old.')",
      submittedAt: "2026-10-14T08:45:00Z",
      aiFeedback: "STATIC AUDIT SUMMARY [exp-01]\n\n[PASS] Standard input acquisition via input()\n[PASS] Explicit integer conversion via int()\n[PASS] Formatted string literal interpolation\n\n[WARN] Unhandled ValueError if non-numeric string is supplied to int(). Wrap input parsing in a try/except block.\n[INFO] Test Suite: 2/2 test cases passed (including hidden boundary test)."
    },
    {
      id: "rec2", experimentId: "exp-01", studentId: "u-102",
      codeStatus: "Submitted" as CodeStatus, recordStatus: "Submitted" as const,
      codeContent: "name = input('Enter your name: ')\nage = int(input('Enter your age: '))\nprint(f'Hello, {name}!')\nprint(f'You are {age} years old.')",
      theoryContent: "Standard input/output operations in Python use input() and print().",
      algorithmContent: "1. Read name\n2. Read age as int\n3. Print formatted string",
      outputContent: "Enter your name: Alice\nEnter your age: 19\nHello, Alice!\nYou are 19 years old.",
      submittedAt: "2026-10-14T09:00:00Z"
    },
    {
      id: "rec3", experimentId: "exp-01", studentId: "u-103",
      codeStatus: "Submitted" as CodeStatus, recordStatus: "Submitted" as const,
      codeContent: "name = input('Enter your name: ')\nage = int(input('Enter your age: '))\nprint(f'Hello, {name}!')\nprint(f'You are {age} years old.')",
      theoryContent: "Python input() reads a line from stdin and returns str.",
      algorithmContent: "1. Prompt name\n2. Cast age to int\n3. Print output",
      outputContent: "Enter your name: Bob\nEnter your age: 20\nHello, Bob!\nYou are 20 years old.",
      submittedAt: "2026-10-13T16:30:00Z"
    },
    {
      id: "rec4", experimentId: "exp-01", studentId: "u-104",
      codeStatus: "Submitted" as CodeStatus, recordStatus: "Submitted" as const,
      codeContent: "n = input('Enter your name: ')\na = int(input('Enter your age: '))\nprint(f'Hello, {n}!')\nprint(f'You are {a} years old.')",
      theoryContent: "Basic I/O in Python 3.",
      algorithmContent: "1. Input n and a\n2. Print greeting",
      outputContent: "Enter your name: Charlie\nEnter your age: 21\nHello, Charlie!\nYou are 21 years old.",
      submittedAt: "2026-10-13T16:35:00Z"
    },
  ] as LabRecord[],
  assignments: [
    { id: "a1", moduleId: "m1", courseId: "cs201", title: "Assignment 01: Number Guesser", instructions: "Implement a bounded binary-search number guessing loop.", dueDate: "2026-10-27T23:59:59Z", marks: 10 },
    { id: "a2", moduleId: "m2", courseId: "cs201", title: "Assignment 02: Prime Checker", instructions: "Evaluate primality in O(sqrt(N)) time complexity.", dueDate: "2026-11-03T23:59:59Z", marks: 10 },
  ] as Assignment[],
  assignmentSubmissions: [
    { id: "sub1", assignmentId: "a1", studentId: "u-101", status: "Submitted", marksObtained: 9, submittedAt: "2026-10-12T15:00:00Z" },
    { id: "sub2", assignmentId: "a1", studentId: "u-102", status: "Submitted", marksObtained: 8, submittedAt: "2026-10-12T16:00:00Z" },
    { id: "sub3", assignmentId: "a1", studentId: "u-103", status: "Not Submitted" },
  ] as AssignmentSubmission[],
  notifications: [
    { id: "n1", userId: "u-101", type: "assignment", title: "Assignment 02 Published", body: "Assignment 02: Prime Checker has been published in CS201.", time: "10m ago", read: false, link: "/assignments" },
    { id: "n2", userId: "u-101", type: "verified", title: "Lab Record Verified", body: "Prof. Sarah Jenkins verified your CS201 Lab Record.", time: "1h ago", read: false, link: "/labs/exp-01" },
    { id: "n3", userId: "u-101", type: "ai_feedback", title: "Static Code Audit Ready", body: "Automated analysis for Experiment 01 is available in the Workspace.", time: "30m ago", read: false, link: "/workspace?expId=exp-01" },
    { id: "n4", userId: "u-101", type: "exam", title: "Mid-Term Proctored Exam", body: "CS201 Mid-Term Examination scheduled for Nov 15, 10:00 AM.", time: "2h ago", read: true, link: "/exam/exam-01" },
    { id: "n5", userId: "u-101", type: "marks", title: "Grade Posted", body: "Assignment 01 graded: 9 / 10.", time: "1d ago", read: true, link: "/submissions" },
  ] as Notification[],
  calendarEvents: [
    { id: "ev1", courseId: "cs201", title: "CS201 Lab Session", type: "lab", date: "2026-10-15T10:00:00Z", link: "/labs/exp-01" },
    { id: "ev2", courseId: "cs201", title: "Assignment 01 Deadline", type: "assignment", date: "2026-10-27T23:59:59Z", link: "/assignments" },
    { id: "ev3", courseId: "cs201", title: "Record Verification Cutoff", type: "record", date: "2026-11-01T23:59:59Z", link: "/labs/exp-01" },
    { id: "ev4", courseId: "cs201", title: "CS201 Mid-Term Exam", type: "exam", date: "2026-11-15T10:00:00Z", link: "/exam/exam-01" },
  ] as CalendarEvent[],
  exams: [
    {
      id: "exam-01",
      courseId: "cs201",
      title: "CS201 Mid-Term Examination",
      date: "2026-11-15T10:00:00Z",
      duration: 60,
      totalMarks: 40,
      questions: [
        { id: "q1", examId: "exam-01", text: "What is the output of print(type(5))?", type: "multiple_choice", options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'number'>"], correctAnswer: "<class 'int'>", marks: 5 },
        { id: "q2", examId: "exam-01", text: "Which built-in function reads a line from standard input in Python?", type: "multiple_choice", options: ["cin()", "input()", "read()", "get()"], correctAnswer: "input()", marks: 5 },
        { id: "q3", examId: "exam-01", text: "What does int('42') evaluate to?", type: "multiple_choice", options: ["Raises TypeError", "Integer 42", "String '42'", "Float 42.0"], correctAnswer: "Integer 42", marks: 5 },
        { id: "q4", examId: "exam-01", text: "Contrast mutable lists with immutable tuples in Python memory management.", type: "short_answer", marks: 10 },
        { id: "q5", examId: "exam-01", text: "Write a Python program to print integers 1 through 10 inclusive using a for-loop.", type: "code", marks: 15 },
      ]
    }
  ] as Exam[],
  examAttempts: [] as ExamAttempt[],
  plagiarismResults: [
    {
      id: "pr1",
      experimentId: "exp-01",
      runAt: "2026-10-14T09:00:00Z",
      status: "completed",
      pairs: [
        { id: "pp1", studentAId: "u-103", studentBId: "u-104", similarityScore: 91, flagged: true, teacherDecision: "pending", snippetA: "name = input('Enter your name: ')\nage = int(input('Enter your age: '))\nprint(f'Hello, {name}!')", snippetB: "n = input('Enter your name: ')\na = int(input('Enter your age: '))\nprint(f'Hello, {n}!')" },
        { id: "pp2", studentAId: "u-101", studentBId: "u-102", similarityScore: 72, flagged: false, teacherDecision: "pending", snippetA: "name = input('Enter your name: ')\nage = int(input('Enter your age: '))\nprint(f'Hello, {name}!')", snippetB: "name = input('Enter your name: ')\nage = int(input('Enter your age: '))\nprint(f'Hello, {name}!')" },
        { id: "pp3", studentAId: "u-101", studentBId: "u-103", similarityScore: 38, flagged: false, teacherDecision: "cleared" },
      ]
    }
  ] as PlagiarismResult[],
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  courses: {
    getAll: async () => { await delay(80); return [...db.courses]; },
    getById: async (id: string) => { await delay(80); return db.courses.find(c => c.id === id); }
  },
  modules: {
    getByCourse: async (courseId: string) => { 
      await delay(80); 
      return db.modules.filter(m => m.courseId === courseId).sort((a, b) => a.order - b.order); 
    },
    create: async (courseId: string, title: string, summary?: string) => {
      await delay(100);
      const existing = db.modules.filter(m => m.courseId === courseId);
      const nextOrder = existing.length;
      const newMod: Module = {
        id: `m-${Date.now()}`,
        courseId,
        title: title.toUpperCase(),
        summary: summary || "Custom course section added via Moodle Edit Mode.",
        order: nextOrder,
      };
      db.modules.push(newMod);
      return newMod;
    }
  },
  resources: {
    getByModule: async (moduleId: string) => { await delay(60); return db.resources.filter(r => r.moduleId === moduleId); },
    toggleCompletion: async (resourceId: string) => {
      await delay(60);
      const idx = db.resources.findIndex(r => r.id === resourceId);
      if (idx !== -1) {
        db.resources[idx] = { ...db.resources[idx], completed: !db.resources[idx].completed };
        return db.resources[idx];
      }
      return null;
    },
    create: async (moduleId: string, courseId: string, title: string, type: ResourceType, description?: string) => {
      await delay(100);
      const newRes: Resource = {
        id: `res-${Date.now()}`,
        moduleId,
        courseId,
        title,
        type,
        url: type === "quiz" ? "/ai-tutor" : "#",
        description,
        completionType: type === "quiz" || type === "workshop" ? "automatic" : "manual",
        completionRule: type === "quiz" ? "Receive a grade" : "View",
        completed: false,
      };
      db.resources.push(newRes);
      return newRes;
    }
  },
  forums: {
    getByCourse: async (courseId: string) => {
      await delay(80);
      return db.forumPosts.filter(p => p.courseId === courseId);
    },
    createPost: async (courseId: string, title: string, body: string, authorName: string, authorRole: User["role"]) => {
      await delay(100);
      const post: ForumPost = {
        id: `fp-${Date.now()}`,
        courseId,
        title,
        body,
        authorName,
        authorRole,
        createdAt: new Date().toISOString(),
        pinned: false,
        repliesCount: 0,
      };
      db.forumPosts.unshift(post);
      return post;
    }
  },
  experiments: {
    getByModule: async (moduleId: string) => { await delay(60); return db.experiments.filter(e => e.moduleId === moduleId); },
    getById: async (id: string) => { await delay(60); return db.experiments.find(e => e.id === id); },
    getByCourse: async (courseId: string) => { await delay(60); return db.experiments.filter(e => e.courseId === courseId); }
  },
  testCases: {
    getByExperiment: async (experimentId: string) => {
      await delay(80);
      return db.testCases.filter(tc => tc.experimentId === experimentId && !tc.hidden);
    },
    runTests: async (experimentId: string, code: string): Promise<TestCaseResult[]> => {
      await delay(400);
      const cases = db.testCases.filter(tc => tc.experimentId === experimentId);
      return cases.map(tc => {
        const hasInput = code.includes('input(');
        const hasPrint = code.includes('print(');
        const passed = hasInput && hasPrint;
        return {
          testCaseId: tc.id,
          passed,
          actualOutput: passed ? tc.expectedOutput : "NameError: name is not defined",
          error: passed ? undefined : "Stdout mismatch against expected specification"
        };
      });
    }
  },
  assignments: {
    getAll: async () => { await delay(80); return [...db.assignments]; },
    getByModule: async (moduleId: string) => { await delay(60); return db.assignments.filter(a => a.moduleId === moduleId); },
    getAllPending: async () => {
      await delay(80);
      return db.assignmentSubmissions.filter(s => s.status === "Submitted" || s.status === "Under Review");
    },
    verifySubmission: async (submissionId: string, marks: number, feedback: string) => {
      await delay(100);
      const idx = db.assignmentSubmissions.findIndex(s => s.id === submissionId);
      if (idx !== -1) {
        db.assignmentSubmissions[idx] = {
          ...db.assignmentSubmissions[idx],
          status: "Graded",
          marksObtained: marks,
          teacherFeedback: feedback
        };
        return db.assignmentSubmissions[idx];
      }
      return null;
    }
  },
  records: {
    getByExperimentAndStudent: async (experimentId: string, studentId: string) => {
      await delay(80);
      return db.labRecords.find(r => r.experimentId === experimentId && r.studentId === studentId);
    },
    createIfMissing: async (experimentId: string, studentId: string) => {
      await delay(60);
      const existing = db.labRecords.find(r => r.experimentId === experimentId && r.studentId === studentId);
      if (existing) return existing;
      const newRecord: LabRecord = {
        id: `rec-${Date.now()}`,
        experimentId,
        studentId,
        codeStatus: "Not Started",
        recordStatus: "Not Started"
      };
      db.labRecords.push(newRecord);
      return newRecord;
    },
    updateCode: async (recordId: string, code: string, status: CodeStatus) => {
      await delay(100);
      const idx = db.labRecords.findIndex(r => r.id === recordId);
      if (idx !== -1) {
        db.labRecords[idx] = { ...db.labRecords[idx], codeContent: code, codeStatus: status };
        return db.labRecords[idx];
      }
      return null;
    },
    updateAiFeedback: async (recordId: string, feedback: string) => {
      await delay(80);
      const idx = db.labRecords.findIndex(r => r.id === recordId);
      if (idx !== -1) {
        db.labRecords[idx] = { ...db.labRecords[idx], aiFeedback: feedback };
        return db.labRecords[idx];
      }
      return null;
    },
    updateRecord: async (recordId: string, theory: string, algorithm: string, output: string) => {
      await delay(120);
      const idx = db.labRecords.findIndex(r => r.id === recordId);
      if (idx !== -1) {
        db.labRecords[idx] = { 
          ...db.labRecords[idx], 
          theoryContent: theory, 
          algorithmContent: algorithm, 
          outputContent: output,
          recordStatus: "Submitted",
          submittedAt: new Date().toISOString()
        };
        return db.labRecords[idx];
      }
      return null;
    },
    getAllPending: async () => {
      await delay(80);
      return db.labRecords.filter(r => r.recordStatus === "Submitted" || r.recordStatus === "Under Review");
    },
    getByExperiment: async (experimentId: string) => {
      await delay(80);
      return db.labRecords.filter(r => r.experimentId === experimentId);
    },
    verifyRecord: async (recordId: string, marks: number, feedback: string, status: "Verified" | "Correction Required") => {
      await delay(100);
      const idx = db.labRecords.findIndex(r => r.id === recordId);
      if (idx !== -1) {
        db.labRecords[idx] = {
          ...db.labRecords[idx],
          recordStatus: status,
          marksObtained: marks,
          teacherFeedback: feedback,
          reviewedAt: new Date().toISOString(),
          reviewerId: TEACHER_USER.id
        };
        return db.labRecords[idx];
      }
      return null;
    }
  },
  exams: {
    getAll: async () => { await delay(80); return [...db.exams]; },
    getById: async (id: string) => { await delay(80); return db.exams.find(e => e.id === id); },
    getByCourse: async (courseId: string) => { await delay(80); return db.exams.filter(e => e.courseId === courseId); },
    submitAttempt: async (attempt: Omit<ExamAttempt, 'id'>) => {
      await delay(180);
      const exam = db.exams.find(e => e.id === attempt.examId);
      let score = 0;
      if (exam) {
        for (const q of exam.questions) {
          if (q.correctAnswer && attempt.answers[q.id] === q.correctAnswer) {
            score += q.marks;
          }
        }
      }
      const newAttempt: ExamAttempt = {
        id: `attempt-${Date.now()}`,
        ...attempt,
        score,
        completedAt: new Date().toISOString()
      };
      db.examAttempts.push(newAttempt);
      return newAttempt;
    },
    getViolationReport: async (examId: string) => {
      await delay(80);
      return db.examAttempts.filter(a => a.examId === examId);
    }
  },
  plagiarism: {
    getByExperiment: async (experimentId: string) => {
      await delay(100);
      return db.plagiarismResults.find(pr => pr.experimentId === experimentId);
    },
    runAnalysis: async (experimentId: string) => {
      await delay(500);
      const existing = db.plagiarismResults.find(pr => pr.experimentId === experimentId);
      if (existing) {
        existing.runAt = new Date().toISOString();
        existing.status = "completed";
        return existing;
      }
      return null;
    },
    updateDecision: async (plagiarismResultId: string, pairId: string, decision: "cleared" | "flagged", note: string) => {
      await delay(100);
      const result = db.plagiarismResults.find(pr => pr.id === plagiarismResultId);
      if (result) {
        const pair = result.pairs.find(p => p.id === pairId);
        if (pair) {
          pair.teacherDecision = decision;
          pair.teacherNote = note;
          return pair;
        }
      }
      return null;
    }
  },
  ai: {
    generateFeedback: async (code: string, experimentId: string): Promise<string> => {
      await delay(450);
      const exp = db.experiments.find(e => e.id === experimentId);
      const hasInput = code.includes('input(');
      const hasPrint = code.includes('print(');
      const hasConversion = code.includes('int(') || code.includes('float(');
      
      const checks = [];
      const warnings = [];
      
      if (hasInput) checks.push("[PASS] Standard input acquisition via input()");
      if (hasPrint) checks.push("[PASS] Standard output emission via print()");
      if (hasConversion) checks.push("[PASS] Explicit numeric type conversion");
      if (!code.includes('try')) warnings.push("[WARN] Add try/except ValueError block around int() cast");
      if (!code.includes('#')) warnings.push("[INFO] Document non-trivial blocks with inline comments");
      
      return `STATIC CODE AUDIT — ${exp?.title ?? experimentId}\n\n${checks.join('\n')}\n\nDIAGNOSTICS:\n${warnings.join('\n') || '[OK] Zero warnings raised.'}\n\nNOTE: Automated audit is advisory. Faculty verification is authoritative.`;
    }
  },
  analytics: {
    detectAtRiskStudents: async (courseId: string) => {
      await delay(100);
      const enrolledStudentIds = db.enrollments
        .filter(e => e.courseId === courseId && e.role === "student")
        .map(e => e.userId);
        
      const sessions = db.attendanceSessions.filter(s => s.courseId === courseId);
      const results = [];
      
      for (const studentId of enrolledStudentIds) {
        const student = db.users.find(u => u.id === studentId)!;
        const flags: string[] = [];
        
        const studentAttendance = db.attendanceRecords.filter(ar => ar.studentId === studentId && sessions.some(s => s.id === ar.sessionId));
        const presentCount = studentAttendance.filter(ar => ar.status === "present").length;
        const totalSessions = sessions.length;
        const attendancePercentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 100;
        
        if (attendancePercentage < 75) {
          flags.push(`Attendance below threshold: ${attendancePercentage.toFixed(0)}%`);
        }
        
        const courseAssignments = db.assignments.filter(a => a.courseId === courseId);
        let overdueCount = 0;
        
        for (const assignment of courseAssignments) {
          const sub = db.assignmentSubmissions.find(s => s.assignmentId === assignment.id && s.studentId === studentId);
          if (!sub || sub.status === "Not Submitted") {
            overdueCount++;
          }
        }
        
        if (overdueCount > 0) {
          flags.push(`${overdueCount} unsubmitted assignment(s)`);
        }
        
        if (flags.length > 0) {
          results.push({
            student,
            flags,
            riskLevel: flags.length >= 2 ? "Critical" : "Medium"
          });
        }
      }
      
      return results.sort((a, b) => b.flags.length - a.flags.length);
    }
  },
  users: {
    getAll: async () => {
      await delay(60);
      return [...db.users];
    }
  },
  notifications: {
    getByUser: async (userId: string) => {
      await delay(60);
      return db.notifications.filter(n => n.userId === userId);
    },
    markRead: async (notificationId: string) => {
      await delay(50);
      const n = db.notifications.find(n => n.id === notificationId);
      if (n) n.read = true;
    }
  },
  calendar: {
    getEvents: async () => {
      await delay(60);
      return [...db.calendarEvents];
    }
  }
};
