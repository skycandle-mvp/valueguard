'use client';

import { useState, useActionState, useTransition, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { resolveLoginEmail, signUpWithPhone } from '@/app/actions';

const phoneRegex = /^\+?\d{6,15}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formSchema = z
  .object({
    mode: z.enum(['signup', 'signin']),
    account: z.string().optional(),
    phoneNumber: z.string().optional(),
    smsCode: z.string().optional(),
    email: z.string().optional(),
    displayName: z.string().optional(),
    password: z.string().min(6, { message: '密码至少需要 6 个字符。' }),
    agree: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'signup') {
      if (!data.phoneNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phoneNumber'],
          message: '请输入手机号。',
        });
      } else if (!phoneRegex.test(data.phoneNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phoneNumber'],
          message: '请输入正确的手机号（含国家区号）。',
        });
      }

      if (data.email && !emailRegex.test(data.email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: '请输入有效的邮箱地址。',
        });
      }

      if (!data.smsCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['smsCode'],
          message: '请输入短信验证码。',
        });
      }
    } else {
      if (!data.account) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['account'],
          message: '请输入邮箱或手机号。',
        });
      } else if (!phoneRegex.test(data.account) && !emailRegex.test(data.account)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['account'],
          message: '请输入有效的邮箱或手机号。',
        });
      }

      if (!data.agree) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['agree'],
          message: '请同意隐私政策。',
        });
      }
    }
  });

type FormData = z.infer<typeof formSchema>;

const loginInitialState = { message: '', errors: null };

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneIdToken, setPhoneIdToken] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const [signUpState, signUpAction] = useActionState(signUpWithPhone, loginInitialState);
  const [isSigningUp, startSignUpTransition] = useTransition();
  const [isSigningIn, startSignInTransition] = useTransition();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: 'signin',
      account: '',
      phoneNumber: '',
      smsCode: '',
      email: '',
      password: '',
      displayName: '',
      agree: false,
    },
  });

  useEffect(() => {
    if (signUpState.message === '注册成功，请登录。') {
        toast({ title: '成功', description: signUpState.message });
        setIsSignUp(false);
        form.reset();
        auth.signOut();
        setIsCodeSent(false);
        setIsPhoneVerified(false);
        setConfirmationResult(null);
        setPhoneIdToken('');
    } else if (signUpState.message && signUpState.message.startsWith('注册失败')) {
        toast({ title: '错误', description: signUpState.message, variant: 'destructive' });
    } else if (signUpState.message && signUpState.message.startsWith('手机号验证失败')) {
        toast({ title: '错误', description: signUpState.message, variant: 'destructive' });
    }
  }, [signUpState, toast, form]);

  useEffect(() => {
    form.setValue('mode', isSignUp ? 'signup' : 'signin');
    form.clearErrors();
    if (!isSignUp) {
      setIsCodeSent(false);
      setIsPhoneVerified(false);
      setConfirmationResult(null);
      setPhoneIdToken('');
    }
  }, [isSignUp, form]);

  useEffect(() => {
    if (!isSignUp) return;
    if (recaptchaRef.current) return;
    if (!auth) return;
    recaptchaRef.current = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      { size: 'invisible' }
    );
    recaptchaRef.current.render().catch(() => null);
  }, [isSignUp]);

  const handleSendCode = async () => {
    const phoneNumber = form.getValues('phoneNumber')?.trim();
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      form.setError('phoneNumber', { message: '请输入正确的手机号（含国家区号）。' });
      return;
    }

    if (!recaptchaRef.current) {
      toast({ title: '错误', description: '验证码初始化失败，请刷新重试。', variant: 'destructive' });
      return;
    }

    setIsSendingCode(true);
    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaRef.current);
      setConfirmationResult(result);
      setIsCodeSent(true);
      toast({ title: '成功', description: '验证码已发送。' });
    } catch (error: any) {
      toast({ title: '错误', description: error.message, variant: 'destructive' });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    const code = form.getValues('smsCode')?.trim();
    if (!code) {
      form.setError('smsCode', { message: '请输入短信验证码。' });
      return;
    }
    if (!confirmationResult) {
      toast({ title: '错误', description: '请先获取验证码。', variant: 'destructive' });
      return;
    }

    setIsVerifyingCode(true);
    try {
      const result = await confirmationResult.confirm(code);
      const token = await result.user.getIdToken();
      setPhoneIdToken(token);
      setIsPhoneVerified(true);
      toast({ title: '成功', description: '手机号验证成功。' });
    } catch (error: any) {
      toast({ title: '错误', description: error.message, variant: 'destructive' });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const onSubmit = (data: FormData) => {
    if (isSignUp) {
      if (!isPhoneVerified || !phoneIdToken) {
        form.setError('smsCode', { message: '请先完成短信验证。' });
        return;
      }
      startSignUpTransition(() => {
        const formData = new FormData();
        formData.append('phoneNumber', data.phoneNumber || '');
        formData.append('password', data.password);
        formData.append('email', data.email || '');
        formData.append('displayName', data.displayName || '');
        formData.append('idToken', phoneIdToken);
        signUpAction(formData);
      });
    } else {
      startSignInTransition(async () => {
        try {
          const account = data.account?.trim() || '';
          const { email, error } = await resolveLoginEmail(account);
          if (!email) {
            toast({ title: '错误', description: error || '账号无效', variant: 'destructive' });
            return;
          }
          await signInWithEmailAndPassword(auth, email, data.password);
          toast({ title: '成功', description: '登录成功。' });
          const redirect = searchParams.get('redirect');
          router.push(redirect || '/');
        } catch (error: any) {
          toast({ title: '错误', description: error.message, variant: 'destructive' });
        }
      });
    }
  };
  
  const isPending = isSigningIn || isSigningUp;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isSignUp ? '创建账号' : '欢迎回来'}</CardTitle>
        <CardDescription>
          {isSignUp
            ? '使用手机号完成注册，可选填邮箱和昵称。'
            : '登录后可提交事件并参与讨论。'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isSignUp && (
              <>
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>手机号</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：+8613812345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <FormField
                    control={form.control}
                    name="smsCode"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>短信验证码</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入验证码" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-7">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSendCode}
                      disabled={isSendingCode}
                    >
                      {isSendingCode ? '发送中...' : '发送验证码'}
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleVerifyCode}
                  disabled={isVerifyingCode || !isCodeSent}
                >
                  {isVerifyingCode ? '验证中...' : isPhoneVerified ? '已验证' : '验证手机号'}
                </Button>
                <div id="recaptcha-container" />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱（可选）</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>昵称（可选）</FormLabel>
                      <FormControl>
                        <Input placeholder="你的昵称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {!isSignUp && (
              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>账户</FormLabel>
                    <FormControl>
                      <Input placeholder="邮箱或手机号" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? '注册' : '登录'}
            </Button>
            {!isSignUp && (
              <FormField
                control={form.control}
                name="agree"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) => field.onChange(Boolean(value))}
                      />
                    </FormControl>
                    <div className="text-sm leading-5">
                      我已阅读并同意
                      <Link href="/privacy" className="text-primary hover:underline">
                        隐私政策
                      </Link>
                      。
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline">
            {isSignUp ? '已有账号？去登录' : '还没有账号？去注册'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
