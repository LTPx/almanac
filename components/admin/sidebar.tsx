"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  HelpCircle,
  // Heart,
  Coins,
  Settings,
  Flag,
  MonitorPlay,
  Sparkles,
  ChevronRight,
  GraduationCap as AcademicIcon
} from "lucide-react";

interface NavItem {
  name: string;
  icon: React.ElementType;
  href?: string;
  children?: NavItem[];
}

// Content Section - Main educational content
const contentNav: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Curriculum", href: "/admin/curriculums", icon: BookOpen },
  { name: "Unidades", href: "/admin/units", icon: BookOpen },
  { name: "Lecciones", href: "/admin/lessons", icon: GraduationCap },
  { name: "Preguntas", href: "/admin/questions", icon: HelpCircle }
];

// Management Section - App management
const managementNav: NavItem[] = [
  { name: "Problemas", href: "/admin/problem-reports", icon: Flag },
  { name: "Anuncios", href: "/admin/ads", icon: MonitorPlay },
  { name: "NFTs", href: "/admin/nfts", icon: Coins }
];

// Settings Section
const settingsNav: NavItem[] = [
  {
    name: "Configuración",
    icon: Settings,
    children: [
      { name: "Generador IA", href: "/admin/ai-generator", icon: Sparkles },
      { name: "Subir Contenido", href: "/admin/settings", icon: AcademicIcon }
      // { name: "Corazones", href: "/admin/gamification/hearts", icon: Heart }
    ]
  }
];

interface SidebarProps {
  collapsed?: boolean;
  className?: string;
}

export function Sidebar({ collapsed = false, className }: SidebarProps) {
  const [openMenus, setOpenMenus] = useState<string[]>(["Configuración"]);
  const pathname = usePathname();

  const toggleMenu = (title: string) => {
    if (collapsed) return;
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const renderNavItem = (item: NavItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus.includes(item.name);
    const active = isActive(item.href);
    const Icon = item.icon;

    if (collapsed && isChild) return null;

    const handleClick = (e: React.MouseEvent) => {
      if (hasChildren && !item.href) {
        e.preventDefault();
        toggleMenu(item.name);
      }
    };

    const itemClasses = cn(
      "w-full flex items-center gap-3 py-2 text-sm rounded-md transition-all",
      collapsed ? "px-2 justify-center" : "px-3",
      isChild && !collapsed ? "pl-10" : "",
      active
        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      "group relative"
    );

    const content = (
      <>
        <Icon
          className={cn(
            "h-5 w-5 flex-shrink-0",
            collapsed && "h-6 w-6",
            active && "text-sidebar-primary-foreground"
          )}
        />

        {!collapsed && (
          <>
            <span
              className={cn(
                "flex-1 text-left",
                active && "text-sidebar-primary-foreground"
              )}
            >
              {item.name}
            </span>
            {hasChildren && (
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-90"
                )}
              />
            )}
          </>
        )}

        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {item.name}
          </div>
        )}
      </>
    );

    return (
      <div key={item.name}>
        {item.href ? (
          <Link href={item.href} className={itemClasses} onClick={handleClick}>
            {content}
          </Link>
        ) : (
          <button className={itemClasses} onClick={handleClick}>
            {content}
          </button>
        )}

        {hasChildren && isOpen && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderNavItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-sidebar-border transition-all",
          collapsed ? "justify-center px-2" : "gap-3 px-6"
        )}
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-600">
            <AcademicIcon className="h-5 w-5 text-white" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">Almanac</h1>
              <p className="text-xs text-muted-foreground truncate">
                Admin Panel
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Content Section */}
        <div>
          {!collapsed && (
            <h2 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contenido
            </h2>
          )}
          <div className="space-y-1">
            {contentNav.map((item) => renderNavItem(item))}
          </div>
        </div>

        {/* Management Section */}
        <div>
          {!collapsed && (
            <h2 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Gestión
            </h2>
          )}
          <div className="space-y-1">
            {managementNav.map((item) => renderNavItem(item))}
          </div>
        </div>

        {/* Settings Section */}
        <div>
          {!collapsed && (
            <h2 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Configuración
            </h2>
          )}
          <div className="space-y-1">
            {settingsNav.map((item) => renderNavItem(item))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
