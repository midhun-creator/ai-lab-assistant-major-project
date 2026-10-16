import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PageLayout from "./components/layout/PageLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyCourses from "./pages/MyCourses";
import CoursePage from "./pages/CoursePage";
import ExperimentPage from "./pages/ExperimentPage";
import Assignments from "./pages/Assignments";
import Submissions from "./pages/Submissions";
import Attendance from "./pages/Attendance";
import Resources from "./pages/Resources";
import ProgrammingWorkspace from "./pages/ProgrammingWorkspace";
import AITutorPage from "./pages/AITutorPage";
import Notifications from "./pages/Notifications";
import CalendarPage from "./pages/CalendarPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherRecordReview from "./pages/TeacherRecordReview";
import TeacherCourseManagement from "./pages/TeacherCourseManagement";
import TeacherAttendance from "./pages/TeacherAttendance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminReports from "./pages/reports/AdminReports";
import TeacherReports from "./pages/reports/TeacherReports";
import StudentReports from "./pages/reports/StudentReports";
import ExamMode from "./pages/ExamMode";
import PlagiarismDashboard from "./pages/teacher/PlagiarismDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Exam Mode — full screen, no sidebar */}
          <Route path="/exam/:examId" element={
            <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
              <ExamMode />
            </ProtectedRoute>
          } />

          {/* Programming Workspace — full screen, no sidebar */}
          <Route path="/workspace" element={
            <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
              <ProgrammingWorkspace />
            </ProtectedRoute>
          } />
          <Route path="/labs/:expId/workspace" element={
            <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
              <ProgrammingWorkspace />
            </ProtectedRoute>
          } />

          {/* All other pages — with sidebar layout */}
          <Route path="/" element={<ProtectedRoute><PageLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={["student"]}><Dashboard /></ProtectedRoute>} />
            {/* Shared Moodle Course & Lab Routes for Students, Teachers & Admins */}
            <Route path="courses" element={<ProtectedRoute allowedRoles={["student", "teacher", "admin"]}><MyCourses /></ProtectedRoute>} />
            <Route path="courses/:courseId" element={<ProtectedRoute allowedRoles={["student", "teacher", "admin"]}><CoursePage /></ProtectedRoute>} />
            <Route path="labs/:expId" element={<ProtectedRoute allowedRoles={["student", "teacher", "admin"]}><ExperimentPage /></ProtectedRoute>} />
            <Route path="assignments" element={<ProtectedRoute allowedRoles={["student", "teacher", "admin"]}><Assignments /></ProtectedRoute>} />
            <Route path="submissions" element={<ProtectedRoute allowedRoles={["student"]}><Submissions /></ProtectedRoute>} />
            <Route path="attendance" element={<ProtectedRoute allowedRoles={["student"]}><Attendance /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute allowedRoles={["student"]}><StudentReports /></ProtectedRoute>} />
            <Route path="resources" element={<ProtectedRoute allowedRoles={["student", "teacher", "admin"]}><Resources /></ProtectedRoute>} />
            <Route path="ai-tutor" element={<ProtectedRoute allowedRoles={["student", "teacher", "admin"]}><AITutorPage /></ProtectedRoute>} />
            
            {/* Shared Routes */}
            <Route path="notifications" element={<Notifications />} />
            <Route path="calendar" element={<CalendarPage />} />

            {/* Teacher Routes */}
            <Route path="teacher" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="teacher/records" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><TeacherRecordReview /></ProtectedRoute>} />
            <Route path="teacher/courses" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><TeacherCourseManagement /></ProtectedRoute>} />
            <Route path="teacher/attendance" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><TeacherAttendance /></ProtectedRoute>} />
            <Route path="teacher/reports" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><TeacherReports /></ProtectedRoute>} />
            <Route path="teacher/plagiarism" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><PlagiarismDashboard /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="admin">
              <Route index element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReports /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={
              <div className="p-8 text-muted text-center max-w-md mx-auto mt-20">
                <h2 className="font-serif text-2xl text-foreground mb-2">Section Not Found</h2>
                <p className="text-xs font-mono">Return to the laboratory workbench.</p>
              </div>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
