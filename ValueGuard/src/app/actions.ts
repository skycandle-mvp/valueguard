'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { FieldValue } from 'firebase-admin/firestore';

const reportIncidentSchema = z.object({
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
  userId: z.string(),
});

const requestReviewSchema = z.object({
  incidentId: z.string(),
  review: z.string().min(20, {
    message: '内容至少需要 20 个字符。',
  }),
});

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2).optional(),
});

const phoneAuthSchema = z.object({
  phoneNumber: z.string().min(6),
  password: z.string().min(6),
  email: z
    .preprocess((value) => {
      if (typeof value === 'string' && value.trim() === '') {
        return undefined;
      }
      return value;
    }, z.string().email().optional()),
  displayName: z
    .preprocess((value) => {
      if (typeof value === 'string' && value.trim() === '') {
        return undefined;
      }
      return value;
    }, z.string().min(2).optional()),
  idToken: z.string().min(1),
});

const addCommentSchema = z.object({
  incidentId: z.string(),
  comment: z.string().min(1),
  userId: z.string(),
});

export async function reportIncident(prevState: any, formData: FormData) {
  const validatedFields = reportIncidentSchema.safeParse({
    companyName: formData.get('companyName'),
    title: formData.get('title'),
    description: formData.get('description'),
    categories: formData.getAll('categories'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '错误：请修正字段后重试。',
    };
  }

  const { userId, ...incidentData } = validatedFields.data;

  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('未找到用户');
    }
    const user = userDoc.data();

    const newIncidentRef = adminDb.collection('incidents').doc();
    await newIncidentRef.set({
      ...incidentData,
      id: newIncidentRef.id,
      date: FieldValue.serverTimestamp(),
      userId,
      user: {
        displayName: user?.displayName,
        photoURL: user?.photoURL,
        uid: user?.uid,
      },
    });
    console.log('New incident reported:', validatedFields.data);
    revalidatePath('/');
    revalidatePath(`/incident/${newIncidentRef.id}`);
    return { message: '事件提交成功！', errors: null };
  } catch (error) {
    console.error('Error reporting incident:', error);
    return {
      message: '事件提交失败，请稍后重试。',
      errors: null,
    };
  }
}

export async function requestReview(prevState: any, formData: FormData) {
  const validatedFields = requestReviewSchema.safeParse({
    incidentId: formData.get('incidentId'),
    review: formData.get('review'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '错误：请修正字段后重试。',
    };
  }

  console.log('New review request:', validatedFields.data);

  return { message: '已提交审核！', errors: null };
}

export async function signUpWithEmail(prevState: any, formData: FormData) {
  const validatedFields = authSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: '字段无效',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password, displayName } = validatedFields.data;

  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });

    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || `https://i.pravatar.cc/150?u=${userRecord.uid}`,
    });

    return { message: '注册成功，请登录。', errors: null };
  } catch (e: any) {
    return { message: `注册失败：${e.message}`, errors: null };
  }
}

function normalizePhoneNumber(input: string) {
  return input.replace(/[\s-]/g, '');
}

function buildLoginEmail(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, '');
  return `phone-${digits}@valueguard.local`;
}

export async function signUpWithPhone(prevState: any, formData: FormData) {
  const validatedFields = phoneAuthSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: '字段无效',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { phoneNumber, password, email, displayName, idToken } =
    validatedFields.data;

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded.phone_number) {
      return { message: '手机号验证失败，请重新验证。', errors: null };
    }

    const normalizedTokenPhone = normalizePhoneNumber(decoded.phone_number);
    const normalizedInputPhone = normalizePhoneNumber(phoneNumber);
    if (normalizedTokenPhone !== normalizedInputPhone) {
      return { message: '手机号验证失败，请重新验证。', errors: null };
    }

    const loginEmail = email || buildLoginEmail(normalizedInputPhone);
    const finalDisplayName =
      displayName || `用户${normalizedInputPhone.slice(-4)}`;

    const userRecord = await adminAuth.updateUser(decoded.uid, {
      phoneNumber: normalizedInputPhone,
      email: loginEmail,
      password,
      displayName: finalDisplayName,
    });

    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || '',
      phoneNumber: normalizedInputPhone,
      photoURL:
        userRecord.photoURL || `https://i.pravatar.cc/150?u=${userRecord.uid}`,
    });

    return { message: '注册成功，请登录。', errors: null };
  } catch (e: any) {
    return { message: `注册失败：${e.message}`, errors: null };
  }
}

export async function resolveLoginEmail(account: string) {
  const input = account.trim();
  if (!input) {
    return { email: null, error: '请输入邮箱或手机号。' };
  }

  if (input.includes('@')) {
    return { email: input, error: null };
  }

  const normalized = normalizePhoneNumber(input);
  const snapshot = await adminDb
    .collection('users')
    .where('phoneNumber', '==', normalized)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return { email: null, error: '未找到该手机号对应的账号。' };
  }

  const data = snapshot.docs[0].data();
  if (!data?.email) {
    return { email: null, error: '该账号缺少登录邮箱，请联系管理员。' };
  }

  return { email: data.email as string, error: null };
}

export async function addComment(prevState: any, formData: FormData) {
  const validatedFields = addCommentSchema.safeParse(Object.fromEntries(formData.entries()));

  if(!validatedFields.success) {
    return {
      message: '评论无效',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  
  const {incidentId, comment, userId} = validatedFields.data;

  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('未找到用户');
    }
    const user = userDoc.data();

    const newCommentRef = adminDb.collection('incidents').doc(incidentId).collection('comments').doc();
    await newCommentRef.set({
      id: newCommentRef.id,
      text: comment,
      userId,
      incidentId,
      createdAt: FieldValue.serverTimestamp(),
      user: {
        displayName: user?.displayName,
        photoURL: user?.photoURL,
        uid: user?.uid,
      }
    });

    revalidatePath(`/incident/${incidentId}`);
    return { message: '评论已发布', errors: null };
  } catch (e: any) {
    return { message: `发表评论失败：${e.message}`, errors: null };
  }
}
