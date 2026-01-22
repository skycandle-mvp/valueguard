'use client';

import { useActionState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { requestReview } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Edit } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  review: z.string().min(20, {
    message: '内容至少需要 20 个字符。',
  }),
});
type FormData = z.infer<typeof formSchema>;

const initialState = {
  message: '',
  errors: {},
};

export function RequestReviewForm({ incidentId }: { incidentId: string }) {
  const [formState, formAction] = useActionState(requestReview, initialState);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { review: '' },
  });

  useEffect(() => {
    if (formState?.message) {
      if (formState.errors) {
        toast({
          title: '错误',
          description: formState.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '成功',
          description: formState.message,
        });
        form.reset();
      }
    }
  }, [formState, toast, form]);

  const onSubmit = (data: FormData) => {
    startTransition(() => {
      const formData = new FormData();
      formData.append('incidentId', incidentId);
      formData.append('review', data.review);
      formAction(formData);
    });
  };

  return (
    <section>
       <header className="mb-8">
        <h2 className="text-3xl font-headline font-bold flex items-center gap-3">
          <Edit className="w-7 h-7 text-primary" />
          <span>提交修改或更正</span>
        </h2>
        <p className="text-muted-foreground mt-2">
          对该事件有新的线索或更正？在这里分享。你的提交将由团队审核。
        </p>
      </header>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="review"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">你的补充信息</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="补充背景、更正内容或来源…"
                    className="min-h-[120px] font-serif"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending}>
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            提交审核
          </Button>
        </form>
      </Form>
    </section>
  );
}
