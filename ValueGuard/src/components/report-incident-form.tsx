'use client';

import { useEffect, useTransition, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { reportIncident } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock } from 'lucide-react';
import { CategoryIcons, CategoryLabels } from '@/components/icons';
import { useAuth } from './auth-provider';

const formSchema = z.object({
  companyName: z.string().min(2, {
    message: '公司名称至少需要 2 个字符。',
  }),
  title: z.string().min(10, {
    message: '标题至少需要 10 个字符。',
  }),
  description: z.string().min(50, {
    message: '内容至少需要 50 个字符。',
  }),
  categories: z.array(z.string()).min(1, {
    message: '请至少选择一个分类。',
  }),
});

type FormData = z.infer<typeof formSchema>;

const initialState = {
  message: '',
  errors: {},
};

const predefinedCategories = Object.keys(CategoryIcons);

export function ReportIncidentForm() {
  const { user } = useAuth();
  const [formState, formAction] = useActionState(reportIncident, initialState);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      title: '',
      description: '',
      categories: [],
    },
  });

  useEffect(() => {
    if (formState?.message) {
      if (
        formState.errors ||
        formState.message.startsWith('错误') ||
        formState.message.startsWith('事件提交失败')
      ) {
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

  const handleCategoryToggle = (category: string) => {
    const currentCategories = form.getValues('categories');
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];
    form.setValue('categories', newCategories, { shouldValidate: true });
  };

  const onSubmit = (data: FormData) => {
    if (!user) {
      toast({
        title: '认证错误',
        description: '请先登录后再提交事件。',
        variant: 'destructive',
      });
      return;
    }
    startTransition(() => {
      const formData = new FormData();
      formData.append('companyName', data.companyName);
      formData.append('title', data.title);
      formData.append('description', data.description);
      data.categories.forEach((cat) => formData.append('categories', cat));
      formData.append('userId', user.uid);
      formAction(formData);
    });
  };

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardContent className="p-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-md bg-secondary/50 mb-8 w-fit">
            <Lock className="h-4 w-4" /> 匿名模式已开启
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">事件标题</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="你的故事标题"
                      className="text-3xl font-headline font-bold resize-none border-0 p-0 focus-visible:ring-0 bg-transparent"
                      {...field}
                    />
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
                  <FormLabel className="sr-only">事件描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="安全地分享你的真实经历…"
                      className="min-h-[250px] text-lg bg-transparent border-0 focus-visible:ring-0 p-0 font-serif"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>公司名称</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：Innovate Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <FormDescription>选择一个或多个适用的分类。</FormDescription>
                  <FormControl>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {predefinedCategories.map((cat) => (
                        <Badge
                          key={cat}
                          variant={field.value.includes(cat) ? 'default' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => handleCategoryToggle(cat)}
                        >
                          {CategoryLabels[cat] || cat}
                        </Badge>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full" size="lg">
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              匿名提交
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
