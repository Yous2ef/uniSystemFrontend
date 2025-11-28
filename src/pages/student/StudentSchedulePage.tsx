import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User } from "lucide-react";
import { enrollmentsService } from "@/services/api";

interface ScheduleSlot {
    day: number;
    startTime: string;
    endTime: string;
    courseName: string;
    courseCode: string;
    facultyName: string;
    room: string;
    code: string;
}

const DAYS = [0, 1, 2, 3, 4]; // Sunday to Thursday

export default function StudentSchedulePage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);

    useEffect(() => {
        fetchSchedule();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Generate time slots from schedule data
        if (schedule.length > 0) {
            const hours = new Set<number>();
            schedule.forEach((slot) => {
                const startHour = parseInt(slot.startTime.split(":")[0]);
                const endHour = parseInt(slot.endTime.split(":")[0]);
                for (let h = startHour; h <= endHour; h++) {
                    hours.add(h);
                }
            });
            const sortedHours = Array.from(hours).sort((a, b) => a - b);
            const slots = sortedHours.map((h) => `${h}:00`);
            setTimeSlots(slots);
        } else {
            // Default time slots if no schedule
            setTimeSlots([
                "8:00",
                "9:00",
                "10:00",
                "11:00",
                "12:00",
                "1:00",
                "2:00",
                "3:00",
                "4:00",
                "5:00",
                "6:00",
            ]);
        }
    }, [schedule]);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            console.log("📅 Fetching schedule for user:", user?.id);

            // Get student's enrollments with section schedules
            const response = await enrollmentsService.getMyEnrollments({
                status: "ENROLLED",
            });

            console.log("📦 Enrollments response:", response);

            if (response.success) {
                const enrollments = Array.isArray(response.data)
                    ? response.data
                    : [];
                console.log("✅ Enrollments:", enrollments);

                // Extract schedule slots from enrollments
                const slots: ScheduleSlot[] = [];
                enrollments.forEach((enrollment: any) => {
                    if (enrollment.section?.schedules) {
                        enrollment.section.schedules.forEach(
                            (schedule: any) => {
                                slots.push({
                                    day: schedule.day,
                                    startTime: schedule.startTime,
                                    endTime: schedule.endTime,
                                    courseName:
                                        enrollment.section.course.nameAr,
                                    courseCode: enrollment.section.course.code,
                                    facultyName:
                                        enrollment.section.faculty?.nameAr ||
                                        "غير محدد",
                                    room: schedule.room || "-",
                                    code: enrollment.section.code,
                                });
                            }
                        );
                    }
                });

                console.log("🗓️ Schedule slots:", slots);
                setSchedule(slots);
            }
        } catch (error) {
            console.error("❌ Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    const getScheduleForDay = (day: number) => {
        return schedule.filter((slot) => slot.day === day);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            {t("common.loading")}
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        📅 {t("student.schedule.title")}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t("student.schedule.subtitle")}
                    </p>
                </div>

                {/* Desktop View - Grid */}
                <div className="hidden lg:block">
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b dark:border-gray-700">
                                            <th className="p-4 text-right font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
                                                {t("student.schedule.time")}
                                            </th>
                                            {DAYS.map((day) => (
                                                <th
                                                    key={day}
                                                    className="p-4 text-center font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
                                                    {t(
                                                        `student.schedule.days.${day}`
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timeSlots.map((time) => (
                                            <tr
                                                key={time}
                                                className="border-b dark:border-gray-700">
                                                <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                                    {time}
                                                </td>
                                                {DAYS.map((day) => {
                                                    const daySchedule =
                                                        getScheduleForDay(day);
                                                    // Find slot that matches this time hour
                                                    const slot =
                                                        daySchedule.find(
                                                            (s) => {
                                                                const slotHour =
                                                                    parseInt(
                                                                        s.startTime.split(
                                                                            ":"
                                                                        )[0]
                                                                    );
                                                                const timeHour =
                                                                    parseInt(
                                                                        time.split(
                                                                            ":"
                                                                        )[0]
                                                                    );
                                                                return (
                                                                    slotHour ===
                                                                    timeHour
                                                                );
                                                            }
                                                        );

                                                    return (
                                                        <td
                                                            key={day}
                                                            className="p-2">
                                                            {slot && (
                                                                <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                                                    <p className="font-medium text-sm">
                                                                        {
                                                                            slot.courseCode
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs mt-1">
                                                                        {
                                                                            slot.courseName
                                                                        }
                                                                    </p>
                                                                    <div className="flex items-center gap-1 mt-2 text-xs">
                                                                        <Clock className="w-3 h-3" />
                                                                        {
                                                                            slot.startTime
                                                                        }{" "}
                                                                        -{" "}
                                                                        {
                                                                            slot.endTime
                                                                        }
                                                                    </div>
                                                                    <div className="flex items-center gap-1 mt-1 text-xs">
                                                                        <MapPin className="w-3 h-3" />
                                                                        {
                                                                            slot.room
                                                                        }
                                                                    </div>
                                                                    <div className="flex items-center gap-1 mt-1 text-xs">
                                                                        <User className="w-3 h-3" />
                                                                        {
                                                                            slot.facultyName
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Mobile View - Cards */}
                <div className="lg:hidden space-y-4">
                    {DAYS.map((day) => {
                        const daySchedule = getScheduleForDay(day);
                        if (daySchedule.length === 0) return null;

                        return (
                            <Card key={day}>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        {t(`student.schedule.days.${day}`)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {daySchedule.map((slot, slotIndex) => (
                                        <div
                                            key={slotIndex}
                                            className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium">
                                                            {slot.courseCode}
                                                        </h4>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs">
                                                            {t(
                                                                "student.subjects.section"
                                                            )}{" "}
                                                            {slot.code}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm mt-1">
                                                        {slot.courseName}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-3 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {slot.startTime} -{" "}
                                                            {slot.endTime}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {slot.room}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-2 text-sm">
                                                        <User className="w-4 h-4" />
                                                        {slot.facultyName}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Schedule loaded message */}
                {schedule.length === 0 && !loading && (
                    <Card>
                        <CardContent className="p-6 text-center text-gray-500">
                            {t("student.schedule.noSchedule")}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
