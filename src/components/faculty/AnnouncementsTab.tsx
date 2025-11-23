import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Bell, Mail, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    sendNotification: boolean;
    sendEmail: boolean;
}

export default function AnnouncementsTab({ sectionId }: { sectionId: string }) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([
        {
            id: "1",
            title: "إلغاء محاضرة الغد",
            content: "عزيزي الطالب، نعتذر عن إلغاء محاضرة الغد لظروف طارئة. سيتم تعويضها يوم الخميس في نفس الموعد.",
            date: "2025-11-20",
            sendNotification: true,
            sendEmail: true,
        },
    ]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: "",
        content: "",
        sendNotification: true,
        sendEmail: true,
    });

    const createAnnouncement = () => {
        if (!newAnnouncement.title || !newAnnouncement.content) {
            toast.error("يرجى إدخال العنوان والمحتوى");
            return;
        }

        const announcement: Announcement = {
            id: Date.now().toString(),
            ...newAnnouncement,
            date: new Date().toISOString().split("T")[0],
        };

        setAnnouncements([announcement, ...announcements]);
        setDialogOpen(false);
        setNewAnnouncement({
            title: "",
            content: "",
            sendNotification: true,
            sendEmail: true,
        });
        toast.success("تم نشر الإعلان بنجاح");
    };

    const deleteAnnouncement = (id: string) => {
        setAnnouncements(announcements.filter((a) => a.id !== id));
        toast.success("تم حذف الإعلان");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">📢 الإعلانات</h3>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    إعلان جديد
                </Button>
            </div>

            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center text-gray-500">
                            لا توجد إعلانات
                        </CardContent>
                    </Card>
                ) : (
                    announcements.map((announcement) => (
                        <Card key={announcement.id}>
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                📅 {announcement.date}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteAnnouncement(announcement.id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {announcement.content}
                                </p>
                                <div className="mt-4 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    {announcement.sendNotification && (
                                        <div className="flex items-center gap-1">
                                            <Bell className="w-4 h-4" />
                                            إشعار في النظام
                                        </div>
                                    )}
                                    {announcement.sendEmail && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" />
                                            بريد إلكتروني
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Announcement Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>📢 إعلان جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>العنوان</Label>
                            <Input
                                value={newAnnouncement.title}
                                onChange={(e) =>
                                    setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                                }
                                placeholder="مثال: إلغاء محاضرة الغد"
                            />
                        </div>
                        <div>
                            <Label>المحتوى</Label>
                            <Textarea
                                value={newAnnouncement.content}
                                onChange={(e) =>
                                    setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                                }
                                placeholder="اكتب محتوى الإعلان هنا..."
                                rows={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>🔔 إرسال إشعار:</Label>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={newAnnouncement.sendNotification}
                                    onCheckedChange={(checked) =>
                                        setNewAnnouncement({
                                            ...newAnnouncement,
                                            sendNotification: checked as boolean,
                                        })
                                    }
                                />
                                <label className="text-sm">في النظام</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={newAnnouncement.sendEmail}
                                    onCheckedChange={(checked) =>
                                        setNewAnnouncement({
                                            ...newAnnouncement,
                                            sendEmail: checked as boolean,
                                        })
                                    }
                                />
                                <label className="text-sm">بالبريد الإلكتروني</label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={createAnnouncement}>
                            <MessageSquare className="w-4 h-4 ml-2" />
                            📢 نشر الإعلان
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
