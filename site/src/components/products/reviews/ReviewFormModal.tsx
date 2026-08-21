'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input/Input';
import { Textarea } from '@/components/ui/textarea/Textarea';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    rating: number;
    comment: string;
  }) => void;
}

const RATING_LABELS = ['ratingBad', 'ratingSoSo', 'ratingOk', 'ratingGood', 'ratingExcellent'];

export default function ReviewFormModal({
  isOpen,
  onClose,
  productName,
  onSubmit,
}: Props) {
  const t = useTranslations('Reviews');
  const tForm = useTranslations('Form');
  const tAccount = useTranslations('Account');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingTouched, setRatingTouched] = useState(false);

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
    comment: z
      .string()
      .trim()
      .min(1, {
        message: tForm('requiredMessage', { fieldName: t('commentLabel') }),
      })
      .max(2000),
  });

  type FormData = z.infer<typeof schema>;

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { firstName: '', lastName: '', comment: '' },
  });

  // Скидаємо стан при повторному відкритті
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setRatingTouched(false);
      reset({ firstName: '', lastName: '', comment: '' });
    }
  }, [isOpen, reset]);

  const submit = (data: FormData) => {
    setRatingTouched(true);
    if (rating < 1) return;
    onSubmit({ ...data, rating });
  };

  if (!isOpen) return null;

  const displayRating = hoverRating || rating;

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="review-form-modal p-6 md:p-8 rounded-[16px] bg-white w-full max-w-[600px] my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="heading flex items-center justify-between relative mb-6">
          <div className="heading3 w-3/4">
            {t('modalTitle')} <span>{productName}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="button-main icon-button middle absolute right-0 top-0 rounded-full bg-gray flex items-center justify-center duration-300 cursor-pointer hover:bg-primary-green hover:text-white"
          >
            <i className="icon-x !text-[32px]"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="form-review relative w-full">
          <div className="mb-6 input-wrapper">
            <div className="heading5 mb-2">{t('yourRatingLabel')}</div>
            <div className="flex items-center justify-around md:gap-2">
              {RATING_LABELS.map((labelKey, idx) => {
                const value = idx + 1;
                const active = displayRating >= value;
                return (
                  <button
                    key={labelKey}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setRating(value);
                      setRatingTouched(true);
                    }}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="flex flex-col items-center h-[52px] min-w-[68px] cursor-pointer bg-transparent"
                  >
                    <i
                      className={` text-[28px] pointer-events-none text-primary-green ${
                        active ? 'icon-filled_star' : 'icon-heroicons-solid_star'
                      }`}
                    />
                    <span
                      className={`text-title mt-2 pointer-events-none ${idx === 2 ? '' : 'hidden sm:block'}`}
                    >
                      {t(labelKey)}
                    </span>
                  </button>
                );
              })}
            </div>
            {ratingTouched && rating < 1 && (
              <div className="error-message mt-2">{t('ratingRequired')}</div>
            )}
          </div>

          <div className="flex max-sm:flex-col gap-x-6">
            <div className="sm:w-1/2 mb-3">
              <Input
                control={control}
                name="firstName"
                label={tAccount('firstName.label')}
                placeholder={tAccount('firstName.placeholder')}
                autoComplete="given-name"
              />
            </div>
            <div className="sm:w-1/2 mb-3">
              <Input
                control={control}
                name="lastName"
                label={tAccount('lastName.label')}
                placeholder={tAccount('lastName.placeholder')}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="mb-3">
            <Textarea
              control={control}
              name="comment"
              label={t('commentLabel')}
              placeholder={t('commentPlaceholder')}
            />
          </div>

          <button
            type="submit"
            className="button-main w-full sm:w-auto mt-5 sm:mt-6 sm:block mx-auto"
          >
            {t('submitButton')}
          </button>
        </form>
      </div>
    </div>
  );
}
