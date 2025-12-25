"use client";

import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import Logo from "./logo";
import { useUser } from "@/context/UserContext";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { Bot } from "lucide-react";

export default function Navbar() {
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      window.location.href = "/sign-in";
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to sign out");
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-100 flex justify-center">
      <div className="container border w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 px-4">
        <nav className="flex items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-6">
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/almanac-tutor"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  data-tutorial-chat="true"
                >
                  <Button variant="outline">
                    <Bot className="h-5 w-5" />
                    Chat
                  </Button>
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                )}
                <Button
                  variant="default"
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing out..." : "Logout"}
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Button variant="outline">Login</Button>
                </Link>
                <Button asChild>
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
