'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';

const signupSchema = z.object({
  email: z.string().email({ message: '올바른 이메일을 입력해주세요.' }),
  password: z.string().min(6, { message: '비밀번호는 6자 이상이어야 합니다.' }),
  name: z.string().min(2, { message: '이름을 입력해주세요.' }),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  isLunar: z.boolean().default(false),
  anniversary: z.string().optional(),
  foodPreferences: z.string().optional(),
  hobbies: z.string().optional(),
});

export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
      address: '',
      birthDate: '',
      isLunar: false,
      anniversary: '',
      foodPreferences: '',
      hobbies: '',
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    if (!auth || !firestore) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      const userProfile = {
        name: values.name,
        email: values.email,
        phone: values.phone || '',
        address: values.address || '',
        birthDate: values.birthDate || '',
        isLunar: values.isLunar,
        anniversary: values.anniversary || '',
        preferences: {
          food: values.foodPreferences || '',
          hobbies: values.hobbies || '',
        },
        isAdmin: false,
        avatarUrl: `https://picsum.photos/seed/${user.uid}/200/200`,
      };

      await setDoc(doc(firestore, 'users', user.uid), userProfile);

      toast({
        title: '회원가입 성공',
        description: '로그인 페이지로 이동합니다.',
      });
      router.push('/login');
    } catch (error: any) {
      console.error('Signup Error:', error);

      let message = '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = '이미 사용 중인 이메일 주소입니다.';
          break;
        case 'auth/invalid-email':
          message = '유효하지 않은 이메일 주소 형식입니다.';
          break;
        case 'auth/weak-password':
          message = '비밀번호는 6자 이상이어야 합니다.';
          break;
        case 'auth/operation-not-allowed':
          message = '이메일/비밀번호 로그인이 활성화되지 않았습니다. Firebase 콘솔 설정을 확인하세요.';
          break;
        case 'auth/api-key-not-valid':
          message = 'Firebase API 키가 유효하지 않습니다. .env 파일을 확인하세요.';
          break;
        default:
          message = '회원가입에 실패했습니다. 입력 내용을 다시 확인해주세요.';
      }

      toast({
        variant: 'destructive',
        title: '회원가입 실패',
        description: message,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
         <CardHeader className="text-center">
            <div className="flex items-center gap-2 justify-center">
                <Logo className="size-10 text-primary" />
                <div className="flex flex-row items-baseline gap-2">
                    <h2 className="text-2xl font-semibold tracking-tighter font-headline">
                    우정 연대기
                    </h2>
                    <p className="text-sm text-muted-foreground">회원가입</p>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일 *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호 *</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름 *</FormLabel>
                    <FormControl>
                      <Input placeholder="홍길동" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전화번호</FormLabel>
                    <FormControl>
                      <Input placeholder="010-1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>주소</FormLabel>
                    <FormControl>
                      <Input placeholder="서울시 강남구" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>생년월일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isLunar"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 pb-3">
                       <FormLabel className="!mt-0">
                        음력
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="anniversary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>결혼기념일</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="foodPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>좋아하는 음식</FormLabel>
                    <FormControl>
                      <Input placeholder="한식, 중식" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="hobbies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>취미</FormLabel>
                    <FormControl>
                      <Input placeholder="등산, 독서" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                가입하기
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col items-center justify-center text-sm">
          <p className="text-muted-foreground">
            이미 회원이신가요?{' '}
            <Button variant="link" asChild className="p-0">
              <Link href="/login">로그인</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
