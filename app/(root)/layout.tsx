// app/(root)/layout.tsx
import Navbar from "@/components/navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserProvider } from "@/context/UserContext";
import FooterNav from "@/components/footer-nav";
import { checkAndUpdateTrialStatus } from "@/lib/subscriptions";

export default async function HomeLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/home");
  }

  const user = session.user;

  // Verificar si el trial interno ha expirado y actualizar status
  const trialExpired = await checkAndUpdateTrialStatus(user.id);

  // Si el trial expiró, usar FREE como status
  const status = trialExpired ? "FREE" : user.subscriptionStatus;
  const isTrialing = status === "TRIALING";
  const isActive = status === "ACTIVE";
  const isPremium = isTrialing || isActive;
  const hasWallet = !!user.walletAddress;
  const adminUsers = process.env.ADMIN_USERS_IDS || "";
  const users = adminUsers.split(",");
  const isAdmin = users.includes(user.id);

  return (
    <UserProvider user={{ ...user, isPremium, isAdmin, hasWallet }}>
      <div className="relative">
        <Navbar />
        <main>{children}</main>
        <FooterNav />
      </div>
    </UserProvider>
  );
}
