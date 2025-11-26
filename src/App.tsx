import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import DepartmentsPage from "@/pages/DepartmentsPage";
import CoursesPage from "@/pages/CoursesPage";
import CurriculumPage from "@/pages/CurriculumPage";
import CurriculumDetailsPage from "@/pages/CurriculumDetailsPage";
import StudentsPage from "@/pages/StudentsPage";
import StudentDetailsPage from "@/pages/StudentDetailsPage";
import BatchesPage from "@/pages/BatchesPage";
import BatchDetailsPage from "@/pages/BatchDetailsPage";
import TermsPage from "@/pages/TermsPage";
import TermDetailsPage from "@/pages/TermDetailsPage";
import SectionsPage from "@/pages/SectionsPage";
import SectionStudentsPage from "@/pages/SectionStudentsPage";
import SchedulesManagementPage from "@/pages/SchedulesManagementPage";
import FacultyPage from "@/pages/FacultyPage";
import RegistrationPage from "@/pages/RegistrationPage";
import AttendancePage from "@/pages/AttendancePage";
import ReportsPage from "@/pages/ReportsPage";
import GradesManagementPage from "@/pages/GradesManagementPage";
import NotFoundPage from "@/pages/NotFoundPage";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentSchedulePage from "@/pages/student/StudentSchedulePage";
import StudentAttendancePage from "@/pages/student/StudentAttendancePage";
import StudentRequestsPage from "@/pages/student/StudentRequestsPage";
import DepartmentSelectionPage from "@/pages/student/DepartmentSelectionPage";
import StudentGradesPage from "@/pages/student/StudentGradesPage";
import StudentSubjectsPage from "@/pages/student/StudentSubjectsPage";
import SubjectDetailsPage from "@/pages/student/SubjectDetailsPage";
import StudentSettingsPage from "@/pages/student/StudentSettingsPage";
import DepartmentApplicationsPage from "@/pages/DepartmentApplicationsPage";
import SettingsPage from "@/pages/SettingsPage";
import FacultyDashboard from "@/pages/faculty/FacultyDashboard";
import FacultyCourseManagement from "@/pages/faculty/FacultyCourseManagement";
import FacultyReportsPage from "@/pages/faculty/FacultyReportsPage";
import AboutPage from "@/pages/AboutPage";
import VisionPage from "@/pages/VisionPage";
import ContactPage from "@/pages/ContactPage";
import "./i18n/config";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, accessToken } = useAuthStore();

    console.log("🛡️ ProtectedRoute check:", {
        hasUser: !!user,
        hasToken: !!accessToken,
        userRole: user?.role,
    });

    if (!user || !accessToken) {
        console.log("❌ Not authenticated, redirecting to login");
        return <Navigate to="/login" replace />;
    }

    console.log("✅ Authenticated, rendering protected content");
    return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, accessToken } = useAuthStore();

    if (!user || !accessToken) {
        return <Navigate to="/login" replace />;
    }

    // Only SUPER_ADMIN and ADMIN can access admin routes
    if (user?.role !== "SUPER_ADMIN" && user?.role !== "ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

function StudentRoute({ children }: { children: React.ReactNode }) {
    const { user, accessToken } = useAuthStore();

    console.log("🎓 StudentRoute check:", {
        hasUser: !!user,
        hasToken: !!accessToken,
        userRole: user?.role,
        path: window.location.pathname,
    });

    if (!user || !accessToken) {
        console.log(
            "❌ Student not authenticated (no user or token), redirecting to login"
        );
        return <Navigate to="/login" replace />;
    }

    // Only STUDENT can access student routes
    if (user?.role !== "STUDENT") {
        console.log("❌ User is not a STUDENT, redirecting to dashboard");
        return <Navigate to="/dashboard" replace />;
    }

    console.log("✅ Student authenticated, rendering student content");
    return <>{children}</>;
}

function FacultyRoute({ children }: { children: React.ReactNode }) {
    const { user, accessToken } = useAuthStore();

    if (!user || !accessToken) {
        return <Navigate to="/login" replace />;
    }

    // Only FACULTY and TA can access faculty routes
    if (user?.role !== "FACULTY" && user?.role !== "TA") {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                {/* Colleges page removed - College of Computer Science is the only college */}
                <Route
                    path="/departments"
                    element={
                        <AdminRoute>
                            <DepartmentsPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/department-applications"
                    element={
                        <AdminRoute>
                            <DepartmentApplicationsPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/courses"
                    element={
                        <AdminRoute>
                            <CoursesPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/curriculum"
                    element={
                        <AdminRoute>
                            <CurriculumPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/curriculum/:id"
                    element={
                        <AdminRoute>
                            <CurriculumDetailsPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/students"
                    element={
                        <AdminRoute>
                            <StudentsPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/students/:id"
                    element={
                        <AdminRoute>
                            <StudentDetailsPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/batches"
                    element={
                        <AdminRoute>
                            <BatchesPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/batches/:id"
                    element={
                        <AdminRoute>
                            <BatchDetailsPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/terms"
                    element={
                        <AdminRoute>
                            <TermsPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/terms/:id"
                    element={
                        <AdminRoute>
                            <TermDetailsPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/sections"
                    element={
                        <AdminRoute>
                            <SectionsPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/sections/:sectionId/students"
                    element={
                        <AdminRoute>
                            <SectionStudentsPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/schedules"
                    element={
                        <AdminRoute>
                            <SchedulesManagementPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/faculty"
                    element={
                        <AdminRoute>
                            <FacultyPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/student/registration"
                    element={
                        <StudentRoute>
                            <RegistrationPage />
                        </StudentRoute>
                    }
                />
                <Route
                    path="/attendance"
                    element={
                        <ProtectedRoute>
                            <AttendancePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/grades"
                    element={
                        <ProtectedRoute>
                            <GradesManagementPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            {useAuthStore.getState().user?.role === "FACULTY" || 
                             useAuthStore.getState().user?.role === "TA" ? (
                                <FacultyReportsPage />
                            ) : (
                                <ReportsPage />
                            )}
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <AdminRoute>
                            <SettingsPage />
                        </AdminRoute>
                    }
                />
                {/* Faculty Routes */}
                <Route
                    path="/faculty/dashboard"
                    element={
                        <FacultyRoute>
                            <FacultyDashboard />
                        </FacultyRoute>
                    }
                />
                <Route
                    path="/faculty/course/:sectionId"
                    element={
                        <FacultyRoute>
                            <FacultyCourseManagement />
                        </FacultyRoute>
                    }
                />
                {/* Student Routes */}
                <Route
                    path="/student/dashboard"
                    element={
                        <StudentRoute>
                            <StudentDashboard />
                        </StudentRoute>
                    }
                />
                <Route
                    path="/student/grades"
                    element={
                        <StudentRoute>
                            <StudentGradesPage />
                        </StudentRoute>
                    }
                />
                <Route
                    path="/student/settings"
                    element={
                        <StudentRoute>
                            <StudentSettingsPage />
                        </StudentRoute>
                    }
                />
                <Route
                    path="/student/schedule"
                    element={
                        <StudentRoute>
                            <StudentSchedulePage />
                        </StudentRoute>
                    }
                />
                <Route
                    path="/student/attendance"
                    element={
                        <StudentRoute>
                            <StudentAttendancePage />
                        </StudentRoute>
                    }
                />
                <Route
                    path="/student/requests"
                    element={
                        <StudentRoute>
                            <StudentRequestsPage />
                        </StudentRoute>
                    }
                />
                <Route
                    path="/student/subjects"
                    element={
                        <StudentRoute>
                            <StudentSubjectsPage />
                        </StudentRoute>
                    }
                />
                <Route
                    path="/student/subjects/:subjectId"
                    element={
                        <StudentRoute>
                            <SubjectDetailsPage />
                        </StudentRoute>
                    }
                />
                <Route
                    path="/student/department-selection"
                    element={
                        <StudentRoute>
                            <DepartmentSelectionPage />
                        </StudentRoute>
                    }
                />
                <Route
                    path="/"
                    element={<LandingPage />}
                />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/vision" element={<VisionPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
