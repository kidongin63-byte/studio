'use client';
import { usePathname } from 'next/navigation';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/directory': 'Digital Directory',
  '/dashboard/gallery': 'Memory Gallery',
  '/dashboard/rules': 'Our Rules',
  '/dashboard/messages': 'Inspirational Messages',
  '/dashboard/ai-summary': 'AI Summary Tool',
};

function getTitle(pathname: string): string {
    if (pathname.startsWith('/dashboard/members/')) {
        return 'Member Profile';
    }
    return titles[pathname] || 'Friendship Chronicle';
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
