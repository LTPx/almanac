// app/admin/layout.tsx
import { Sidebar } from "@/components/admin/sidebar";
import { Header } from "@/components/admin/header";

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

// import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// import AppSidebar from "@/components/app-sidebar";
// import AppHeader from "@/components/app-header";
// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import { UserProvider } from "@/context/UserContext";

// export default async function DashboardLayout({
//   children
// }: {
//   children: React.ReactNode;
// }) {
//   const session = await auth.api.getSession({
//     headers: await headers()
//   });

//   if (!session) {
//     return redirect("/sign-in");
//   }

//   const user = session?.user;

//   return (
//     <UserProvider user={user}>
//       <SidebarProvider>
//         <AppSidebar variant="inset" />
//         <SidebarInset>
//           <AppHeader user={user} />
//           <main className="flex-1 p-6">{children}</main>
//         </SidebarInset>
//       </SidebarProvider>
//     </UserProvider>
//   );
// }
