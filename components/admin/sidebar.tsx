"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  HelpCircle,
  BarChart3,
  Heart,
  Zap,
  Trophy,
  Coins,
  Settings,
  Database
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard
  },
  {
    name: "Unidades",
    href: "/admin/units",
    icon: BookOpen
  },
  {
    name: "Lecciones",
    href: "/admin/lessons",
    icon: GraduationCap
  },
  {
    name: "Preguntas",
    href: "/admin/questions",
    icon: HelpCircle
  },
  {
    name: "Usuarios",
    href: "/admin/users",
    icon: Users
  },
  {
    name: "Progreso",
    href: "/admin/progress",
    icon: BarChart3
  },
  {
    name: "Gamificación",
    href: "/admin/gamification",
    icon: Trophy,
    children: [
      {
        name: "Corazones",
        href: "/admin/gamification/hearts",
        icon: Heart
      },
      {
        name: "ZAP Tokens",
        href: "/admin/gamification/zaps",
        icon: Zap
      },
      {
        name: "Rachas",
        href: "/admin/gamification/streaks",
        icon: Trophy
      }
    ]
  },
  {
    name: "NFTs",
    href: "/admin/nfts",
    icon: Coins
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: Database
  },
  {
    name: "Configuración",
    href: "/admin/settings",
    icon: Settings
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">EduAdmin</h1>
      </div>

      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>

                {item.children && isActive && (
                  <ul className="mt-2 space-y-1 ml-6">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;

                      return (
                        <li key={child.name}>
                          <Link
                            href={child.href}
                            className={cn(
                              "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              isChildActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            <child.icon
                              className={cn(
                                "mr-3 h-4 w-4 flex-shrink-0",
                                isChildActive
                                  ? "text-blue-500"
                                  : "text-gray-400 group-hover:text-gray-500"
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
