'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  Query,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollection<T>(ref: Query<T> | CollectionReference<T> | null) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({ ...(doc.data() as T), id: doc.id })
        );
        setData(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        const permissionError = new FirestorePermissionError({
          // The 'path' property is available on CollectionReference, but not on Query.
          // For generic queries, more context may be needed for a precise error message.
          path: (ref as CollectionReference<T>).path || 'unknown collection path',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}
