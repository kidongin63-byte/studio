'use client';
import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error("Caught a Firestore permission error:", error);
      // In a real app, you might use a toast notification library
      // For this development overlay, we throw to make it highly visible.
      // The Next.js dev overlay will catch this.
      if (process.env.NODE_ENV === 'development') {
        // throw error;
        toast({
          variant: 'destructive',
          title: 'Firestore 권한 오류',
          description: error.message,
        });

      } else {
        // In production, you might want to log this to a service
        console.error(error);
        toast({
          variant: 'destructive',
          title: '오류',
          description: '데이터를 가져오는 데 실패했습니다. 권한을 확인해주세요.',
        });
      }
    };

    errorEmitter.on('permission-error', handleError);
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
