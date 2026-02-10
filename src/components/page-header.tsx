'use client';
import { usePathname } from 'next/navigation';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

const titles: Record<string, string> = {
  '/dashboard': '대시보드',
  '/dashboard/directory': '회원 명부',
  '/dashboard/gallery': '추억 갤러리',
  '/dashboard/rules': '우리의 회칙',
  '/dashboard/messages': '영감을 주는 메시지',
  '/dashboard/ai-summary': 'AI 요약 도구',
  '/dashboard/admin': '관리자 모드',
};

function getTitle(pathname: string): string {
    if (pathname.startsWith('/dashboard/members/')) {
        return '회원 프로필';
    }
    return titles[pathname] || '우정 연대기';
}


export function PageHeader() {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const { isMobile } = useSidebar();
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <SidebarTrigger className="md:hidden" />
      <h1 className="text-xl font-bold tracking-tight font-headline">{title}</h1>
    </header>
  );
}
