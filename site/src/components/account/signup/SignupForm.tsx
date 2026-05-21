'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input/Input';
import { PhoneInput } from '@/components/ui/phoneInput/PhoneInput';
import { Link, useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { signup } from '@/services/auth';
import { toast } from 'react-toastify';
import { isValidPhoneNumber } from 'libphonenumber-js';
import axios from 'axios';

export default function SignupForm() {
  const t = useTranslations();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = z
    .object({
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
        .min(1, {
          message: t('Form.requiredMessage', { fieldName: t('Account.phoneNumber.label') }),
        })
        .refine(val => isValidPhoneNumber(val), {
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
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        password: data.password,
      });
      toast.success(t('Account.signupSuccessMessage'));
      router.push(
        `/account/verifyEmail?email=${encodeURIComponent(data.email)}`,
      );
    } catch (err) {
      let message = t('Account.signupErrorMessage');
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
      </div>
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
      />
      <Input
        control={control}
        name="password"
        type="password"
        label={t('Account.password.label')}
        placeholder={t('Account.password.placeholder')}
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

        <div className={'w-fit mx-auto'}>
            <button
                type="submit"
                disabled={isSubmitting}
                className="button-main w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isSubmitting ? t('Account.submittingText') : t('Account.signupButtonText')}
            </button>
        </div>

      <div className="text-sm text-center text-gray-90">
        {t('Account.haveAccountQuestion')}{' '}
        <Link
          href="/account/login"
          className="text-primary-green font-semibold hover:underline"
        >
          {t('Account.loginLinkText')}
        </Link>
      </div>
    </form>
  );
}
