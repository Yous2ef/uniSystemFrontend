import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { departmentsService, coursesService, studentsService, batchesService, termsService } from "@/services/api";
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

    useEffect(() => {
        fetchStats();
    }, []);

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#14b8a6'];

    const fetchStats = async () => {
        try {
            const [departmentsRes, coursesRes, studentsRes, batchesRes, termsRes] = await Promise.all([
                departmentsService.getAll().catch(() => ({ data: { departments: [] } })),
                coursesService.getAll().catch(() => ({ data: { courses: [] } })),
                studentsService.getAll().catch(() => ({ data: { students: [] } })),
                batchesService.getAll().catch(() => ({ data: { batches: [] } })),
                termsService.getAll().catch(() => ({ data: { terms: [] } })),
            ]);

            const departments = departmentsRes?.data?.departments || departmentsRes?.departments || [];
            const courses = coursesRes?.data?.courses || coursesRes?.courses || [];
            const students = studentsRes?.data?.students || studentsRes?.students || [];
            const batches = batchesRes?.data?.batches || batchesRes?.batches || [];
            const terms = termsRes?.data?.terms || termsRes?.terms || [];

            console.log('Dashboard Data:', { departments: departments.length, courses: courses.length, students: students.length, batches: batches.length, terms: terms.length });

            // Calculate students by department with strong validation
            let studentsByDept: any[] = [];
            if (departments.length > 0) {
                studentsByDept = departments.map((dept: any) => {
                    const deptStudents = students.filter((s: any) => s.departmentId === dept.id);
                    return {
                        name: (dept.name || 'قسم غير معروف').substring(0, 15),
                        nameEn: dept.nameEn || dept.name || 'Unknown',
                        students: deptStudents.length,
                    };
                });
                // Show all departments or only those with data
                if (studentsByDept.every(d => d.students === 0) && departments.length > 0) {
                    // If no students, show departments with 0 values
                    studentsByDept = studentsByDept.slice(0, 8);
                } else {
                    // Show departments with students
                    studentsByDept = studentsByDept.filter(d => d.students > 0);
                }
            }

            // Calculate courses by department with strong validation
            let coursesByDept: any[] = [];
            if (departments.length > 0) {
                coursesByDept = departments.map((dept: any, index: number) => {
                    const deptCourses = courses.filter((c: any) => c.departmentId === dept.id);
                    return {
                        name: (dept.name || 'قسم غير معروف').substring(0, 15),
                        courses: deptCourses.length,
                        fill: COLORS[index % COLORS.length],
                    };
                });
                // Only show departments with courses for pie chart
                const hasAnyCourses = coursesByDept.some(d => d.courses > 0);
                if (hasAnyCourses) {
                    coursesByDept = coursesByDept.filter(d => d.courses > 0);
                } else if (departments.length > 0) {
                    // Show all departments if no courses exist yet
                    coursesByDept = coursesByDept.slice(0, 6);
                }
            }

            // Calculate enrollment trends by term with strong validation
            let enrollmentsByTerm: any[] = [];
            if (terms.length > 0) {
                const sortedTerms = [...terms]
                    .filter((t: any) => t.startDate)
                    .sort((a: any, b: any) => {
                        const dateA = new Date(a.startDate).getTime();
                        const dateB = new Date(b.startDate).getTime();
                        return dateA - dateB;
                    })
                    .slice(-6); // Last 6 terms

                enrollmentsByTerm = sortedTerms.map((term: any) => {
                    // Try to get actual enrollment count
                    const termStudents = students.filter((s: any) => 
                        s.currentTermId === term.id || s.termId === term.id
                    ).length;
                    
                    return {
                        term: (term.name || term.code || 'فصل').substring(0, 12),
                        enrollments: termStudents,
                    };
                });
            }

            // Calculate student growth by batch with strong validation
            let studentsByBatch: any[] = [];
            if (batches.length > 0) {
                const sortedBatches = [...batches]
                    .filter((b: any) => b.year || b.name)
                    .sort((a: any, b: any) => (a.year || 0) - (b.year || 0))
                    .slice(-5); // Last 5 batches

                studentsByBatch = sortedBatches.map((batch: any) => {
                    const batchStudents = students.filter((s: any) => s.batchId === batch.id);
                    return {
                        batch: (batch.name || `دفعة ${batch.year || ''}`).substring(0, 12),
                        students: batchStudents.length,
                    };
                });
            }

            console.log('Chart Data:', {
                studentsByDept: studentsByDept.length,
                coursesByDept: coursesByDept.length,
                enrollmentsByTerm: enrollmentsByTerm.length,
                studentsByBatch: studentsByBatch.length
            });

            setStats({
                departments: departments.length,
                courses: courses.length,
                students: students.length,
                batches: batches.length,
                terms: terms.length,
            });

            setChartData({
                studentsByDepartment: studentsByDept,
                coursesByDepartment: coursesByDept,
                enrollmentTrends: enrollmentsByTerm,
                studentGrowth: studentsByBatch,
            });
        } catch (error) {
            console.error("Failed to fetch stats:", error);
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
                        مرحباً، {user?.email}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                        كلية علوم الحاسب - College of Computer Science
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                الأقسام
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
                                المواد
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
                                الطلاب
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
                                الدفعات
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
                                الفصول الدراسية
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
                        {/* Students by Department Bar Chart */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>الطلاب حسب الأقسام</span>
                                    <span className="text-xs font-normal text-gray-500">
                                        {chartData.studentsByDepartment.length} قسم
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {chartData.studentsByDepartment.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={320}>
                                        <BarChart 
                                            data={chartData.studentsByDepartment}
                                            margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.5} />
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
                                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                    padding: '8px 12px'
                                                }}
                                                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                            />
                                            <Legend 
                                                wrapperStyle={{ paddingTop: '10px' }}
                                                iconType="square"
                                            />
                                            <Bar 
                                                dataKey="students" 
                                                fill="#3b82f6" 
                                                name="عدد الطلاب" 
                                                radius={[8, 8, 0, 0]}
                                                maxBarSize={60}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <p className="text-sm font-medium">لا توجد بيانات لعرضها</p>
                                        <p className="text-xs mt-1">أضف أقسام وطلاب لعرض الإحصائيات</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Course Distribution Pie Chart */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>توزيع المواد حسب الأقسام</span>
                                    <span className="text-xs font-normal text-gray-500">
                                        {chartData.coursesByDepartment.reduce((sum: number, d: any) => sum + d.courses, 0)} مادة
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {chartData.coursesByDepartment.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={320}>
                                        <PieChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                            <Pie
                                                data={chartData.coursesByDepartment}
                                                cx="50%"
                                                cy="45%"
                                                labelLine={true}
                                                label={({ name, percent }) => 
                                                    percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                                                }
                                                outerRadius={85}
                                                innerRadius={35}
                                                fill="#8884d8"
                                                dataKey="courses"
                                                paddingAngle={2}
                                            >
                                                {chartData.coursesByDepartment.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={entry.fill}
                                                        stroke="#fff"
                                                        strokeWidth={2}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                    padding: '8px 12px'
                                                }}
                                            />
                                            <Legend 
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                                wrapperStyle={{ fontSize: '12px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                        </svg>
                                        <p className="text-sm font-medium">لا توجد بيانات لعرضها</p>
                                        <p className="text-xs mt-1">أضف مواد دراسية لعرض التوزيع</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Enrollment Trends Line Chart */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>اتجاهات التسجيل عبر الفصول</span>
                                    <span className="text-xs font-normal text-gray-500">
                                        آخر {chartData.enrollmentTrends.length} فصول
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {chartData.enrollmentTrends.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={320}>
                                        <LineChart 
                                            data={chartData.enrollmentTrends}
                                            margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.5} />
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
                                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                    padding: '8px 12px'
                                                }}
                                                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                            />
                                            <Legend 
                                                wrapperStyle={{ paddingTop: '10px' }}
                                                iconType="line"
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="enrollments" 
                                                stroke="#8b5cf6" 
                                                strokeWidth={3}
                                                name="عدد التسجيلات"
                                                dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 7, strokeWidth: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                        <p className="text-sm font-medium">لا توجد بيانات لعرضها</p>
                                        <p className="text-xs mt-1">أضف فصول دراسية لعرض الاتجاهات</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Student Growth Area Chart */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>نمو الطلاب عبر الدفعات</span>
                                    <span className="text-xs font-normal text-gray-500">
                                        {chartData.studentGrowth.length} دفعة
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {chartData.studentGrowth.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={320}>
                                        <AreaChart 
                                            data={chartData.studentGrowth}
                                            margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.5} />
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
                                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                    padding: '8px 12px'
                                                }}
                                                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                            />
                                            <Legend 
                                                wrapperStyle={{ paddingTop: '10px' }}
                                                iconType="square"
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="students" 
                                                stroke="#10b981" 
                                                strokeWidth={3}
                                                fill="url(#colorStudents)"
                                                name="عدد الطلاب"
                                                dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 7, strokeWidth: 2 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        <p className="text-sm font-medium">لا توجد بيانات لعرضها</p>
                                        <p className="text-xs mt-1">أضف دفعات دراسية لعرض النمو</p>
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
