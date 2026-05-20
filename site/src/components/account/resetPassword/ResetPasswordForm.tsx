'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input/Input';
import { Link, useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { resetPassword } from '@/services/auth';
import { toast } from 'react-toastify';
import axios from 'axios';

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = z
    .object({
      password: z
        .string()
        .min(8, { message: t('Account.passwordMinLengthMessage', { length: 8 }) }),
      confirmPassword: z.string().min(1, {
        message: t('Form.requiredMessage', { fieldName: t('Account.confirmPassword.label') }),
      }),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('Account.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });

  type FormData = z.infer<typeof schema>;

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'all',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await resetPassword(token, { password: data.password });
      setIsDone(true);
      toast.success(t('Account.resetPassword.successMessage'));
      setTimeout(() => {
        router.replace('/account/login');
      }, 2000);
    } catch (err) {
      let message = t('Account.resetPassword.errorMessage');
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string | string[] } | undefined;
        const msg = data?.message;
        if (Array.isArray(msg)) message = msg.join(', ');
        else if (typeof msg === 'string') message = msg;
      }
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <div className="text-base text-gray-90">
          {t('Account.resetPassword.successMessage')}
        </div>
        <Link href="/account/login" className="button-main w-full text-center">
          {t('Account.forgotPassword.backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <Input
        control={control}
        name="password"
        type="password"
        label={t('Account.newPassword.label')}
        placeholder={t('Account.newPassword.placeholder')}
        autoComplete="new-password"
      />
      <Input
        control={control}
        name="confirmPassword"
        type="password"
        label={t('Account.confirmPassword.label')}
        placeholder={t('Account.confirmPassword.placeholder')}
        autoComplete="new-password"
      />

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
        {isSubmitting
          ? t('Account.submittingText')
          : t('Account.resetPassword.submitButton')}
      </button>
    </form>
  );
}
