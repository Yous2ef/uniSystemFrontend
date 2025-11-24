import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

const API_URL = import.meta.env.BACKEND_API_URL || "http://localhost:5000/api";

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // Don't redirect to login if we're already on the login page or if it's a login request
        const isLoginRequest = error.config?.url?.includes("/auth/login");
        const isLoginPage = window.location.pathname === "/login";

        console.log("🚨 API Error:", {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            isLoginRequest,
            isLoginPage,
        });

        if (error.response?.status === 401 && !isLoginRequest && !isLoginPage) {
            // Token expired or invalid - only redirect if not on login page
            console.log("❌ 401 Unauthorized - logging out and redirecting");
            useAuthStore.getState().logout();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// Auth service
export const authService = {
    login: async (email: string, password: string) => {
        const { data } = await api.post("/auth/login", { email, password });
        return data;
    },
    logout: async () => {
        const { data } = await api.post("/auth/logout");
        return data;
    },
    me: async () => {
        const { data } = await api.get("/auth/me");
        return data;
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
        const { data } = await api.put("/auth/change-password", {
            currentPassword,
            newPassword,
        });
        return data;
    },
};

// Colleges service
export const collegesService = {
    getAll: async (params?: any) => {
        const { data } = await api.get("/colleges", { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/colleges/${id}`);
        return data;
    },
    create: async (payload: any) => {
        const { data } = await api.post("/colleges", payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await api.put(`/colleges/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/colleges/${id}`);
        return data;
    },
};

// Departments service
export const departmentsService = {
    getAll: async (params?: any) => {
        const { data } = await api.get("/departments", { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/departments/${id}`);
        return data;
    },
    create: async (payload: any) => {
        const { data } = await api.post("/departments", payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await api.put(`/departments/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/departments/${id}`);
        return data;
    },
};

// Courses service
export const coursesService = {
    getAll: async (params?: any) => {
        const { data } = await api.get("/courses", { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/courses/${id}`);
        return data;
    },
    create: async (payload: any) => {
        const { data } = await api.post("/courses", payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await api.put(`/courses/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/courses/${id}`);
        return data;
    },
    getPrerequisites: async (id: string) => {
        const { data } = await api.get(`/courses/${id}/prerequisites`);
        return data;
    },
    addPrerequisite: async (
        id: string,
        prerequisiteId: string,
        type: string
    ) => {
        const { data } = await api.post(`/courses/${id}/prerequisites`, {
            prerequisiteId,
            type,
        });
        return data;
    },
    removePrerequisite: async (id: string, prereqId: string) => {
        const { data } = await api.delete(
            `/courses/${id}/prerequisites/${prereqId}`
        );
        return data;
    },
};

// Curriculum service
export const curriculumService = {
    getAll: async (params?: any) => {
        const { data } = await api.get("/curriculum", { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/curriculum/${id}`);
        return data;
    },
    create: async (payload: any) => {
        const { data } = await api.post("/curriculum", payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await api.put(`/curriculum/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/curriculum/${id}`);
        return data;
    },
    validate: async (id: string) => {
        const { data } = await api.get(`/curriculum/${id}/validate`);
        return data;
    },
    addCourse: async (id: string, payload: any) => {
        const { data } = await api.post(`/curriculum/${id}/courses`, payload);
        return data;
    },
    updateCourse: async (id: string, courseId: string, payload: any) => {
        const { data } = await api.put(
            `/curriculum/${id}/courses/${courseId}`,
            payload
        );
        return data;
    },
    removeCourse: async (id: string, courseId: string) => {
        const { data } = await api.delete(
            `/curriculum/${id}/courses/${courseId}`
        );
        return data;
    },
};

// Students service
export const studentsService = {
    getAll: async (params?: any) => {
        const { data } = await api.get("/students", { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/students/${id}`);
        return data;
    },
    getByUserId: async (userId: string) => {
        const { data } = await api.get(`/students/user/${userId}`);
        return data;
    },
    create: async (payload: any) => {
        const { data } = await api.post("/students", payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await api.put(`/students/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/students/${id}`);
        return data;
    },
    assignDepartment: async (id: string, departmentId: string) => {
        const { data } = await api.put(`/students/${id}/department`, {
            departmentId,
        });
        return data;
    },
    import: async (formData: FormData) => {
        const { data } = await api.post("/students/import", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },
    getProfile: async () => {
        const { data } = await api.get("/students/profile");
        return data;
    },
    getAcademicStanding: async (studentId: string) => {
        const { data } = await api.get(
            `/students/${studentId}/academic-standing`
        );
        return data;
    },
    getDegreeAudit: async (studentId: string) => {
        const { data } = await api.get(`/students/${studentId}/degree-audit`);
        return data;
    },
    getEnrollmentHistory: async (studentId: string) => {
        const { data } = await api.get(
            `/students/${studentId}/enrollment-history`
        );
        return data;
    },
};

// Batches service
export const batchesService = {
    getAll: async (params?: any) => {
        const { data } = await api.get("/batches", { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/batches/${id}`);
        return data;
    },
    create: async (payload: any) => {
        const { data } = await api.post("/batches", payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await api.put(`/batches/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/batches/${id}`);
        return data;
    },
    getStatistics: async (id: string) => {
        const { data } = await api.get(`/batches/${id}/stats`);
        return data;
    },
};

// Terms service
export const termsService = {
    getAll: async (params?: any) => {
        const { data } = await api.get("/terms", { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/terms/${id}`);
        return data;
    },
    create: async (payload: any) => {
        const { data } = await api.post("/terms", payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await api.put(`/terms/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/terms/${id}`);
        return data;
    },
    getStatistics: async (id: string) => {
        const { data } = await api.get(`/terms/${id}/stats`);
        return data;
    },
};

// Sections service
export const sectionsService = {
    getAll: async (params?: any) => {
        const { data } = await api.get("/sections", { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/sections/${id}`);
        return data;
    },
    create: async (payload: any) => {
        const { data } = await api.post("/sections", payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await api.put(`/sections/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/sections/${id}`);
        return data;
    },
    addSchedule: async (id: string, payload: any) => {
        const { data } = await api.post(`/sections/${id}/schedules`, payload);
        return data;
    },
    deleteSchedule: async (id: string, scheduleId: string) => {
        const { data } = await api.delete(
            `/sections/${id}/schedules/${scheduleId}`
        );
        return data;
    },
    getAttendance: async (id: string) => {
        const { data } = await api.get(`/sections/${id}/attendance`);
        return data;
    },
};

// Enrollments service
export const enrollmentsService = {
    getAll: async (params?: any) => {
        const { data } = await api.get("/enrollments", { params });
        return data;
    },
    getBySectionId: async (sectionId: string) => {
        const { data } = await api.get(`/enrollments/section/${sectionId}`);
        return data;
    },
    getMyEnrollments: async (params?: any) => {
        const { data } = await api.get("/enrollments/my-enrollments", {
            params,
        });
        return data;
    },
    enrollStudent: async (payload: any) => {
        const { data } = await api.post("/enrollments/enroll", payload);
        return data;
    },
    validateEnrollment: async (payload: any) => {
        const { data } = await api.post("/enrollments/validate", payload);
        return data;
    },
    dropEnrollment: async (id: string, bypassTimeCheck: boolean = false) => {
        const { data } = await api.delete(`/enrollments/${id}`, {
            data: { bypassTimeCheck },
        });
        return data;
    },
    getStudentSchedule: async (studentId: string, termId: string) => {
        const { data } = await api.get(
            `/enrollments/schedule/${studentId}/${termId}`
        );
        return data;
    },
};

// Attendance service
export const attendanceService = {
    getAll: async (params?: any) => {
        const { data } = await api.get("/attendance", { params });
        return data;
    },
    mark: async (payload: any) => {
        const { data } = await api.post("/attendance", payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await api.put(`/attendance/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/attendance/${id}`);
        return data;
    },
    getStats: async (enrollmentId: string) => {
        const { data } = await api.get(`/attendance/stats/${enrollmentId}`);
        return data;
    },
    getSectionAttendance: async (sectionId: string, date?: string) => {
        const params = date ? { date } : {};
        const { data } = await api.get(`/attendance/section/${sectionId}`, {
            params,
        });
        return data;
    },
};

// Grades service
export const gradesService = {
    createComponent: async (payload: any) => {
        const { data } = await api.post("/grades/components", payload);
        return data;
    },
    getSectionComponents: async (sectionId: string) => {
        const { data } = await api.get(`/grades/components/${sectionId}`);
        return data;
    },
    recordGrade: async (payload: any) => {
        const { data } = await api.post("/grades/record", payload);
        return data;
    },
    updateGrade: async (id: string, payload: any) => {
        const { data } = await api.put(`/grades/${id}`, payload);
        return data;
    },
    getStudentGrades: async (enrollmentId: string) => {
        const { data } = await api.get(`/grades/student/${enrollmentId}`);
        return data;
    },
    getMyGrades: async () => {
        const { data } = await api.get("/grades/my-grades");
        return data;
    },
    publishFinalGrades: async (sectionId: string) => {
        const { data } = await api.post(`/grades/publish/${sectionId}`);
        return data;
    },
    calculateGPA: async (studentId: string, termId: string) => {
        const { data } = await api.get(`/grades/gpa/${studentId}/${termId}`);
        return data;
    },
    getTranscript: async (studentId: string) => {
        const { data } = await api.get(`/grades/transcript/${studentId}`);
        return data;
    },
};

// Faculty service
export const facultyService = {
    getAll: async (params?: any) => {
        const { data } = await api.get("/faculty", { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/faculty/${id}`);
        return data;
    },
    create: async (payload: any) => {
        const { data } = await api.post("/faculty", payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await api.put(`/faculty/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/faculty/${id}`);
        return data;
    },
    getSections: async (id: string, termId?: string) => {
        const params = termId ? { termId } : {};
        const { data } = await api.get(`/faculty/${id}/sections`, { params });
        return data;
    },
};

// Reports service
export const reportsService = {
    getStatistics: async () => {
        const { data } = await api.get("/reports/statistics");
        return data;
    },
    getTranscript: async (studentId: string) => {
        const { data } = await api.get(`/reports/transcript/${studentId}`);
        return data;
    },
    getGradesReport: async (termId: string) => {
        const { data } = await api.get(`/reports/grades/${termId}`);
        return data;
    },
    getAttendanceReport: async (termId: string) => {
        const { data } = await api.get(`/reports/attendance/${termId}`);
        return data;
    },
};

// Department Selection service
export const departmentSelectionService = {
    getAvailableDepartments: async () => {
        const { data } = await api.get("/department-selection/available");
        return data;
    },
    getMyEligibility: async () => {
        const { data } = await api.get("/department-selection/my-eligibility");
        return data;
    },
    getMyApplication: async () => {
        const { data } = await api.get("/department-selection/my-application");
        return data;
    },
    applyToDepartment: async (payload: {
        departmentId: string;
        statement?: string;
    }) => {
        const { data } = await api.post("/department-selection/apply", payload);
        return data;
    },
    withdrawApplication: async (applicationId: string) => {
        const { data } = await api.put(
            `/department-selection/withdraw/${applicationId}`
        );
        return data;
    },
    // Admin endpoints
    getAllApplications: async (params?: {
        status?: string;
        departmentId?: string;
        batchId?: string;
    }) => {
        const { data } = await api.get("/department-selection/applications", {
            params,
        });
        return data;
    },
    processApplication: async (
        applicationId: string,
        payload: { status: string; rejectionReason?: string }
    ) => {
        const { data } = await api.put(
            `/department-selection/applications/${applicationId}/process`,
            payload
        );
        return data;
    },
    getStatistics: async () => {
        const { data } = await api.get("/department-selection/statistics");
        return data;
    },
};

export const backupService = {
    createBackup: async () => {
        const { data } = await api.post("/backup/create");
        return data;
    },
    listBackups: async () => {
        const { data } = await api.get("/backup/list");
        return data;
    },
    restoreBackup: async (filename: string) => {
        const { data } = await api.post("/backup/restore", { filename });
        return data;
    },
    uploadAndRestore: async (formData: FormData) => {
        const { data } = await api.post("/backup/upload-restore", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return data;
    },
    deleteBackup: async (filename: string) => {
        const { data } = await api.delete(`/backup/${filename}`);
        return data;
    },
    downloadBackup: async (filename: string) => {
        const response = await api.get(`/backup/download/${filename}`, {
            responseType: "blob",
        });
        return response;
    },
    getBackupStats: async () => {
        const { data } = await api.get("/backup/stats");
        return data;
    },
    getSystemStats: async () => {
        const { data } = await api.get("/backup/system-stats");
        return data;
    },
    exportData: async (type: string) => {
        const response = await api.get(`/backup/export/${type}`, {
            responseType: "blob",
        });
        return response;
    },
    clearCache: async () => {
        const { data } = await api.post("/backup/clear-cache");
        return data;
    },
    deleteAllData: async () => {
        const { data } = await api.post("/backup/delete-all-data");
        return data;
    },
};
