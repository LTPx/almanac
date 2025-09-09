import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserProvider } from "@/context/UserContext";
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";
import FooterNav from "@/components/footer-nav";

export default async function HomeLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const user = session?.user ?? null;
  return (
    <UserProvider user={user}>
      <div className="relative">
        {/* <Navbar /> */}
        <main>{children}</main>
        <FooterNav />
        {/* <Footer /> */}
      </div>
    </UserProvider>
  );
}
