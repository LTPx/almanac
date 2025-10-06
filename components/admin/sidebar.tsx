"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  // Users,
  HelpCircle,
  // BarChart3,
  Heart,
  Zap,
  Trophy,
  Coins
  // Settings,
  // Database
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Curriculum", href: "/admin/curriculums", icon: BookOpen },
  { name: "Unidades", href: "/admin/units", icon: BookOpen },
  { name: "Lecciones", href: "/admin/lessons", icon: GraduationCap },
  { name: "Preguntas", href: "/admin/questions", icon: HelpCircle },
  { name: "NFTs", href: "/admin/nfts", icon: Coins },
  // { name: "Usuarios", href: "/admin/users", icon: Users },
  // { name: "Progreso", href: "/admin/progress", icon: BarChart3 },
  {
    name: "Gamificación",
    href: "/admin/gamification",
    icon: Trophy,
    children: [
      { name: "Corazones", href: "/admin/gamification/hearts", icon: Heart },
      { name: "ZAP Tokens", href: "/admin/gamification/zaps", icon: Zap },
      { name: "Rachas", href: "/admin/gamification/streaks", icon: Trophy }
    ]
  }
  // { name: "Analytics", href: "/admin/analytics", icon: Database },
  // { name: "Configuración", href: "/admin/settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  const isActiveLink = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold">Almanac</h1>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const hasChildren = item.children && item.children.length > 0;

            const isParentActive = hasChildren
              ? item.children.some((child) => isActiveLink(child.href, true))
              : isActiveLink(item.href, true);

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isParentActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isParentActive
                        ? "text-sidebar-primary-foreground"
                        : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                    )}
                  />
                  {item.name}
                </Link>

                {/* Children */}
                {hasChildren && isParentActive && (
                  <ul className="mt-2 space-y-1 ml-6">
                    {item.children.map((child) => {
                      const isChildActive = isActiveLink(child.href, true);

                      return (
                        <li key={child.name}>
                          <Link
                            href={child.href}
                            className={cn(
                              "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              isChildActive
                                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <child.icon
                              className={cn(
                                "mr-3 h-4 w-4 flex-shrink-0",
                                isChildActive
                                  ? "text-sidebar-primary-foreground"
                                  : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                              )}
                            />
                            {child.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
