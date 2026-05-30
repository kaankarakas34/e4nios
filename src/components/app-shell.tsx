"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Building2,
  ClipboardCheck,
  Database,
  LayoutDashboard,
  Library,
  Mail,
  Network,
  Search,
  Send,
  Settings,
  Signal,
  Sparkles,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/organizations", label: "Organizations", icon: Network },
  { href: "/research", label: "Research", icon: Search },
  { href: "/signals", label: "Signal Inbox", icon: Signal },
  { href: "/moves", label: "Relationship Moves", icon: Send },
  { href: "/review", label: "Review Queue", icon: ClipboardCheck },
  { href: "/messages", label: "Message Studio", icon: Mail },
  { href: "/agents", label: "Agent Runs", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

const secondaryItems = [
  { label: "Prompt Library", icon: Sparkles },
  { label: "Knowledge Base", icon: Library },
  { label: "Supabase", icon: Database },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#2a2a2a] bg-[#090909] px-4 py-5 lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="grid size-10 place-items-center rounded-md bg-[#ef4444] text-sm font-semibold text-white shadow-[0_0_32px_rgba(239,68,68,0.22)]">
            E4N
          </div>
          <div>
            <p className="text-sm font-semibold">Relationship Brain</p>
            <p className="text-xs text-[#a3a3a3]">AI intelligence OS</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm text-[#d4d4d4] hover:bg-[#171717] hover:text-white",
                  isActive && "bg-[#1f0a0a] font-medium text-[#ffffff] ring-1 ring-[#3f1d1d]",
                )}
                href={item.href}
                key={item.href}
              >
                <item.icon className={cn("size-4", isActive && "text-[#ef4444]")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 border-t border-[#2a2a2a] pt-5">
          <p className="px-3 text-xs font-medium uppercase text-[#8a8a8a]">
            Coming next
          </p>
          <div className="mt-2 space-y-1">
            {secondaryItems.map((item) => (
              <div
                className="flex h-9 items-center gap-3 rounded-md px-3 text-sm text-[#8a8a8a]"
                key={item.label}
              >
                <item.icon className="size-4" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="lg:pl-72">{children}</main>
    </div>
  );
}
