'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { useFirestore } from '@/firebase';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const messageSchema = z.object({
  content: z.string().min(10, '메시지는 10자 이상이어야 합니다.'),
});

export default function NewMessagePage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { profile, loading: userLoading } = useCurrentUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = (values: z.infer<typeof messageSchema>) => {
    if (!firestore || !profile) return;

    const messagesCollection = collection(firestore, 'messages');
    const newMessage = {
      author: profile.name,
      content: values.content,
      createdAt: serverTimestamp(),
    };

    addDoc(messagesCollection, newMessage)
      .then(() => {
        toast({
          title: '성공!',
          description: '영감을 주는 메시지가 공유되었습니다.',
        });
        router.push('/dashboard/messages');
      })
      .catch(() => {
        const permissionError = new FirestorePermissionError({
            path: messagesCollection.path,
            operation: 'create',
            requestResourceData: newMessage,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };
  
  if (userLoading) {
      return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>새 메시지 작성</CardTitle>
          <CardDescription>
            다른 회원들과 지혜와 긍정의 말을 나누어보세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>메시지 내용</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="따뜻한 응원의 한마디를 남겨주세요..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  메시지 보내기
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
