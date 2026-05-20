'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input/Input';
import { PhoneInput } from '@/components/ui/phoneInput/PhoneInput';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { updateMe } from '@/services/auth';
import { toast } from 'react-toastify';
import { isValidPhoneNumber } from 'libphonenumber-js';
import axios from 'axios';

export default function ProfileForm() {
  const t = useTranslations();
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setAuth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = z.object({
    firstName: z
      .string()
      .trim()
      .min(1, {
        message: t('Form.requiredMessage', { fieldName: t('Account.firstName.label') }),
      }),
    lastName: z
      .string()
      .trim()
      .min(1, {
        message: t('Form.requiredMessage', { fieldName: t('Account.lastName.label') }),
      }),
    phoneNumber: z
      .string()
      .trim()
      .or(z.literal(''))
      .refine(val => val === '' || isValidPhoneNumber(val), {
        message: t('Form.validPhoneMessage'),
      }),
    email: z
      .string()
      .trim()
      .min(1, {
        message: t('Form.requiredMessage', { fieldName: t('Account.email.label') }),
      })
      .refine(val => z.string().email().safeParse(val).success, {
        message: t('Form.validEmailMessage', { fieldName: t('Account.email.label') }),
      }),
    birthDay: z.string().optional().or(z.literal('')),
  });

  type FormData = z.infer<typeof schema>;

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'all',
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      birthDay: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phoneNumber: user.phoneNumber ?? '',
        email: user.email ?? '',
        birthDay: user.birthDay
          ? user.birthDay.slice(0, 10) // assume ISO -> YYYY-MM-DD
          : '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const updated = await updateMe({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || undefined,
        email: data.email,
        birthDay: data.birthDay || undefined,
      });
      if (updated) {
        setUser(updated);
      }
      toast.success(t('Account.profileUpdateSuccess'));
    } catch (err) {
      let message = t('Account.profileUpdateError');
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Input
          control={control}
          name="firstName"
          label={t('Account.firstName.label')}
          placeholder={t('Account.firstName.placeholder')}
          autoComplete="given-name"
        />
        <Input
          control={control}
          name="lastName"
          label={t('Account.lastName.label')}
          placeholder={t('Account.lastName.placeholder')}
          autoComplete="family-name"
        />
        <PhoneInput
          control={control}
          name="phoneNumber"
          label={t('Account.phoneNumber.label')}
          placeholder={t('Account.phoneNumber.placeholder')}
        />
        <Input
          control={control}
          name="email"
          label={t('Account.email.label')}
          placeholder={t('Account.email.placeholder')}
          autoComplete="email"
          disabled
        />
        <Input
          control={control}
          name="birthDay"
          type="date"
          label={t('Account.birthDay.label')}
          placeholder={t('Account.birthDay.placeholder')}
        />
      </div>

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
          {isSubmitting ? t('Account.submittingText') : t('Account.saveButtonText')}
        </button>
      </div>
    </form>
  );
}
