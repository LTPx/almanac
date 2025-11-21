// app/(root)/layout.tsx
import Navbar from "@/components/navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserProvider } from "@/context/UserContext";
import FooterNav from "@/components/footer-nav";

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
  const status = user.subscriptionStatus;
  const isTrialing = status === "TRIALING";
  const isActive = status === "ACTIVE";
  const isPremium = isTrialing || isActive;

  return (
    <UserProvider user={{ ...user, isPremium }}>
      <div className="relative">
        <Navbar />
        <main>{children}</main>
        <FooterNav />
      </div>
    </UserProvider>
  );
}
