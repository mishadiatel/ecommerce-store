'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input/Input';
import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import { forgotPassword } from '@/services/auth';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function ForgotPasswordForm() {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string>('');

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
  });

  type FormData = z.infer<typeof schema>;

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'all',
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await forgotPassword({ email: data.email });
      setSentEmail(data.email);
      setIsSent(true);
      toast.success(t('Account.forgotPassword.successMessage'));
    } catch (err) {
      let message = t('Account.forgotPassword.errorMessage');
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

  if (isSent) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <div className="text-base text-gray-90">
          {t.rich('Account.forgotPassword.sentMessage', {
            email: () => (
              <span className="font-semibold text-black">{sentEmail}</span>
            ),
          })}
        </div>
        <Link
          href="/account/login"
          className="button-main w-full text-center"
        >
          {t('Account.forgotPassword.backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="text-sm text-gray-90 text-center">
        {t('Account.forgotPassword.helperText')}
      </div>

      <Input
        control={control}
        name="email"
        label={t('Account.email.label')}
        placeholder={t('Account.email.placeholder')}
        autoComplete="email"
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
          : t('Account.forgotPassword.submitButton')}
      </button>

      <div className="text-sm text-center text-gray-90">
        <Link
          href="/account/login"
          className="text-primary-green font-semibold hover:underline"
        >
          {t('Account.forgotPassword.backToLogin')}
        </Link>
      </div>
    </form>
  );
}
