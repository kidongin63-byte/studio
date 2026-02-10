'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpenCheck,
  BrainCircuit,
  Contact,
  Image as ImageIcon,
  LayoutDashboard,
  MessagesSquare,
  ShieldCheck,
  LogOut,
  LogIn,
} from 'lucide-react';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { useCurrentUser } from '@/hooks/use-current-user';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';

const menuItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/dashboard/directory', label: '회원 명부', icon: Contact },
  { href: '/dashboard/gallery', label: '갤러리', icon: ImageIcon },
  { href: '/dashboard/rules', label: '회칙', icon: BookOpenCheck },
  { href: '/dashboard/messages', label: '메시지', icon: MessagesSquare },
  { href: '/dashboard/ai-summary', label: 'AI 요약', icon: BrainCircuit },
  { href: '/dashboard/admin', label: '관리자', icon: ShieldCheck, admin: true },
];

export function MainNav() {
  const pathname = usePathname();
  const { user, isAdmin, loading } = useCurrentUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

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
          {menuItems.map((item) => {
            if (item.admin && !isAdmin) return null;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    pathname.startsWith(item.href) &&
                    (item.href === '/dashboard'
                      ? pathname === item.href
                      : true)
                  }
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {!loading &&
          (user ? (
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
              <LogOut className="mr-2" />
              로그아웃
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => router.push('/login')}
              className="w-full justify-start"
            >
              <LogIn className="mr-2" />
              로그인
            </Button>
          ))}
      </SidebarFooter>
    </>
  );
}
