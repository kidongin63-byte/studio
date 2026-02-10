'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quote, Loader2, PlusCircle } from 'lucide-react';
import type { Message } from '@/lib/data';

export default function MessagesPage() {
  const firestore = useFirestore();

  const messagesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'messages'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: messages, loading } = useCollection<Message & { createdAt: any }>(
    messagesQuery
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">영감을 주는 메시지</h1>
          <p className="text-muted-foreground">
            회원들의 지혜와 따뜻한 말 한마디를 모았습니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/messages/new">
            <PlusCircle className="mr-2 h-4 w-4" /> 새 메시지 작성
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : messages && messages.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {messages?.map((message) => (
            <Card key={message.id} className="flex flex-col">
              <CardHeader>
                <Quote className="h-8 w-8 text-primary/30" />
              </CardHeader>
              <CardContent className="flex-grow">
                <blockquote className="text-lg font-medium leading-relaxed">
                  {message.content}
                </blockquote>
              </CardContent>
              <CardFooter>
                <p className="text-sm font-semibold text-muted-foreground">
                  - {message.author}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground rounded-lg border-2 border-dashed">
            <p className="text-lg font-semibold">아직 공유된 메시지가 없습니다.</p>
            <p className="mt-1">첫 메시지를 작성하여 지혜를 나눠보세요!</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/messages/new">
                <PlusCircle className="mr-2 h-4 w-4" /> 새 메시지 작성
              </Link>
            </Button>
        </div>
      )}
    </div>
  );
}
