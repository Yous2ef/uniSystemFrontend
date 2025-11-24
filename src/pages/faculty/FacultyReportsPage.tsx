import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Download,
    FileSpreadsheet,
    FileText,
    TrendingUp,
    Users,
    BarChart3,
    Calendar,
    Award,
} from "lucide-react";

export default function FacultyReportsPage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("grades");

    // Mock Data
    const gradesData = {
        distribution: [
            { grade: "A+", count: 15, percentage: 15 },
            { grade: "A", count: 28, percentage: 28 },
            { grade: "B+", count: 24, percentage: 24 },
            { grade: "B", count: 12, percentage: 12 },
            { grade: "C+", count: 8, percentage: 8 },
            { grade: "C", count: 6, percentage: 6 },
            { grade: "D", count: 4, percentage: 4 },
            { grade: "F", count: 3, percentage: 3 },
        ],
        stats: {
            average: 75.5,
            median: 78,
            highest: 98,
            lowest: 45,
            passRate: 89,
        },
    };

    const attendanceData = {
        byWeek: [
            { week: 1, attendance: 95 },
            { week: 2, attendance: 92 },
            { week: 3, attendance: 88 },
            { week: 4, attendance: 90 },
            { week: 5, attendance: 85 },
            { week: 6, attendance: 87 },
            { week: 7, attendance: 89 },
            { week: 8, attendance: 91 },
        ],
        stats: {
            average: 89.6,
            totalSessions: 8,
            totalStudents: 100,
        },
    };

    const studentsData = [
        { id: "20230001", name: "أحمد حسن", cgpa: 3.45, attendance: 85, grade: "A", status: "excellent" },
        { id: "20230002", name: "سارة علي", cgpa: 3.80, attendance: 92, grade: "A+", status: "excellent" },
        { id: "20230003", name: "محمد خالد", cgpa: 2.90, attendance: 65, grade: "D+", status: "warning" },
        { id: "20230004", name: "فاطمة أحمد", cgpa: 3.20, attendance: 88, grade: "B+", status: "good" },
        { id: "20230005", name: "علي محمود", cgpa: 3.60, attendance: 90, grade: "A", status: "excellent" },
    ];

    const exportToExcel = () => {
        // Simple CSV export (يمكن تحسينه باستخدام مكتبة xlsx)
        let csvContent = "data:text/csv;charset=utf-8,";
        
        if (activeTab === "grades") {
            csvContent += t('facultyReports.grade') + "," + t('facultyReports.count') + "," + t('facultyReports.percentage') + "\n";
            gradesData.distribution.forEach(row => {
                csvContent += `${row.grade},${row.count},${row.percentage}%\n`;
            });
        } else if (activeTab === "attendance") {
            csvContent += t('facultyReports.week') + "," + t('facultyReports.attendanceRate') + "\n";
            attendanceData.byWeek.forEach(row => {
                csvContent += `${t('facultyReports.weekNum', {num: row.week})},${row.attendance}%\n`;
            });
        } else if (activeTab === "students") {
            csvContent += t('students.studentCode') + "," + t('students.nameAr') + "," + t('students.gpa') + "," + t('facultyReports.attendance') + "," + t('facultyReports.grade') + "," + t('facultyReports.status') + "\n";
            studentsData.forEach(row => {
                csvContent += `${row.id},${row.name},${row.cgpa},${row.attendance}%,${row.grade},${t('facultyReports.statusLabels.' + row.status)}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${t('facultyReports.report')}_${activeTab}_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        window.print();
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            📊 {t('facultyReports.title')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {t('facultyReports.subtitle')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={exportToExcel}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <FileSpreadsheet className="w-4 h-4 ml-2" />
                            {t('facultyReports.exportExcel')}
                        </Button>
                        <Button
                            onClick={exportToPDF}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <FileText className="w-4 h-4 ml-2" />
                            {t('facultyReports.exportPDF')}
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 w-full max-w-md">
                        <TabsTrigger value="grades">
                            <BarChart3 className="w-4 h-4 ml-2" />
                            {t('facultyReports.grades')}
                        </TabsTrigger>
                        <TabsTrigger value="attendance">
                            <Calendar className="w-4 h-4 ml-2" />
                            {t('facultyReports.attendance')}
                        </TabsTrigger>
                        <TabsTrigger value="students">
                            <Users className="w-4 h-4 ml-2" />
                            {t('facultyReports.students')}
                        </TabsTrigger>
                    </TabsList>

                    {/* Grades Report */}
                    <TabsContent value="grades" className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('facultyReports.average')}</div>
                                    <div className="text-2xl font-bold text-blue-600">{gradesData.stats.average}%</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('facultyReports.median')}</div>
                                    <div className="text-2xl font-bold text-green-600">{gradesData.stats.median}%</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('facultyReports.highest')}</div>
                                    <div className="text-2xl font-bold text-purple-600">{gradesData.stats.highest}%</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('facultyReports.lowest')}</div>
                                    <div className="text-2xl font-bold text-orange-600">{gradesData.stats.lowest}%</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('facultyReports.passRate')}</div>
                                    <div className="text-2xl font-bold text-emerald-600">{gradesData.stats.passRate}%</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    {t('facultyReports.gradeDistribution')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {gradesData.distribution.map((item) => (
                                        <div key={item.grade} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{item.grade}</span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {item.count} {t('facultyReports.student')} ({item.percentage}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('facultyReports.distributionTable')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">{t('facultyReports.grade')}</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">{t('facultyReports.count')}</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">{t('facultyReports.percentage')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {gradesData.distribution.map((item) => (
                                                <tr key={item.grade} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-4 py-3 font-medium">{item.grade}</td>
                                                    <td className="px-4 py-3">{item.count}</td>
                                                    <td className="px-4 py-3">{item.percentage}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Attendance Report */}
                    <TabsContent value="attendance" className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('facultyReports.averageAttendance')}</div>
                                    <div className="text-2xl font-bold text-blue-600">{attendanceData.stats.average}%</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('facultyReports.lecturesCount')}</div>
                                    <div className="text-2xl font-bold text-green-600">{attendanceData.stats.totalSessions}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('facultyReports.studentsCount')}</div>
                                    <div className="text-2xl font-bold text-purple-600">{attendanceData.stats.totalStudents}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    {t('facultyReports.weeklyAttendance')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {attendanceData.byWeek.map((item) => (
                                        <div key={item.week} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{t('facultyReports.weekNum', {num: item.week})}</span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {item.attendance}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full transition-all duration-500 ${
                                                        item.attendance >= 90
                                                            ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                                            : item.attendance >= 75
                                                            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                                            : "bg-gradient-to-r from-red-500 to-pink-500"
                                                    }`}
                                                    style={{ width: `${item.attendance}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('facultyReports.attendanceTable')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">{t('facultyReports.week')}</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">{t('facultyReports.attendanceRate')}</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">{t('facultyReports.status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {attendanceData.byWeek.map((item) => (
                                                <tr key={item.week} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-4 py-3 font-medium">{t('facultyReports.weekNum', {num: item.week})}</td>
                                                    <td className="px-4 py-3">{item.attendance}%</td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                item.attendance >= 90
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                    : item.attendance >= 75
                                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                            }`}
                                                        >
                                                            {item.attendance >= 90 ? t('facultyReports.statusLabels.excellent') : item.attendance >= 75 ? t('facultyReports.statusLabels.good') : t('facultyReports.statusLabels.warning')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Students Report */}
                    <TabsContent value="students" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    {t('facultyReports.studentsList')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">{t('facultyReports.code')}</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">{t('facultyReports.name')}</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">{t('facultyReports.gpa')}</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">{t('facultyReports.attendance')}</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">{t('facultyReports.grade')}</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">{t('facultyReports.status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {studentsData.map((student) => (
                                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-4 py-3 font-medium">{student.id}</td>
                                                    <td className="px-4 py-3">{student.name}</td>
                                                    <td className="px-4 py-3">{student.cgpa}</td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`${
                                                                student.attendance >= 75
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }`}
                                                        >
                                                            {student.attendance}%
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-semibold">
                                                            {student.grade}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                student.status === "excellent"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                    : student.status === "good"
                                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                            }`}
                                                        >
                                                            {t('facultyReports.statusLabels.' + student.status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-8 h-8 text-yellow-500" />
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{t('facultyReports.statusLabels.excellent')}</div>
                                            <div className="text-xl font-bold">
                                                {studentsData.filter(s => s.status === "excellent").length}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-8 h-8 text-blue-500" />
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{t('facultyReports.statusLabels.good')}</div>
                                            <div className="text-xl font-bold">
                                                {studentsData.filter(s => s.status === "good").length}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-8 h-8 text-orange-500" />
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{t('facultyReports.statusLabels.warning')}</div>
                                            <div className="text-xl font-bold">
                                                {studentsData.filter(s => s.status === "warning").length}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="w-8 h-8 text-green-500" />
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{t('facultyReports.total')}</div>
                                            <div className="text-xl font-bold">{studentsData.length}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
