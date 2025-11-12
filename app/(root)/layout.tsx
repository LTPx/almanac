// app/(root)/layout.tsx
import Navbar from "@/components/navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserProvider } from "@/context/UserContext";
import FooterNav from "@/components/footer-nav";
import DevGoogleAdManager from "@/components/dev-google-admanager";

export default async function HomeLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = session.user;

  return (
    <UserProvider user={user}>
      <div className="relative">
        <Navbar />
        <main>{children}</main>
        <FooterNav />
        <DevGoogleAdManager />
      </div>
    </UserProvider>
  );
}
