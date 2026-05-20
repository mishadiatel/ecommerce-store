'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input/Input';
import { useState } from 'react';
import { updatePassword } from '@/services/auth';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function ChangePasswordForm() {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = z
    .object({
      currentPassword: z
        .string()
        .min(1, {
          message: t('Form.requiredMessage', {
            fieldName: t('Account.currentPassword.label'),
          }),
        }),
      newPassword: z
        .string()
        .min(8, { message: t('Account.passwordMinLengthMessage', { length: 8 }) }),
      confirmNewPassword: z.string().min(1, {
        message: t('Form.requiredMessage', {
          fieldName: t('Account.confirmNewPassword.label'),
        }),
      }),
    })
    .refine(data => data.newPassword === data.confirmNewPassword, {
      message: t('Account.passwordsDoNotMatch'),
      path: ['confirmNewPassword'],
    });

  type FormData = z.infer<typeof schema>;

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'all',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(t('Account.passwordUpdateSuccess'));
      reset();
    } catch (err) {
      let message = t('Account.passwordUpdateError');
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string | string[] } | undefined;
        const msg = data?.message;
        if (Array.isArray(msg)) message = msg.join(', ');
        else if (typeof msg === 'string') message = msg;
      }
      setServerError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <Input
        control={control}
        name="currentPassword"
        type="password"
        label={t('Account.currentPassword.label')}
        placeholder={t('Account.currentPassword.placeholder')}
        autoComplete="current-password"
      />
      <Input
        control={control}
        name="newPassword"
        type="password"
        label={t('Account.newPassword.label')}
        placeholder={t('Account.newPassword.placeholder')}
        autoComplete="new-password"
      />
      <Input
        control={control}
        name="confirmNewPassword"
        type="password"
        label={t('Account.confirmNewPassword.label')}
        placeholder={t('Account.confirmNewPassword.placeholder')}
        autoComplete="new-password"
      />

      {serverError && (
        <div className="error-message text-sm" role="alert">
          {serverError}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="button-main w-full sm:w-fit disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? t('Account.submittingText')
            : t('Account.updatePasswordButtonText')}
        </button>
      </div>
    </form>
  );
}
