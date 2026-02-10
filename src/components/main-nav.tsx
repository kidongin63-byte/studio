"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  BrainCircuit,
  Contact,
  Image as ImageIcon,
  LayoutDashboard,
  MessagesSquare,
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/dashboard/directory", label: "회원 명부", icon: Contact },
  { href: "/dashboard/gallery", label: "갤러리", icon: ImageIcon },
  { href: "/dashboard/rules", label: "회칙", icon: BookOpenCheck },
  { href: "/dashboard/messages", label: "메시지", icon: MessagesSquare },
  { href: "/dashboard/ai-summary", label: "AI 요약", icon: BrainCircuit },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-primary" />
          <div className="flex flex-col">
            <h2 className="text-base font-semibold tracking-tighter font-headline">
              우정
            </h2>
            <p className="text-sm text-muted-foreground -mt-1">연대기</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href === '/dashboard' ? pathname === item.href : true)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
