"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/features/auth/components/UserMenu";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "◉" },
  { href: "/weekly", label: "Planner", icon: "⊞" },
  { href: "/dashboard", label: "Missions", icon: "✦" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-[#111111]">
      <div className="flex items-center gap-2 px-6 pt-6 pb-8">
        <span className="text-xl font-bold text-white">Sprint29</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-brand-600/10 text-brand-500 font-medium"
                  : "text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-[#1a1a1a]">
        <UserMenu />
      </div>
    </aside>
  );
}
