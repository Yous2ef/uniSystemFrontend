import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { enrollmentsService } from "@/services/api";

export default function AnalyticsTab({ sectionId }: { sectionId: string }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);

    useEffect(() => {
        fetchAnalyticsData();
    }, [sectionId]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const enrollmentsData = await enrollmentsService.getBySectionId(sectionId);
            if (enrollmentsData.success && enrollmentsData.data) {
                const enrollments = enrollmentsData.data;
                const grades = enrollments.map((e: any) => e.finalGrade || 0).filter((g: number) => g > 0);
                
                if (grades.length > 0) {
                    const avg = grades.reduce((a: number, b: number) => a + b, 0) / grades.length;
                    const sorted = [...grades].sort((a, b) => a - b);
                    const median = sorted[Math.floor(sorted.length / 2)];
                    const highest = Math.max(...grades);
                    const lowest = Math.min(...grades);
                    const passing = grades.filter((g: number) => g >= 60).length;
                    
                    setStats({
                        average: avg.toFixed(1),
                        median,
                        highest,
                        highestStudent: enrollments.find((e: any) => e.finalGrade === highest)?.student?.nameAr || "-",
                        lowest,
                        lowestStudent: enrollments.find((e: any) => e.finalGrade === lowest)?.student?.nameAr || "-",
                        passRate: Math.round((passing / grades.length) * 100),
                        failRate: Math.round(((grades.length - passing) / grades.length) * 100),
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    // Default mock data for display if no real data
    const defaultGradeDistribution = [
        { grade: "A+", count: 0, percentage: 0 },
        { grade: "A", count: 0, percentage: 0 },
        { grade: "B+", count: 0, percentage: 0 },
        { grade: "B", count: 0, percentage: 0 },
        { grade: "C+", count: 0, percentage: 0 },
        { grade: "C", count: 0, percentage: 0 },
        { grade: "D", count: 0, percentage: 0 },
        { grade: "F", count: 0, percentage: 0 },
    ];

    const defaultStats = {
        average: 0,
        median: 0,
        highest: 0,
        highestStudent: "-",
        lowest: 0,
        lowestStudent: "-",
        passRate: 0,
        failRate: 0,
    };

    const historicalData = [
        { term: "خريف 2024", average: 72 },
        { term: "ربيع 2025", average: 74 },
        { term: "خريف 2025", average: stats?.average || 0 },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">{t('analyticsTab.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('analyticsTab.subtitle')}
                </p>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('analyticsTab.average')}</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats?.average || defaultStats.average}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('analyticsTab.median')}</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats?.median || defaultStats.median}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('analyticsTab.passRate')}</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats?.passRate || defaultStats.passRate}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('analyticsTab.failRate')}</p>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats?.failRate || defaultStats.failRate}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Grade Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        {t('analyticsTab.gradeDistribution')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {(gradeDistribution.length > 0 ? gradeDistribution : defaultGradeDistribution).map((item) => (
                            <div key={item.grade} className="flex items-center gap-4">
                                <div className="w-12 font-bold text-center">{item.grade}</div>
                                <div className="flex-1">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                                        <div
                                            className="h-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-end pr-2 text-white text-sm font-medium"
                                            style={{ width: `${item.percentage}%` }}
                                        >
                                            {item.percentage > 10 && `${item.percentage}%`}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-20 text-sm text-gray-600 dark:text-gray-400">
                                    {item.count} {t('analyticsTab.student')}
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
                            {t('analyticsTab.highestGrade')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('analyticsTab.studentLabel')}</p>
                        <p className="font-medium text-lg">{stats?.highestStudent || defaultStats.highestStudent}</p>
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">
                            {stats?.highest || defaultStats.highest}%
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-red-50 dark:bg-red-900/20">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-red-500" />
                            {t('analyticsTab.lowestGrade')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('analyticsTab.studentLabel')}</p>
                        <p className="font-medium text-lg">{stats?.lowestStudent || defaultStats.lowestStudent}</p>
                        <p className="text-4xl font-bold text-red-600 dark:text-red-400 mt-2">{stats?.lowest || defaultStats.lowest}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* At-Risk Students */}
            <Card>
                <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        {t('analyticsTab.atRiskStudents')}
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
                        {t('analyticsTab.sendWarning')}
                    </Button>
                </CardContent>
            </Card>

            {/* Historical Comparison */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('analyticsTab.historicalTrends')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {historicalData.map((item, index) => (
                            <div key={item.term} className="flex items-center gap-4">
                                <div className="w-32 font-medium">{item.term}</div>
                                <div className="flex-1">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                                        <div
                                            className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-end pr-3 text-white font-medium"
                                            style={{ width: `${item.average}%` }}
                                        >
                                            {item.average}%
                                        </div>
                                    </div>
                                </div>
                                {index === historicalData.length - 1 && (
                                    <Badge className="bg-green-500">✅ {t('common.success')}</Badge>
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
                    {t('analyticsTab.exportReport')}
                </Button>
            </div>
        </div>
    );
}
