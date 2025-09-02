"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { Home, BookOpen, Medal, User } from "lucide-react"; // 👈 reemplazo de react-icons
import isInViewport from "@/lib/utils";

let WIN_PREV_POSITION = window.pageYOffset;

const NAV = [
  { name: "Home", link: "/home", icon: Home },
  { name: "Contents", link: "/contents", icon: BookOpen },
  { name: "Achievements", link: "/achievements", icon: Medal },
  { name: "Profile", link: "/profile", icon: User },
];

const FooterNav = ({
  guestMode,
  cartLink,
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
      className="FooterNav block md:hidden p-2 bg-white fixed top-auto bottom-0 inset-x-0 z-30 border-t border-neutral-300
        transition-transform duration-300 ease-in-out"
    >
      <div className="w-full max-w-lg flex justify-around mx-auto text-sm text-center ">
        {navigationMenu.map((item, index) => {
          const active = location === item.link;
          return (
            <Link
              key={index}
              href={item.link}
              className={`relative flex flex-col items-center justify-between text-neutral-500 ${
                active ? "text-red-900" : ""
              }`}
            >
              <item.icon
                className={`w-6 h-6 ${active ? "text-primary-600" : ""}`}
              />
              {/* <span className="text-[11px] leading-none mt-1">{item.name}</span> */}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FooterNav;
