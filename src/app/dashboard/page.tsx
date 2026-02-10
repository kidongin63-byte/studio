import Link from 'next/link';
import { members, messages } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const upcomingAnniversary = members.find(m => new Date(m.anniversary).getMonth() >= new Date().getMonth());
  const upcomingBirthday = members.find(m => new Date(m.birthDate).getMonth() >= new Date().getMonth());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">우정 연대기에 오신 것을 환영합니다</h1>
        <p className="text-muted-foreground">추억과 인연을 위한 디지털 공간입니다.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 회원 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              소중한 우정이 계속되고 있습니다
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">공유된 메시지</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">
              지혜와 영감의 말들
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-primary/10 border-primary/20">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary"/>
              AI 기반 앤솔로지
            </CardTitle>
            <CardDescription>
              메시지에서 공통 주제를 발견하고 아름다운 앤솔로지를 만들어보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/ai-summary">
              <Button>
                <span>AI 도구 사용해보기</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>다가오는 행사</CardTitle>
            <CardDescription>우리 그룹의 다음 행사를 살펴보세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBirthday && (
              <div className="flex items-center">
                <div className="font-semibold">{upcomingBirthday.name}님의 생일</div>
                <div className="ml-auto text-sm text-muted-foreground">{new Date(upcomingBirthday.birthDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</div>
              </div>
            )}
             {upcomingAnniversary && (
              <div className="flex items-center">
                <div className="font-semibold">{upcomingAnniversary.name}님의 결혼기념일</div>
                <div className="ml-auto text-sm text-muted-foreground">{new Date(upcomingAnniversary.anniversary).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</div>
              </div>
            )}
            <div className="flex items-center">
                <div className="font-semibold">분기별 모임</div>
                <div className="ml-auto text-sm text-muted-foreground">다음 달</div>
              </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>최신 메시지</CardTitle>
            <CardDescription>회원들의 최근 영감을 주는 메시지입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <blockquote className="italic text-muted-foreground">
              "{messages[messages.length-1].content}"
            </blockquote>
             <p className="text-right font-medium mt-2">- {messages[messages.length-1].author}</p>
            <Link href="/dashboard/messages" className="mt-4 block">
              <Button variant="outline" size="sm">
                모든 메시지 보기 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
