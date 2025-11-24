import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Building,
    BookOpen,
    GraduationCap,
    FileText,
    Users,
    UserCog,
    Settings,
    Calendar,
    UserPlus,
    CalendarDays,
    ClipboardList,
    Eye,
    FolderOpen,
    School,
    Clock,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { facultyService } from "@/services/api";

interface NavItem {
    icon: React.ElementType;
    label: string;
    path: string;
    roles?: string[]; // Optional: which roles can see this item
}

interface SidebarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
    const { t } = useTranslation();
    const location = useLocation();
    const { user } = useAuthStore();
    const [facultySections, setFacultySections] = useState<any[]>([]);
    const [showCourses, setShowCourses] = useState(true);

    useEffect(() => {
        if (user?.role === "FACULTY" || user?.role === "TA") {
            fetchFacultySections();
        }
    }, [user]);

    const fetchFacultySections = async () => {
        try {
            console.log("🔍 Fetching faculty sections for user:", user?.id);
            const facultyResponse = await facultyService.getAll();
            console.log("📚 Faculty response:", facultyResponse);
            
            if (facultyResponse.success) {
                const allFaculty = facultyResponse.data?.faculty || facultyResponse.data || [];
                console.log("👨‍🏫 All faculty:", allFaculty);
                
                const currentFaculty = allFaculty.find((f: any) => f.userId === user?.id);
                console.log("✅ Current faculty:", currentFaculty);
                
                if (currentFaculty) {
                    const sectionsResponse = await facultyService.getSections(currentFaculty.id);
                    console.log("📖 Sections response:", sectionsResponse);
                    
                    if (sectionsResponse.success) {
                        const sections = sectionsResponse.data?.sections || sectionsResponse.data || [];
                        console.log("✅ Faculty sections:", sections);
                        setFacultySections(sections);
                    }
                } else {
                    console.warn("⚠️ No faculty record found for user");
                }
            }
        } catch (error) {
            console.error("❌ Error fetching faculty sections:", error);
        }
    };

    const navItems: NavItem[] = [
        {
            icon: LayoutDashboard,
            label: t("nav.dashboard"),
            path: "/dashboard",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        // Faculty-only pages
        {
            icon: LayoutDashboard,
            label: t("nav.dashboard"),
            path: "/faculty/dashboard",
            roles: ["FACULTY", "TA"],
        },
        // Student-only pages
        {
            icon: LayoutDashboard,
            label: t("nav.dashboard"),
            path: "/student/dashboard",
            roles: ["STUDENT"],
        },
        {
            icon: Calendar,
            label: t("nav.registration"),
            path: "/student/registration",
            roles: ["STUDENT"],
        },
        {
            icon: BookOpen,
            label: t("nav.mySubjects"),
            path: "/student/subjects",
            roles: ["STUDENT"],
        },
        {
            icon: GraduationCap,
            label: t("nav.grades"),
            path: "/student/grades",
            roles: ["STUDENT"],
        },
        {
            icon: CalendarDays,
            label: t("nav.mySchedule"),
            path: "/student/schedule",
            roles: ["STUDENT"],
        },
        {
            icon: Eye,
            label: t("nav.attendance"),
            path: "/student/attendance",
            roles: ["STUDENT"],
        },
        {
            icon: FolderOpen,
            label: t("nav.myRequests"),
            path: "/student/requests",
            roles: ["STUDENT"],
        },
        {
            icon: School,
            label: t("nav.departmentSelection"),
            path: "/student/department-selection",
            roles: ["STUDENT"],
        },
        {
            icon: Settings,
            label: t("nav.settings"),
            path: "/student/settings",
            roles: ["STUDENT"],
        },
        // Shared pages (Admin, Faculty, TA)
        {
            icon: FileText,
            label: t("nav.reports"),
            path: "/reports",
            roles: ["SUPER_ADMIN", "ADMIN", "FACULTY", "TA"],
        },
        {
            icon: ClipboardList,
            label: t("nav.departmentApplications"),
            path: "/department-applications",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        // Admin-only pages
        {
            icon: Building,
            label: t("nav.departments"),
            path: "/departments",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: BookOpen,
            label: t("nav.courses"),
            path: "/courses",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: FileText,
            label: t("nav.curriculum"),
            path: "/curriculum",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: Users,
            label: t("nav.students"),
            path: "/students",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: UserPlus,
            label: t("nav.batches"),
            path: "/batches",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: Calendar,
            label: t("nav.terms"),
            path: "/terms",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: CalendarDays,
            label: t("nav.sections"),
            path: "/sections",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: Clock,
            label: t("nav.schedules"),
            path: "/schedules",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: UserCog,
            label: t("nav.faculty"),
            path: "/faculty",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: Settings,
            label: t("nav.settings"),
            path: "/settings",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
    ];

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter((item) => {
        if (!item.roles) return true; // No role restriction
        return item.roles.includes(user?.role || "");
    });

    return (
        <>
            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out shadow-xl ${
                    isMobileMenuOpen
                        ? "translate-x-0"
                        : "translate-x-full lg:translate-x-0"
                }`}
                style={{ insetInlineEnd: '0' }}>
                {/* Logo */}
                <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {t("common.appName")}
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                    {filteredNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group min-h-11 ${
                                    isActive
                                        ? "bg-blue-600 dark:bg-blue-600 text-white shadow-md"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                                }`}>
                                <Icon className={`w-5 h-5 shrink-0 transition-colors ${
                                    isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                }`} />
                                <span className="font-medium text-sm leading-tight">{item.label}</span>
                            </Link>
                        );
                    })}

                    {/* Faculty Courses Section */}
                    {(user?.role === "FACULTY" || user?.role === "TA") && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setShowCourses(!showCourses)}
                                className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    {t("nav.myCourses")}
                                </span>
                                {showCourses ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </button>
                            
                            {showCourses && (
                                <div className="mt-2 space-y-1">
                                    {facultySections.length > 0 ? (
                                        facultySections.map((section: any) => {
                                            const courseActive = location.pathname === `/faculty/course/${section.id}`;
                                            return (
                                                <Link
                                                    key={section.id}
                                                    to={`/faculty/course/${section.id}`}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={`flex items-start gap-2 px-4 py-2 rounded-lg transition-all duration-200 group ${
                                                        courseActive
                                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                                                    }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {section.course?.code}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                                            {section.course?.nameAr}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                                            لا توجد مواد مسندة لك حالياً
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </nav>
            </aside>
        </>
    );
}
