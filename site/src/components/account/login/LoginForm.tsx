'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input/Input';
import { Link, useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import {login, getMe} from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const setLoading = useAuthStore(s => s.setLoading);
  const logoutAuth = useAuthStore(s => s.logout);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = z.object({
    email: z
      .string()
      .trim()
      .min(1, {
        message: t('Form.requiredMessage', { fieldName: t('Account.email.label') }),
      })
      .refine(val => z.string().email().safeParse(val).success, {
        message: t('Form.validEmailMessage', { fieldName: t('Account.email.label') }),
      }),
    password: z
      .string()
      .min(1, {
        message: t('Form.requiredMessage', { fieldName: t('Account.password.label') }),
      }),
  });

  type FormData = z.infer<typeof schema>;

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'all',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setServerError(null);
    setLoading(true);
    try {
      await login(data);
      const user = await getMe();
      if (user) {
        setAuth(user);
      }
      toast.success(t('Account.loginSuccessMessage'));
      router.push('/account/profile');
    } catch (err) {
      let message = t('Account.loginErrorMessage');
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string | string[] } | undefined;
        const msg = data?.message;
        if (Array.isArray(msg)) message = msg.join(', ');
        else if (typeof msg === 'string') message = msg;
      }
      setServerError(message);
      logoutAuth()
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <Input
        control={control}
        name="email"
        label={t('Account.email.label')}
        placeholder={t('Account.email.placeholder')}
        autoComplete="email"
      />
      <Input
        control={control}
        name="password"
        type="password"
        label={t('Account.password.label')}
        placeholder={t('Account.password.placeholder')}
        autoComplete="current-password"
      />

      <div className="text-sm text-right -mt-2">
        <Link
          href="/account/forgotPassword"
          className="text-primary-green font-semibold hover:underline"
        >
          {t('Account.forgotPassword.link')}
        </Link>
      </div>

      {serverError && (
        <div className="error-message text-sm" role="alert">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="button-main w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('Account.submittingText') : t('Account.loginButtonText')}
      </button>

      <div className="text-sm text-center text-gray-90">
        {t('Account.noAccountQuestion')}{' '}
        <Link
          href="/account/signup"
          className="text-primary-green font-semibold hover:underline"
        >
          {t('Account.signupLinkText')}
        </Link>
      </div>
    </form>
  );
}
