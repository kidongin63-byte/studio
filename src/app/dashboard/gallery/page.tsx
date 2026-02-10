'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { useCollection, useFirestore, useStorage } from '@/firebase';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { GalleryItem } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  PlusCircle,
  ImagePlus,
  Trash2,
  Pencil,
  UploadCloud,
  File,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const galleryItemSchema = z.object({
  description: z.string().min(1, '설명을 입력해주세요.'),
  file: z.any().refine((files) => files?.length > 0, '파일을 선택해주세요.'),
});

const editSchema = z.object({
  description: z.string().min(1, '설명을 입력해주세요.'),
});

export default function GalleryPage() {
  const { user, profile, isAdmin } = useCurrentUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const galleryQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: galleryItems, loading } = useCollection<GalleryItem>(galleryQuery);

  const form = useForm<z.infer<typeof galleryItemSchema>>({
    resolver: zodResolver(galleryItemSchema),
    defaultValues: { description: '' },
  });

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
  });

  const handleUpload = (values: z.infer<typeof galleryItemSchema>) => {
    if (!storage || !firestore || !user || !profile) return;
    const file = values.file?.[0];
    if (!file) {
      toast({ variant: 'destructive', title: '파일 없음', description: '업로드할 파일을 선택해주세요.' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `gallery/${user.uid}/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        toast({
          variant: 'destructive',
          title: '업로드 실패',
          description: '파일 업로드 중 오류가 발생했습니다. 저장소 권한을 확인해주세요.',
        });
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const galleryCollection = collection(firestore, 'gallery');
        const newGalleryItemData = {
          url: downloadURL,
          storagePath: uploadTask.snapshot.ref.fullPath,
          contentType: file.type,
          description: values.description,
          uploaderId: user.uid,
          uploaderName: profile.name,
          createdAt: serverTimestamp(),
        };

        addDoc(galleryCollection, newGalleryItemData)
          .then(() => {
            toast({ title: '성공', description: '갤러리에 추가되었습니다.' });
            setUploadDialogOpen(false);
            form.reset();
            setFileName(null);
            if(fileInputRef.current) fileInputRef.current.value = '';
          })
          .catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: galleryCollection.path,
                operation: 'create',
                requestResourceData: newGalleryItemData,
            });
            errorEmitter.emit('permission-error', permissionError);
          })
          .finally(() => {
            setUploading(false);
          });
      }
    );
  };
  
  const handleEdit = (values: z.infer<typeof editSchema>) => {
    if (!firestore || !editingItem) return;
    
    const itemDoc = doc(firestore, 'gallery', editingItem.id);
    const updatedData = { description: values.description };

    updateDoc(itemDoc, updatedData)
    .then(() => {
        toast({ title: '성공', description: '설명이 수정되었습니다.' });
        setEditingItem(null);
    })
    .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: itemDoc.path,
          operation: 'update',
          requestResourceData: updatedData
        });
        errorEmitter.emit('permission-error', permissionError);
        setEditingItem(null);
    });
  };

  const handleDelete = () => {
    if (!firestore || !storage || !deletingItem) return;

    const itemDoc = doc(firestore, 'gallery', deletingItem.id);
    const itemRef = ref(storage, deletingItem.storagePath);

    deleteDoc(itemDoc)
      .then(() => {
        return deleteObject(itemRef);
      })
      .then(() => {
        toast({ title: '성공', description: '갤러리에서 삭제되었습니다.' });
      })
      .catch((error: any) => {
        console.error('Delete failed:', error);
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: itemDoc.path,
              operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            toast({
                variant: 'destructive',
                title: '삭제 실패',
                description: '삭제 중 오류가 발생했습니다. 권한을 확인해주세요.',
            });
        }
      })
      .finally(() => {
        setDeletingItem(null);
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">추억 갤러리</h1>
          <p className="text-muted-foreground">
            우리가 가장 좋아하는 순간과 여행 추천 모음입니다.
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> 사진/동영상 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>갤러리에 새 항목 추가</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpload)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { onChange } }) => (
                    <FormItem>
                      <FormLabel>파일</FormLabel>
                      <FormControl>
                        <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            {fileName ? (
                              <>
                                <File className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="font-medium text-foreground">{fileName}</p>
                                <label htmlFor="file-upload" className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80">
                                  다른 파일 선택
                                </label>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                  <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer bg-background rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring"
                                  >
                                    <span>파일 업로드</span>
                                  </label>
                                  <p className="pl-1">또는 파일을 드래그하세요</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  이미지 또는 비디오 파일
                                </p>
                              </>
                            )}
                            <input
                              id="file-upload"
                              ref={fileInputRef}
                              type="file"
                              className="sr-only"
                              onChange={(e) => {
                                const files = e.target.files;
                                onChange(files);
                                setFileName(files?.[0]?.name || null);
                              }}
                              accept="image/*,video/*"
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                     <FormItem>
                      <FormLabel>설명</FormLabel>
                      <FormControl>
                        <Textarea placeholder="사진 또는 비디오에 대한 설명을 입력하세요." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {uploading && <Progress value={uploadProgress} className="w-full" />}
                
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline">취소</Button></DialogClose>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                    추가하기
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : galleryItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group relative">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted">
                  {item.contentType.startsWith('image/') ? (
                    <Image
                      src={item.url}
                      alt={item.description}
                      width={600}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  ) : item.contentType.startsWith('video/') ? (
                    <video
                      src={item.url}
                      controls
                      className="object-cover w-full h-full"
                    />
                  ) : null}
                </div>
              </CardContent>
               <div className="p-4 bg-background/80 backdrop-blur-sm">
                  <p className="text-sm font-medium truncate">{item.description}</p>
                  <p className="text-xs text-muted-foreground">by {item.uploaderName}</p>
               </div>
              
              {(isAdmin || user?.uid === item.uploaderId) && (
                 <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="icon" onClick={() => { setEditingItem(item); editForm.reset({ description: item.description }); }}>
                       <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => setDeletingItem(item)}>
                       <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground rounded-lg border-2 border-dashed">
            <p className="text-lg font-semibold">갤러리가 비어있습니다.</p>
            <p className="mt-1">첫 번째 사진이나 동영상을 업로드하여 추억을 공유하세요!</p>
             <Button className="mt-4" onClick={() => setUploadDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> 사진/동영상 추가
            </Button>
        </div>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>설명 수정</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>설명</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>취소</Button>
                <Button type="submit">수정 완료</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>이 작업은 되돌릴 수 없습니다. 갤러리에서 이 항목이 영구적으로 삭제됩니다.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingItem(null)}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
