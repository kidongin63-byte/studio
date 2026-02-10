'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

import { useUser, useFirestore, useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/data';

type CurrentUser = {
  user: User | null;
  profile: (UserProfile & { id: string }) | null;
  loading: boolean;
  isAdmin: boolean;
};

export function useCurrentUser(): CurrentUser {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, loading: profileLoading } =
    useDoc<UserProfile>(userProfileRef);

  const loading = authLoading || profileLoading;
  const isAdmin = profile?.isAdmin ?? false;

  return { user, profile, loading, isAdmin };
}
