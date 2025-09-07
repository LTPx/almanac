"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { Home, BookOpen, Medal, User, Book } from "lucide-react"; // 👈 reemplazo de react-icons
import isInViewport from "@/lib/utils";

let WIN_PREV_POSITION = 0;
if (typeof window !== "undefined") {
  WIN_PREV_POSITION = window.pageYOffset;
}

const NAV: {
  name: string;
  link: string;
  icon?: React.ComponentType<any>;
  iconOpen?: React.ComponentType<any>;
  iconClosed?: React.ComponentType<any>;
}[] = [
  { name: "Home", link: "/home", icon: Home },
  {
    name: "Contents",
    link: "/contents",
    iconOpen: BookOpen,
    iconClosed: Book
  },
  { name: "Achievements", link: "/achievements", icon: Medal },
  { name: "Profile", link: "/profile", icon: User }
];

const FooterNav = ({
  guestMode,
  cartLink
}: {
  guestMode?: boolean;
  cartLink?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = usePathname();

  const navigationMenu = NAV;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleEvent);
    }
    return () => {
      window.removeEventListener("scroll", handleEvent);
    };
  }, []);

  const handleEvent = () => {
    window.requestAnimationFrame(showHideHeaderMenu);
  };

  const showHideHeaderMenu = () => {
    const currentScrollPos = window.pageYOffset;
    if (!containerRef.current) return;
    if (currentScrollPos > WIN_PREV_POSITION) {
      if (
        isInViewport(containerRef.current) &&
        currentScrollPos - WIN_PREV_POSITION < 80
      ) {
        return;
      }
      containerRef.current.classList.add("FooterNav--hide");
    } else {
      if (
        !isInViewport(containerRef.current) &&
        WIN_PREV_POSITION - currentScrollPos < 80
      ) {
        return;
      }
      containerRef.current.classList.remove("FooterNav--hide");
    }
    WIN_PREV_POSITION = currentScrollPos;
  };

  return (
    <div
      ref={containerRef}
      className="w-[650px] FooterNav block p-2 bg-white fixed top-auto bottom-0 z-30 border-t border-neutral-300
        transition-transform duration-300 ease-in-out"
    >
      <div className="w-full flex justify-around mx-auto text-sm text-center ">
        {navigationMenu.map((item, index) => {
          const active = location === item.link;
          let IconComponent: React.ComponentType<any> = item.icon!;
          if (item.name === "Contents") {
            IconComponent = active ? item.iconOpen! : item.iconClosed!;
          }

          return (
            <Link
              key={index}
              href={item.link}
              className={`h-[50px] relative flex items-center justify-between text-neutral-500 ${
                active ? "text-red-900" : ""
              }`}
            >
              <IconComponent
                className={`w-7 h-7 ${active ? "text-primary-600" : ""}`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FooterNav;
