'use client';

import { useState, useEffect, useActionState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { Comment } from '@/lib/types';
import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { addComment } from '@/app/actions';
import { UserAvatar } from './user-avatar';
import { Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const commentSchema = z.object({
  comment: z.string().min(1, '评论不能为空。'),
});

type CommentFormData = z.infer<typeof commentSchema>;

const initialState = {
  message: '',
  errors: null,
};

export function Comments({ incidentId }: { incidentId: string }) {
  const { user, userProfile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [formState, formAction] = useActionState(addComment, initialState);
  const [isPending, startTransition] = useTransition();
  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: '' },
  });

  useEffect(() => {
    const q = query(
      collection(db, 'incidents', incidentId, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData: Comment[] = [];
      querySnapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(commentsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [incidentId]);

  useEffect(() => {
    if (formState?.message === '评论已发布') {
      form.reset();
    }
  }, [formState, form]);

  const onSubmit = (data: CommentFormData) => {
    if (!user) return;
    startTransition(() => {
      const formData = new FormData();
      formData.append('incidentId', incidentId);
      formData.append('comment', data.comment);
      formData.append('userId', user.uid);
      formAction(formData);
    });
  };

  return (
    <section>
      <header className="mb-8">
        <h2 className="text-3xl font-headline font-bold flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-primary" />
          <span>讨论</span>
        </h2>
        <p className="text-muted-foreground mt-2">
          分享你对该事件的看法与见解。
        </p>
      </header>
      <div className="space-y-8">
        {user ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-4">
                      <UserAvatar user={userProfile} />
                      <div className="w-full">
                        <FormControl>
                          <Textarea
                            placeholder="参与讨论…"
                            {...field}
                            className="font-serif"
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  发表评论
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="text-center p-6 border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-lg">
              <Link href={`/login?redirect=/incident/${incidentId}`} className="text-primary font-semibold hover:underline">
                登录
              </Link>{' '}
              后参与讨论。
            </p>
          </div>
        )}

        <div className="space-y-8">
          {loading && <p>评论加载中...</p>}
          {!loading && comments.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              暂无评论，快来分享你的看法。
            </p>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <UserAvatar user={comment.user} />
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="font-semibold">{comment.user?.displayName}</p>
                  <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                    {new Date(comment.createdAt?.toDate()).toLocaleString('zh-CN')}
                  </p>
                </div>
                <p className="text-foreground/90 font-serif text-base">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
