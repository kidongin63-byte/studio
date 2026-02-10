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
        <h1 className="text-3xl font-bold font-headline">Welcome to the Friendship Chronicle</h1>
        <p className="text-muted-foreground">Your digital space for connection and memories.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              cherished friendships and counting
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shared Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">
              words of wisdom and inspiration
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-primary/10 border-primary/20">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary"/>
              AI-Powered Anthology
            </CardTitle>
            <CardDescription>
              Discover common themes in our messages and create a beautiful anthology.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/ai-summary">
              <Button>
                <span>Try the AI Tool</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>A look at what's coming up next for our group.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBirthday && (
              <div className="flex items-center">
                <div className="font-semibold">{upcomingBirthday.name}'s Birthday</div>
                <div className="ml-auto text-sm text-muted-foreground">{new Date(upcomingBirthday.birthDate).toLocaleDateString('default', { month: 'long', day: 'numeric' })}</div>
              </div>
            )}
             {upcomingAnniversary && (
              <div className="flex items-center">
                <div className="font-semibold">{upcomingAnniversary.name}'s Wedding Anniversary</div>
                <div className="ml-auto text-sm text-muted-foreground">{new Date(upcomingAnniversary.anniversary).toLocaleDateString('default', { month: 'long', day: 'numeric' })}</div>
              </div>
            )}
            <div className="flex items-center">
                <div className="font-semibold">Quarterly Meeting</div>
                <div className="ml-auto text-sm text-muted-foreground">Next Month</div>
              </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latest Message</CardTitle>
            <CardDescription>A recent dose of inspiration from our members.</CardDescription>
          </CardHeader>
          <CardContent>
            <blockquote className="italic text-muted-foreground">
              "{messages[messages.length-1].content}"
            </blockquote>
             <p className="text-right font-medium mt-2">- {messages[messages.length-1].author}</p>
            <Link href="/dashboard/messages" className="mt-4 block">
              <Button variant="outline" size="sm">
                View All Messages <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
