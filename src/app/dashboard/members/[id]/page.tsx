'use client';

import { useMemo } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { doc } from 'firebase/firestore';

import { useDoc, useFirestore } from '@/firebase';
import type { Member } from '@/lib/data';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Cake,
  Gift,
  Home,
  Utensils,
  Brush,
  Phone,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type MajorBirthday = {
  name: string;
  year: number;
};

function calculateMajorBirthdays(birthDate: string): MajorBirthday[] {
  if (!birthDate) return [];
  const birthYear = new Date(birthDate).getFullYear();
  if (isNaN(birthYear)) return [];

  return [
    { name: '환갑 (61세)', year: birthYear + 60 },
    { name: '칠순 (70세)', year: birthYear + 69 },
    { name: '팔순 (80세)', year: birthYear + 79 },
  ];
}

export default function MemberProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const firestore = useFirestore();
  const memberDoc = useMemo(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'users', params.id);
  }, [firestore, params.id]);

  const { data: member, loading } = useDoc<Member>(memberDoc);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!member) {
    notFound();
  }

  const majorBirthdays = calculateMajorBirthdays(member.birthDate);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <Image
          src={member.avatarUrl}
          alt={`${member.name}의 아바타`}
          width={128}
          height={128}
          className="rounded-full border-4 border-primary/20 shadow-lg"
          priority
        />
        <div>
          <h1 className="text-4xl font-bold font-headline">{member.name}</h1>
          <p className="text-lg text-muted-foreground">상세 회원 프로필</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>연락처 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">전화번호</p>
                <p className="text-base">{member.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">주소</p>
                <p className="text-base">{member.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>개인 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {member.birthDate && (
              <div className="flex items-center gap-3">
                <Cake className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">생일</p>
                  <p className="text-base">
                    {new Date(member.birthDate).toLocaleDateString('ko-KR')}{' '}
                    {member.isLunar && <Badge variant="outline">음력</Badge>}
                  </p>
                </div>
              </div>
            )}
            {member.anniversary && (
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">결혼기념일</p>
                  <p className="text-base">
                    {new Date(member.anniversary).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {majorBirthdays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>주요 기념일</CardTitle>
            <CardDescription>
              미래 계획을 위해 자동으로 계산된 주요 기념일입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {majorBirthdays.map((bday) => (
              <div
                key={bday.name}
                className="p-4 text-center bg-secondary/50 rounded-lg"
              >
                <p className="font-semibold">{bday.name}</p>
                <p className="text-2xl font-bold text-primary">{bday.year}년</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>선호사항</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Utensils className="h-5 w-5 mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">좋아하는 음식</p>
              <p className="text-base">{member.preferences.food}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Brush className="h-5 w-5 mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">취미</p>
              <p className="text-base">{member.preferences.hobbies}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
