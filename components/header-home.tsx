"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function HeaderHome() {
  const pathname = usePathname();
  const isHomePage = pathname === "/home";
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const updateHash = () => {
      setActiveHash(window.location.hash || "");
    };

    updateHash();

    window.addEventListener("hashchange", updateHash);
    window.addEventListener("popstate", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
      window.removeEventListener("popstate", updateHash);
    };
  }, [pathname]);

  const getLink = (hash: string) => {
    return isHomePage ? hash : `/home${hash}`;
  };

  const isActive = (section: string) => {
    if (pathname === "/white-paper" && section === "/white-paper") return true;
    if (!isHomePage) return false;
    return activeHash === section;
  };

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    hash: string
  ) => {
    if (!isHomePage) return;

    e.preventDefault();
    const targetId = hash.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      window.history.pushState(null, "", hash);
      setActiveHash(hash);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/home"
          className="flex items-center gap-2"
          onClick={() => setActiveHash("")}
        >
          <span className="rounded-full bg-card px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
            OpenMind
          </span>
          <span className="text-sm text-muted-foreground">×</span>
          <span className="text-sm font-semibold text-foreground">Almanac</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a
            href={getLink("#how-it-works")}
            onClick={(e) => handleSmoothScroll(e, "#how-it-works")}
            className={`hover:text-foreground transition-colors ${
              isActive("#how-it-works") ? "text-primary font-semibold" : ""
            }`}
          >
            How it works
          </a>
          <a
            href={getLink("#content")}
            onClick={(e) => handleSmoothScroll(e, "#content")}
            className={`hover:text-foreground transition-colors ${
              isActive("#content") ? "text-primary font-semibold" : ""
            }`}
          >
            Content
          </a>
          <a
            href={getLink("#nfts")}
            onClick={(e) => handleSmoothScroll(e, "#nfts")}
            className={`hover:text-foreground transition-colors ${
              isActive("#nfts") ? "text-primary font-semibold" : ""
            }`}
          >
            NFTs
          </a>
          <a
            href={getLink("#results")}
            onClick={(e) => handleSmoothScroll(e, "#results")}
            className={`hover:text-foreground transition-colors ${
              isActive("#results") ? "text-primary font-semibold" : ""
            }`}
          >
            Results
          </a>
          <Link
            href="/white-paper"
            className={`hover:text-foreground transition-colors ${
              isActive("/white-paper") ? "text-primary font-semibold" : ""
            }`}
          >
            White paper
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="rounded-full border border-border px-4 py-2 text-sm text-foreground hover:border-muted-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Play Almanac
          </Link>
        </div>
      </div>
    </header>
  );
}
