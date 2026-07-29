"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, BookOpen } from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      label: "Paths",
      href: "/paths",
      icon: Compass,
    },
    {
      label: "Journal",
      href: "/logs",
      icon: BookOpen,
    },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-[#0f172a]/95 backdrop-blur-md border-t border-gray-800/80 flex justify-around items-center py-3 z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              isActive
                ? "text-blue-500 scale-105"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                  : "bg-transparent"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium tracking-wide uppercase">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
