import Link from "next/link";
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
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/review", label: "Review Queue", icon: ClipboardCheck },
  { href: "/messages", label: "Message Studio", icon: Mail },
  { href: "/agents", label: "Agent Runs", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

const secondaryItems = [
  { label: "Companies", icon: Building2 },
  { label: "Organizations", icon: Network },
  { label: "Research", icon: Search },
  { label: "Prompt Library", icon: Sparkles },
  { label: "Knowledge Base", icon: Library },
  { label: "Supabase", icon: Database },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#d8ded5] bg-[#fbfbf8] px-4 py-5 lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="grid size-10 place-items-center rounded-md bg-[#1f6f5b] text-sm font-semibold text-white">
            E4N
          </div>
          <div>
            <p className="text-sm font-semibold">Relationship Brain</p>
            <p className="text-xs text-[#69746d]">AI intelligence OS</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <Link
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm text-[#34413a] hover:bg-[#eef3ec]",
                item.href === "/" && "bg-[#e4eee9] font-medium text-[#13392f]",
              )}
              href={item.href}
              key={item.href}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 border-t border-[#d8ded5] pt-5">
          <p className="px-3 text-xs font-medium uppercase text-[#758079]">
            Coming next
          </p>
          <div className="mt-2 space-y-1">
            {secondaryItems.map((item) => (
              <div
                className="flex h-9 items-center gap-3 rounded-md px-3 text-sm text-[#758079]"
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
