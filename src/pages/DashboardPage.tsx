import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { departmentsService, coursesService, studentsService, batchesService, termsService, reportsService, enrollmentsService } from "@/services/api";
import { Navigate } from "react-router-dom";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    AreaChart,
    Area,
    RadialBarChart,
    RadialBar,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface Stats {
    departments: number;
    courses: number;
    students: number;
    batches: number;
    terms: number;
}

interface ChartData {
    studentsByDepartment: Array<{ name: string; students: number; nameEn: string }>;
    coursesByDepartment: Array<{ name: string; courses: number; fill: string }>;
    enrollmentTrends: Array<{ term: string; enrollments: number }>;
    studentGrowth: Array<{ batch: string; students: number }>;
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<Stats>({
        departments: 0,
        courses: 0,
        students: 0,
        batches: 0,
        terms: 0,
    });
    const [chartData, setChartData] = useState<ChartData>({
        studentsByDepartment: [],
        coursesByDepartment: [],
        enrollmentTrends: [],
        studentGrowth: [],
    });
    const [loading, setLoading] = useState(true);

    // Redirect students to their specific dashboard
    if (user?.role === "STUDENT") {
        return <Navigate to="/student/dashboard" replace />;
    }

    // Redirect faculty to their specific dashboard
    if (user?.role === "FACULTY" || user?.role === "TA") {
        return <Navigate to="/faculty/dashboard" replace />;
    }

    useEffect(() => {
        fetchStats();
    }, []);

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#14b8a6'];
    const GRADIENT_COLORS = [
        { start: '#3b82f6', end: '#1d4ed8' },
        { start: '#8b5cf6', end: '#6d28d9' },
        { start: '#ec4899', end: '#be185d' },
        { start: '#f59e0b', end: '#d97706' },
        { start: '#10b981', end: '#059669' },
    ];

    const fetchStats = async () => {
        try {
            // Fetch all data in parallel - request ALL records by setting high limit
            const [departmentsRes, coursesRes, studentsRes, batchesRes, termsRes, enrollmentsRes] = await Promise.all([
                departmentsService.getAll({ limit: 1000 }).catch((err) => {
                    console.error('Departments fetch error:', err);
                    return { success: false, data: { departments: [] } };
                }),
                coursesService.getAll({ limit: 1000 }).catch((err) => {
                    console.error('Courses fetch error:', err);
                    return { success: false, data: { courses: [] } };
                }),
                studentsService.getAll({ limit: 1000 }).catch((err) => {
                    console.error('Students fetch error:', err);
                    return { success: false, data: [] };
                }),
                batchesService.getAll().catch((err) => {
                    console.error('Batches fetch error:', err);
                    return { data: [] }; // Return empty array in data property
                }),
                termsService.getAll().catch((err) => {
                    console.error('Terms fetch error:', err);
                    return { success: false, data: { terms: [] } };
                }),
                enrollmentsService.getAll({ limit: 1000 }).catch((err) => {
                    console.error('Enrollments fetch error:', err);
                    return { success: false, data: { enrollments: [] } };
                }),
            ]);

            // Log raw responses to debug
            console.log('🔍 Raw API Responses:', {
                departments: departmentsRes,
                courses: coursesRes,
                students: studentsRes,
                batches: batchesRes,
                terms: termsRes,
                enrollments: enrollmentsRes,
            });

            // Extract data with proper fallbacks - handle different API response formats
            const departments = departmentsRes?.data?.data?.departments || departmentsRes?.data?.departments || [];
            const courses = coursesRes?.data?.data?.courses || coursesRes?.data?.courses || [];
            
            // Students - handle pagination response format: { success: true, data: [...], pagination: {...} }
            const students = studentsRes?.data?.data || studentsRes?.data || [];
            
            // Batches - Handle ALL possible response formats
            let batches: any[] = [];
            const bData = batchesRes?.data;
            if (Array.isArray(bData)) {
                batches = bData;
            } else if (bData?.data && Array.isArray(bData.data)) {
                batches = bData.data;
            } else if (bData?.batches && Array.isArray(bData.batches)) {
                batches = bData.batches;
            } else if (Array.isArray(batchesRes)) {
                batches = batchesRes;
            }
            console.log('✅ Extracted batches count:', batches.length);
            
            // Terms - { success: true, data: { terms: [...], total: N } }
            const terms = termsRes?.data?.data?.terms || termsRes?.data?.terms || [];
            
            // Enrollments - { success: true, data: [...] }
            const enrollments = enrollmentsRes?.data?.data || enrollmentsRes?.data || [];

            console.log('📊 Dashboard Real Data Extracted:', { 
                departments: departments.length, 
                courses: courses.length, 
                students: students.length, 
                batches: batches.length, 
                terms: terms.length,
                enrollments: enrollments.length
            });

            // Calculate students by department - REAL DATA
            let studentsByDept: any[] = [];
            if (departments.length > 0) {
                studentsByDept = departments.map((dept: any) => {
                    const deptStudents = students.filter((s: any) => s.departmentId === dept.id);
                    return {
                        name: (dept.nameAr || dept.name || 'قسم غير معروف').substring(0, 15),
                        nameEn: dept.nameEn || dept.name || 'Unknown',
                        students: deptStudents.length,
                    };
                }).filter((d: any) => d.students > 0 || departments.length <= 8); // Show all if ≤8 depts
                
                console.log('📊 Students by Department:', studentsByDept);
            }

            // Calculate courses by department - REAL DATA
            let coursesByDept: any[] = [];
            if (departments.length > 0) {
                coursesByDept = departments.map((dept: any, index: number) => {
                    const deptCourses = courses.filter((c: any) => c.departmentId === dept.id);
                    return {
                        name: (dept.nameAr || dept.name || 'قسم غير معروف').substring(0, 15),
                        courses: deptCourses.length,
                        fill: COLORS[index % COLORS.length],
                    };
                }).filter((d: any) => d.courses > 0);
                
                console.log('📊 Courses by Department:', coursesByDept);
            }

            // Calculate enrollment trends by term - REAL DATA from enrollments
            let enrollmentsByTerm: any[] = [];
            if (terms.length > 0) {
                const sortedTerms = [...terms]
                    .filter((t: any) => t.startDate)
                    .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .slice(-6); // Last 6 terms

                enrollmentsByTerm = sortedTerms.map((term: any) => {
                    // Count enrollments by matching section's termId OR by checking if section has this term
                    let termEnrollments = 0;
                    
                    enrollments.forEach((e: any) => {
                        // Try multiple ways to match enrollment to term
                        if (e.section?.termId === term.id || 
                            e.section?.term?.id === term.id ||
                            e.termId === term.id) {
                            termEnrollments++;
                        }
                    });
                    
                    // If still no enrollments found, try counting from term's sections
                    if (termEnrollments === 0 && term.sections) {
                        term.sections.forEach((section: any) => {
                            const sectionEnrollments = enrollments.filter((e: any) => 
                                e.sectionId === section.id || e.section?.id === section.id
                            ).length;
                            termEnrollments += sectionEnrollments;
                        });
                    }
                    
                    return {
                        term: (term.nameAr || term.name || term.code || 'فصل').substring(0, 12),
                        enrollments: termEnrollments,
                    };
                });
                
                console.log('📊 Enrollment Trends:', enrollmentsByTerm);
            }

            // Calculate student growth by batch - REAL DATA
            let studentsByBatch: any[] = [];
            if (batches.length > 0) {
                // Group batches by year to aggregate students
                const batchesByYear = batches.reduce((acc: any, batch: any) => {
                    const year = batch.year || 2024;
                    if (!acc[year]) {
                        acc[year] = { year, students: 0, name: `دفعة ${year}` };
                    }
                    const batchStudents = students.filter((s: any) => s.batchId === batch.id);
                    acc[year].students += batchStudents.length;
                    return acc;
                }, {});

                // Convert to array and sort by year
                studentsByBatch = Object.values(batchesByYear)
                    .sort((a: any, b: any) => a.year - b.year)
                    .slice(-5) // Last 5 years
                    .map((item: any) => ({
                        batch: item.name.substring(0, 12),
                        students: item.students,
                    }));
                
                // If no students found, show batch structure anyway
                if (studentsByBatch.every((b: any) => b.students === 0) && batches.length > 0) {
                    const yearGroups = [...new Set(batches.map((b: any) => b.year))].sort().slice(-5);
                    studentsByBatch = yearGroups.map(year => ({
                        batch: `دفعة ${year}`,
                        students: 0,
                    }));
                }
                
                console.log('📊 Student Growth by Batch:', studentsByBatch);
            }

            console.log('Chart Data:', {
                studentsByDept: studentsByDept.length,
                coursesByDept: coursesByDept.length,
                enrollmentsByTerm: enrollmentsByTerm.length,
                studentsByBatch: studentsByBatch.length
            });

            // Update stats with real counts
            setStats({
                departments: departments.length,
                courses: courses.length,
                students: students.length,
                batches: batches.length,
                terms: terms.length,
            });

            // Update chart data with real data
            setChartData({
                studentsByDepartment: studentsByDept,
                coursesByDepartment: coursesByDept,
                enrollmentTrends: enrollmentsByTerm,
                studentGrowth: studentsByBatch,
            });

            console.log('✅ Dashboard Updated with Real Data');
        } catch (error) {
            console.error("❌ Failed to fetch dashboard stats:", error);
            // Set empty data on error
            setChartData({
                studentsByDepartment: [],
                coursesByDepartment: [],
                enrollmentTrends: [],
                studentGrowth: [],
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        {t("dashboard.title")}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                        {t("dashboard.welcome")} {user?.email}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                        {t("dashboard.collegeName")}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {t("dashboard.departments")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {loading ? "..." : stats.departments}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {t("dashboard.courses")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {loading ? "..." : stats.courses}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {t("dashboard.students")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {loading ? "..." : stats.students}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {t("dashboard.batches")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {loading ? "..." : stats.batches}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {t("dashboard.terms")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {loading ? "..." : stats.terms}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                {!loading && (
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                        {/* Students by Department - Gradient Bar Chart with Animation */}
                        <Card className="col-span-1 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                                        {t("dashboard.studentsByDepartment")}
                                    </span>
                                    <span className="text-xs font-normal text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                                        {chartData.studentsByDepartment.length} {t("dashboard.department")}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {chartData.studentsByDepartment.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={320}>
                                        <BarChart 
                                            data={chartData.studentsByDepartment}
                                            margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
                                        >
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                                                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} vertical={false} />
                                            <XAxis 
                                                dataKey="name" 
                                                className="text-xs"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                angle={-20}
                                                textAnchor="end"
                                                height={70}
                                                interval={0}
                                            />
                                            <YAxis 
                                                className="text-xs"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                width={40}
                                                allowDecimals={false}
                                            />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                                    padding: '12px 16px'
                                                }}
                                                labelStyle={{ fontWeight: 'bold', marginBottom: '6px', color: '#1f2937' }}
                                                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                            />
                                            <Bar 
                                                dataKey="students" 
                                                fill="url(#barGradient)" 
                                                name={t("dashboard.studentCount")} 
                                                radius={[10, 10, 0, 0]}
                                                maxBarSize={50}
                                                animationDuration={1500}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <p className="text-sm font-medium">{t("dashboard.noData")}</p>
                                        <p className="text-xs mt-1">{t("dashboard.addDepartmentsAndStudents")}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Course Distribution - Enhanced Donut Chart with Center Text */}
                        <Card className="col-span-1 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                                        {t("dashboard.courseDistribution")}
                                    </span>
                                    <span className="text-xs font-normal text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                                        {chartData.coursesByDepartment.reduce((sum: number, d: any) => sum + d.courses, 0)} {t("dashboard.course")}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {chartData.coursesByDepartment.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={320}>
                                        <PieChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                            <defs>
                                                {COLORS.map((color, index) => (
                                                    <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor={color} stopOpacity={1}/>
                                                        <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                                                    </linearGradient>
                                                ))}
                                            </defs>
                                            <Pie
                                                data={chartData.coursesByDepartment}
                                                cx="50%"
                                                cy="45%"
                                                labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                                                label={({ name, percent }) => 
                                                    percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                                                }
                                                outerRadius={95}
                                                innerRadius={60}
                                                fill="#8884d8"
                                                dataKey="courses"
                                                paddingAngle={3}
                                                animationBegin={0}
                                                animationDuration={1200}
                                            >
                                                {chartData.coursesByDepartment.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={`url(#gradient${index % COLORS.length})`}
                                                        stroke="#fff"
                                                        strokeWidth={3}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                                    padding: '12px 16px'
                                                }}
                                            />
                                            <Legend 
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                        </svg>
                                        <p className="text-sm font-medium">{t("dashboard.noData")}</p>
                                        <p className="text-xs mt-1">{t("dashboard.addCourses")}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Enrollment Trends - Smooth Curved Line with Area Fill */}
                        <Card className="col-span-1 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <div className="w-2 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
                                        {t("dashboard.enrollmentTrends")}
                                    </span>
                                    <span className="text-xs font-normal text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                                        {t("dashboard.lastTerms", { count: chartData.enrollmentTrends.length })}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {chartData.enrollmentTrends.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={320}>
                                        <ComposedChart 
                                            data={chartData.enrollmentTrends}
                                            margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
                                        >
                                            <defs>
                                                <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} vertical={false} />
                                            <XAxis 
                                                dataKey="term" 
                                                className="text-xs"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                angle={-20}
                                                textAnchor="end"
                                                height={70}
                                                interval={0}
                                            />
                                            <YAxis 
                                                className="text-xs"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                width={40}
                                                allowDecimals={false}
                                            />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                                    padding: '12px 16px'
                                                }}
                                                labelStyle={{ fontWeight: 'bold', marginBottom: '6px', color: '#1f2937' }}
                                                cursor={{ strokeDasharray: '3 3' }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="enrollments" 
                                                fill="url(#enrollmentGradient)"
                                                stroke="none"
                                                animationDuration={1500}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="enrollments" 
                                                stroke="#8b5cf6" 
                                                strokeWidth={3}
                                                name={t("dashboard.enrollmentCount")}
                                                dot={{ fill: '#8b5cf6', r: 6, strokeWidth: 3, stroke: '#fff' }}
                                                activeDot={{ r: 8, strokeWidth: 3, fill: '#7c3aed' }}
                                                animationDuration={1500}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                        <p className="text-sm font-medium">{t("dashboard.noData")}</p>
                                        <p className="text-xs mt-1">{t("dashboard.addTerms")}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Student Growth - Stacked Area Chart with Gradient */}
                        <Card className="col-span-1 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <div className="w-2 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                                        {t("dashboard.studentGrowth")}
                                    </span>
                                    <span className="text-xs font-normal text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                                        {chartData.studentGrowth.length} {t("dashboard.batch")}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">{chartData.studentGrowth.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={320}>
                                        <AreaChart 
                                            data={chartData.studentGrowth}
                                            margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorStudentsNew" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} vertical={false} />
                                            <XAxis 
                                                dataKey="batch" 
                                                className="text-xs"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                angle={-20}
                                                textAnchor="end"
                                                height={70}
                                                interval={0}
                                            />
                                            <YAxis 
                                                className="text-xs"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                width={40}
                                                allowDecimals={false}
                                            />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                                    padding: '12px 16px'
                                                }}
                                                labelStyle={{ fontWeight: 'bold', marginBottom: '6px', color: '#1f2937' }}
                                                cursor={{ strokeDasharray: '3 3' }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="students" 
                                                stroke="#10b981" 
                                                strokeWidth={3}
                                                fill="url(#colorStudentsNew)"
                                                name={t("dashboard.studentCount")}
                                                dot={{ fill: '#10b981', r: 6, strokeWidth: 3, stroke: '#fff' }}
                                                activeDot={{ r: 8, strokeWidth: 3, fill: '#059669' }}
                                                animationDuration={1500}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        <p className="text-sm font-medium">{t("dashboard.noData")}</p>
                                        <p className="text-xs mt-1">{t("dashboard.addBatches")}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
