import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { sectionsService } from "@/services/api";

interface AddScheduleModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    section: { id: string; code: string; course: { nameAr: string } };
}

interface ScheduleFormData {
    day: string;
    startTime: string;
    endTime: string;
    room?: string;
}

export default function AddScheduleModal({
    open,
    onClose,
    onSuccess,
    section,
}: AddScheduleModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const scheduleSchema = z
        .object({
            day: z.string().min(1, t("schedules.modal.dayRequired")),
            startTime: z
                .string()
                .regex(
                    /^([01]\d|2[0-3]):([0-5]\d)$/,
                    t("schedules.modal.invalidTimeFormat")
                ),
            endTime: z
                .string()
                .regex(
                    /^([01]\d|2[0-3]):([0-5]\d)$/,
                    t("schedules.modal.invalidTimeFormat")
                ),
            room: z.string().optional(),
        })
        .refine((data) => data.startTime < data.endTime, {
            message: t("schedules.modal.startBeforeEnd"),
            path: ["endTime"],
        });

    const daysOptions = [
        { value: "0", label: t("schedules.days.sunday") },
        { value: "1", label: t("schedules.days.monday") },
        { value: "2", label: t("schedules.days.tuesday") },
        { value: "3", label: t("schedules.days.wednesday") },
        { value: "4", label: t("schedules.days.thursday") },
        { value: "5", label: t("schedules.days.friday") },
        { value: "6", label: t("schedules.days.saturday") },
    ];

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<ScheduleFormData>({
        resolver: zodResolver(scheduleSchema),
    });

    const selectedDay = watch("day");

    const onSubmit = async (data: ScheduleFormData) => {
        if (!section) return;

        try {
            setLoading(true);
            await sectionsService.addSchedule(section.id, {
                day: parseInt(data.day),
                startTime: data.startTime,
                endTime: data.endTime,
                room: data.room || undefined,
            });
            reset();
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error adding schedule:", error);
            alert(t("schedules.modal.addFailed"));
        } finally {
            setLoading(false);
        }
    };

    if (!section) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("schedules.modal.title")}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogBody className="space-y-4">
                        {/* Section Info */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                {t("sections.title")}
                            </p>
                            <p className="font-bold">{section.code}</p>
                            <p className="text-sm">{section.course.nameAr}</p>
                        </div>

                        {/* Day */}
                        <div>
                            <Label htmlFor="day">
                                {t("schedules.modal.day")} *
                            </Label>
                            <Select
                                value={selectedDay}
                                onValueChange={(value) =>
                                    setValue("day", value)
                                }>
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={t(
                                            "schedules.modal.selectDay"
                                        )}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {daysOptions.map((day) => (
                                        <SelectItem
                                            key={day.value}
                                            value={day.value}>
                                            {day.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.day && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.day.message}
                                </p>
                            )}
                        </div>

                        {/* Start Time */}
                        <div>
                            <Label htmlFor="startTime">
                                {t("schedules.modal.startTime")} *
                            </Label>
                            <Input
                                id="startTime"
                                type="time"
                                {...register("startTime")}
                                placeholder="08:00"
                            />
                            {errors.startTime && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.startTime.message}
                                </p>
                            )}
                        </div>

                        {/* End Time */}
                        <div>
                            <Label htmlFor="endTime">
                                {t("schedules.modal.endTime")} *
                            </Label>
                            <Input
                                id="endTime"
                                type="time"
                                {...register("endTime")}
                                placeholder="10:00"
                            />
                            {errors.endTime && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.endTime.message}
                                </p>
                            )}
                        </div>

                        {/* Room */}
                        <div>
                            <Label htmlFor="room">
                                {t("schedules.modal.room")}
                            </Label>
                            <Input
                                id="room"
                                {...register("room")}
                                placeholder={t(
                                    "schedules.modal.roomPlaceholder"
                                )}
                            />
                            {errors.room && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.room.message}
                                </p>
                            )}
                        </div>
                    </DialogBody>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}>
                            {t("common.cancel")}
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading
                                ? t("schedules.modal.saving")
                                : t("common.save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
