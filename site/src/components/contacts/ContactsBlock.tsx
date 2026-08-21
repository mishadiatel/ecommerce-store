'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { isValidPhoneNumber } from 'libphonenumber-js';
import axios from 'axios';
import { Input } from '@/components/ui/input/Input';
import { PhoneInput } from '@/components/ui/phoneInput/PhoneInput';
import { Textarea } from '@/components/ui/textarea/Textarea';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { Link } from '@/i18n/navigation';
import type { ContactsBlockData } from '@/services/contacts';
import { sendFeedback } from '@/services/contacts';

interface Props {
  data: ContactsBlockData;
}

export default function ContactsBlock({ data }: Props) {
  const t = useTranslations('Contacts');
  const tForm = useTranslations('Form');
  const tAccount = useTranslations('Account');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = z.object({
    firstName: z
      .string()
      .trim()
      .min(1, {
        message: tForm('requiredMessage', {
          fieldName: tAccount('firstName.label'),
        }),
      }),
    lastName: z
      .string()
      .trim()
      .min(1, {
        message: tForm('requiredMessage', {
          fieldName: tAccount('lastName.label'),
        }),
      }),
    phoneNumber: z
      .string()
      .trim()
      .min(1, {
        message: tForm('requiredMessage', {
          fieldName: tAccount('phoneNumber.label'),
        }),
      })
      .refine((val) => isValidPhoneNumber(val), {
        message: tForm('validPhoneMessage'),
      }),
    email: z
      .string()
      .trim()
      .min(1, {
        message: tForm('requiredMessage', {
          fieldName: tAccount('email.label'),
        }),
      })
      .refine((val) => z.string().email().safeParse(val).success, {
        message: tForm('validEmailMessage', {
          fieldName: tAccount('email.label'),
        }),
      }),
    message: z.string().optional(),
    isAgree: z.boolean().refine((val) => val === true, {
      message: t('form.agreeRequired'),
    }),
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
      message: '',
      isAgree: false,
    },
  });

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      await sendFeedback({
        type: 'contacts',
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        email: values.email,
        message: values.message,
        isAgree: values.isAgree,
      });
      toast.success(t('form.successMessage'));
      reset();
    } catch (err) {
      let msg = t('form.errorMessage');
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string | string[] } | undefined;
        const m = data?.message;
        if (Array.isArray(m)) msg = m.join(', ');
        else if (typeof m === 'string') msg = m;
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="store-list my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Ліва колонка — інфо */}
          <div className="bg-extra-light-gray rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col gap-6 lg:justify-between">
            {(data.salesTitle || data.phones.length > 0 || data.emails.length > 0) && (
              <div>
                {data.salesTitle && (
                  <div className="heading2 mb-4 lg:mb-6">{data.salesTitle}</div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
                  {data.phones.length > 0 && (
                    <div className="flex flex-col gap-2 lg:gap-3">
                      <span className="text-base uppercase text-primary-green font-semibold">
                        {t('callLabel')}
                      </span>
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        {data.phones.map((phone) => (
                          <a
                            key={phone}
                            href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                          >
                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.emails.length > 0 && (
                    <div className="flex flex-col gap-2 lg:gap-3">
                      <span className="text-base uppercase text-primary-green font-semibold">
                        {t('writeLabel')}
                      </span>
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        {data.emails.map((email) => (
                          <a key={email} href={`mailto:${email}`}>
                            {email}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(data.productionTitle || data.productionAddresses.length > 0) && (
              <div>
                {data.productionTitle && (
                  <div className="heading2 mb-4 lg:mb-6">
                    {data.productionTitle}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  {data.productionAddresses.map((addr, idx) => (
                    <div key={idx} className="flex flex-col gap-2 lg:gap-3">
                      <div className="grid grid-cols-1">
                        {addr.city && <div>{addr.city}</div>}
                        {addr.postcode && <div>{addr.postcode}</div>}
                        {addr.address && (
                          <div className="whitespace-pre-line">
                            {addr.address}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(data.facebookUrl || data.instagramUrl) && (
              <div>
                {data.socialTitle && (
                  <div className="heading2 mb-4 lg:mb-6">
                    {data.socialTitle}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {data.facebookUrl && (
                    <a
                      href={data.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-2 items-center"
                    >
                      <i className="icon icon-facebook text-primary-green text-[40px]" />
                      <span className="text-base sm:text-lg font-semibold">
                        facebook
                      </span>
                    </a>
                  )}
                  {data.instagramUrl && (
                    <a
                      href={data.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-2 items-center"
                    >
                      <i className="icon icon-instagram text-primary-green text-[40px]" />
                      <span className="text-base sm:text-lg font-semibold">
                        instagram
                      </span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Права колонка — форма */}
          <div className="bg-extra-light-gray rounded-2xl sm:rounded-3xl p-6 sm:p-8">
            {data.formTitle && (
              <div className="heading2 text-center mb-6 sm:mb-8">
                {data.formTitle}
              </div>
            )}

            <form
              className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Input
                control={control}
                name="firstName"
                label={tAccount('firstName.label')}
                placeholder={tAccount('firstName.placeholder')}
                autoComplete="given-name"
              />
              <Input
                control={control}
                name="lastName"
                label={tAccount('lastName.label')}
                placeholder={tAccount('lastName.placeholder')}
                autoComplete="family-name"
              />

              <PhoneInput
                control={control}
                name="phoneNumber"
                label={tAccount('phoneNumber.label')}
                placeholder={tAccount('phoneNumber.placeholder')}
              />

              <Input
                control={control}
                name="email"
                label={tAccount('email.label')}
                placeholder={tAccount('email.placeholder')}
                autoComplete="email"
              />

              <div className="sm:col-span-2">
                <Textarea
                  control={control}
                  name="message"
                  label={t('form.messageLabel')}
                  placeholder={t('form.messagePlaceholder')}
                />
              </div>

              <div className="sm:col-span-2">
                <Checkbox
                  control={control}
                  name="isAgree"
                  label={
                    <>
                      {t('form.agreePrefix')}{' '}
                      <Link
                        href="/privacy-policy"
                        target="_blank"
                        className="text-green-dark"
                      >
                        {t('form.agreeLink')}
                      </Link>
                    </>
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="button-main mx-auto w-full sm:w-fit flex sm:col-span-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? t('form.submittingText')
                  : t('form.submitButton')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
