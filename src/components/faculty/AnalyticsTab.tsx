import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Download } from "lucide-react";

export default function AnalyticsTab({ sectionId }: { sectionId: string }) {
    // Mock data
    const gradeDistribution = [
        { grade: "A+", count: 7, percentage: 15 },
        { grade: "A", count: 13, percentage: 28 },
        { grade: "B+", count: 11, percentage: 24 },
        { grade: "B", count: 5, percentage: 12 },
        { grade: "C+", count: 4, percentage: 8 },
        { grade: "C", count: 3, percentage: 6 },
        { grade: "D", count: 2, percentage: 4 },
        { grade: "F", count: 1, percentage: 3 },
    ];

    const stats = {
        average: 75.5,
        median: 78,
        highest: 98,
        highestStudent: "سارة علي",
        lowest: 45,
        lowestStudent: "محمود أحمد",
        passRate: 89,
        failRate: 11,
    };

    const atRiskStudents = [
        { code: "20230003", name: "محمد خالد", grade: 65 },
        { code: "20230015", name: "علي حسن", grade: 62 },
        { code: "20230027", name: "محمود أحمد", grade: 45 },
    ];

    const historicalData = [
        { term: "خريف 2024", average: 72 },
        { term: "ربيع 2025", average: 74 },
        { term: "خريف 2025", average: 75.5 },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">📈 تحليلات وإحصائيات المادة</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    تحليل شامل لأداء الطلاب في المادة
                </p>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">متوسط الدرجات</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.average}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">الوسيط</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.median}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">نسبة النجاح</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.passRate}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">نسبة الرسوب</p>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.failRate}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Grade Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        📊 توزيع الدرجات
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {gradeDistribution.map((item) => (
                            <div key={item.grade} className="flex items-center gap-4">
                                <div className="w-12 font-bold text-center">{item.grade}</div>
                                <div className="flex-1">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-end pr-2 text-white text-sm font-medium"
                                            style={{ width: `${item.percentage}%` }}
                                        >
                                            {item.percentage > 10 && `${item.percentage}%`}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-20 text-sm text-gray-600 dark:text-gray-400">
                                    {item.count} طالب
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Top & Bottom Performers */}
            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="bg-green-50 dark:bg-green-900/20">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            أعلى درجة
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">الطالب</p>
                        <p className="font-medium text-lg">{stats.highestStudent}</p>
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">
                            {stats.highest}%
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-red-50 dark:bg-red-900/20">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-red-500" />
                            أقل درجة
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">الطالب</p>
                        <p className="font-medium text-lg">{stats.lowestStudent}</p>
                        <p className="text-4xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.lowest}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* At-Risk Students */}
            <Card>
                <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        ⚠️ طلاب في خطر (درجة {"<"} 70%)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-3">
                        {atRiskStudents.map((student) => (
                            <div
                                key={student.code}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium">{student.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{student.code}</p>
                                </div>
                                <Badge className="bg-yellow-500">{student.grade}%</Badge>
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                        📧 إرسال تنبيه لهم
                    </Button>
                </CardContent>
            </Card>

            {/* Historical Comparison */}
            <Card>
                <CardHeader>
                    <CardTitle>📊 مقارنة بالترمات السابقة</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {historicalData.map((item, index) => (
                            <div key={item.term} className="flex items-center gap-4">
                                <div className="w-32 font-medium">{item.term}</div>
                                <div className="flex-1">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-end pr-3 text-white font-medium"
                                            style={{ width: `${item.average}%` }}
                                        >
                                            {item.average}%
                                        </div>
                                    </div>
                                </div>
                                {index === historicalData.length - 1 && (
                                    <Badge className="bg-green-500">✅ تحسن</Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Export Button */}
            <div className="flex justify-end">
                <Button variant="outline">
                    <Download className="w-4 h-4 ml-2" />
                    📥 تصدير التقرير
                </Button>
            </div>
        </div>
    );
}
