"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "◉" },
  { href: "/weekly", label: "Planner", icon: "⊞" },
  { href: "/dashboard", label: "Missions", icon: "✦" },
  { href: "/profile", label: "Profile", icon: "◎" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-[#111111] border-t border-[#1a1a1a]">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-3 ${
                isActive ? "text-brand-500" : "text-[#555]"
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
