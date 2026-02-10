'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

import { useFirestore } from '@/firebase';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PlusCircle, Trash, Edit, Loader2 } from 'lucide-react';
import type { Rule } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const ruleSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
});

type RuleWithId = Rule & { firestoreId: string };

export default function AdminPage() {
  const { isAdmin, loading: userLoading } = useCurrentUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [rules, setRules] = useState<RuleWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<RuleWithId | null>(null);

  const form = useForm<z.infer<typeof ruleSchema>>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      toast({
        variant: 'destructive',
        title: '권한 없음',
        description: '관리자만 이 페이지에 접근할 수 있습니다.',
      });
      router.replace('/dashboard');
    }
  }, [isAdmin, userLoading, router, toast]);

  useEffect(() => {
    if (!firestore || !isAdmin) {
      setRules([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const rulesCollection = collection(firestore, 'rules');
    const unsubscribe = onSnapshot(
      rulesCollection,
      (snapshot) => {
        const rulesData = snapshot.docs.map(
          (doc) =>
            ({ ...(doc.data() as Rule), firestoreId: doc.id } as RuleWithId)
        );
        setRules(rulesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching rules:', error);
        toast({
          variant: 'destructive',
          title: '오류',
          description: '회칙 목록을 불러오는 데 실패했습니다.',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, toast, isAdmin]);

  useEffect(() => {
    if (editingRule) {
      form.reset({
        title: editingRule.title,
        content: editingRule.content,
      });
    } else {
      form.reset({
        title: '',
        content: '',
      });
    }
  }, [editingRule, form]);

  const onSubmit = (values: z.infer<typeof ruleSchema>) => {
    if (!firestore || !isAdmin) return;
    const rulesCollection = collection(firestore, 'rules');

    if (editingRule) {
      const ruleDoc = doc(firestore, 'rules', editingRule.firestoreId);
      updateDoc(ruleDoc, values)
        .then(() => {
          toast({ title: '성공', description: '회칙이 수정되었습니다.' });
          setEditingRule(null);
          form.reset();
        })
        .catch(() => {
          const permissionError = new FirestorePermissionError({
            path: ruleDoc.path,
            operation: 'update',
            requestResourceData: values,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      const newRule = {
        ...values,
        id: `rule-${Date.now()}`,
      };
      addDoc(rulesCollection, newRule)
        .then(() => {
          toast({ title: '성공', description: '새 회칙이 추가되었습니다.' });
          form.reset();
        })
        .catch(() => {
          const permissionError = new FirestorePermissionError({
            path: rulesCollection.path,
            operation: 'create',
            requestResourceData: newRule,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  const handleDelete = (firestoreId: string) => {
    if (!firestore || !isAdmin) return;
    if (window.confirm('정말 이 회칙을 삭제하시겠습니까?')) {
      const ruleDoc = doc(firestore, 'rules', firestoreId);
      deleteDoc(ruleDoc)
        .then(() => {
          toast({ title: '성공', description: '회칙이 삭제되었습니다.' });
        })
        .catch(() => {
          const permissionError = new FirestorePermissionError({
            path: ruleDoc.path,
            operation: 'delete',
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  if (userLoading || !isAdmin) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">관리자 모드</h1>
        <p className="text-muted-foreground">회칙을 관리합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingRule ? '회칙 수정' : '새 회칙 추가'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 제 1조: 명칭" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="회칙 내용을 입력하세요."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                {editingRule && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingRule(null)}
                  >
                    취소
                  </Button>
                )}
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  {editingRule ? '수정 완료' : '추가하기'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>현재 회칙 목록</CardTitle>
          <CardDescription>
            현재 적용중인 회칙 목록입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {rules.map((rule) => (
                <AccordionItem value={rule.id} key={rule.id}>
                  <div className="flex items-center justify-between">
                    <AccordionTrigger className="flex-1 text-lg font-semibold font-headline">
                      {rule.title}
                    </AccordionTrigger>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rule.firestoreId)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <AccordionContent className="text-base text-foreground/80 leading-relaxed">
                    {rule.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
