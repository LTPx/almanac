"use client"

import Link from "next/link"
import { LayoutDashboard, BookAIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail
} from "@/components/ui/sidebar"
import SignOutForm from "./sign-out-form"
import Logo from "./logo"
import { usePathname } from "next/navigation"

const menuItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    href: "/admin/units",
    label: "Unidades",
    icon: BookAIcon
  }
]

export default function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="flex items-center">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 py-4">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton isActive={isActive} size="lg">
                  <Link
                    href={item.href}
                    className={`${
                      isActive ? "text-foreground" : "text-primary"
                    } flex items-center gap-3`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SignOutForm />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
