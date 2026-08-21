'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Input } from '@/components/ui/input/Input';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { Link } from '@/i18n/navigation';
import { subscribeToNewsletter } from '@/services/subscribe';

export default function SubscribeForm() {
  const t = useTranslations();
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscribeFormSchema = z.object({
    email: z
      .string()
      .trim()
      .min(1, {
        message: t('Form.requiredMessage', {
          fieldName: t('Checkout.email.label'),
        }),
      })
      .refine((val) => z.string().email().safeParse(val).success, {
        message: t('Form.validEmailMessage', {
          fieldName: t('Checkout.email.label'),
        }),
      }),
    isAgree: z.boolean().refine((val) => val === true, {
      message: t('Form.agreeRequiredMessage'),
    }),
  });

  type SubscribeFormData = z.infer<typeof subscribeFormSchema>;

  const { control, handleSubmit, reset } = useForm<SubscribeFormData>({
    resolver: zodResolver(subscribeFormSchema),
    mode: 'onChange',
    defaultValues: { email: '', isAgree: false },
  });

  const onSubmit = async (data: SubscribeFormData) => {
    setIsSubmitting(true);
    try {
      await subscribeToNewsletter({
        email: data.email,
        source: 'footer',
        locale,
      });
      toast.success(t('Subscribe.successMessage'));
      reset();
    } catch (err) {
      let msg = t('Subscribe.errorMessage');
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as { message?: string | string[] } | undefined;
        const m = body?.message;
        if (Array.isArray(m)) msg = m.join(', ');
        else if (typeof m === 'string') msg = m;
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="w-full h-full relative flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        control={control}
        name="email"
        placeholder="example@email.com"
        className="w-full"
      />

      <Checkbox
        control={control}
        name="isAgree"
        label={t.rich('Subscribe.agreeText', {
          link: (chunks) => (
            <Link
              href="/privacy-policy"
              className="text-primary-green underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {chunks}
            </Link>
          ),
        })}
      />

      <button
        name="button"
        type="submit"
        disabled={isSubmitting}
        className="button-main w-full sm:inline-flex disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? t('Subscribe.submittingText')
          : t('Subscribe.buttonText')}
      </button>
    </form>
  );
}
