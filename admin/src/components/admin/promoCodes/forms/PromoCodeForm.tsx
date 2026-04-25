'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/admin/shadcnuiComponents/dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';

import InputGroup from '@/components/admin/ui/inputGroup';
import CheckboxInput from '@/components/admin/ui/checkboxInput';
import GroupSelect from '@/components/admin/ui/selectGroup';

import {
  createAdminPromoCode,
  updateAdminPromoCode,
} from '@/services/promoCode';
import {
  PromoCode,
  PromoDiscountType,
  CreatePromoCodePayload,
  UpdatePromoCodePayload,
} from '@/types/promoCode';

interface PromoCodeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: PromoCode;
  onSuccess: () => void;
}

/**
 * Універсальна форма створення/редагування промокоду.
 * Якщо передано initialData — режим редагування; інакше — створення.
 */
export default function PromoCodeForm({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: PromoCodeFormProps) {
  const t = useTranslations('promoCodes');
  const tCommon = useTranslations('common');
  const isEdit = Boolean(initialData);
  const [submitting, setSubmitting] = useState(false);

  // Перетворюємо ISO-дату з сервера на значення для <input type="date">
  const toDateInputValue = (iso: string | null | undefined): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };

  const schema = z
    .object({
      code: z
        .string()
        .trim()
        .min(2, { message: t('validation.codeTooShort') }),
      discountType: z.enum([PromoDiscountType.PERCENT, PromoDiscountType.FIXED]),
      discountValue: z
        .number({ error: t('validation.discountValueRequired') })
        .min(0.01, { message: t('validation.discountValueMin') }),
      minOrderAmount: z
        .number({ error: t('validation.minOrderAmountMin') })
        .min(0, { message: t('validation.minOrderAmountMin') }),
      isUnlimited: z.boolean(),
      maxUses: z
        .number({ error: t('validation.maxUsesRequired') })
        .min(1, { message: t('validation.maxUsesMin') })
        .optional(),
      validFrom: z.string().optional(),
      validTo: z.string().optional(),
      isActive: z.boolean(),
      description: z.string().max(500).optional(),
    })
    .superRefine((data, ctx) => {
      // Якщо percent — обмежуємо 100
      if (
        data.discountType === PromoDiscountType.PERCENT &&
        data.discountValue > 100
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: t('validation.discountPercentMax'),
        });
      }
      // Якщо ліміт увімкнений — maxUses обов'язковий
      if (!data.isUnlimited && (!data.maxUses || data.maxUses < 1)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['maxUses'],
          message: t('validation.maxUsesRequired'),
        });
      }
      // validFrom <= validTo
      if (data.validFrom && data.validTo) {
        const from = new Date(data.validFrom);
        const to = new Date(data.validTo);
        if (from > to) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['validTo'],
            message: t('validation.validToBeforeFrom'),
          });
        }
      }
    });

  type FormData = z.infer<typeof schema>;

  const defaultValues: FormData = {
    code: initialData?.code ?? '',
    discountType:
      (initialData?.discountType as PromoDiscountType) ??
      PromoDiscountType.PERCENT,
    discountValue: initialData?.discountValue ?? 0,
    minOrderAmount: initialData?.minOrderAmount ?? 0,
    isUnlimited: initialData ? initialData.maxUses === null : true,
    maxUses: initialData?.maxUses ?? undefined,
    validFrom: toDateInputValue(initialData?.validFrom),
    validTo: toDateInputValue(initialData?.validTo),
    isActive: initialData?.isActive ?? true,
    description: initialData?.description ?? '',
  };

  const {
    control,
    handleSubmit,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues,
  });

  const isUnlimited = watch('isUnlimited');
  const lastInitRef = useRef(initialData?._id);

  // Якщо відкрили форму з новим initialData — ресетнемо
  if (open && initialData?._id !== lastInitRef.current) {
    lastInitRef.current = initialData?._id;
    reset(defaultValues);
  }

  const discountTypeValues = [
    { _id: PromoDiscountType.PERCENT, text: t('discountType.percent') },
    { _id: PromoDiscountType.FIXED, text: t('discountType.fixed') },
  ];

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    const payload: CreatePromoCodePayload = {
      code: data.code.trim().toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount,
      maxUses: data.isUnlimited ? null : (data.maxUses ?? null),
      validFrom: data.validFrom ? new Date(data.validFrom).toISOString() : null,
      validTo: data.validTo ? new Date(data.validTo).toISOString() : null,
      isActive: data.isActive,
      description: data.description ?? '',
    };

    try {
      if (isEdit && initialData) {
        const updatePayload: UpdatePromoCodePayload = payload;
        await updateAdminPromoCode(initialData._id, updatePayload);
        toast.success(t('toast.updated'));
      } else {
        await createAdminPromoCode(payload);
        toast.success(t('toast.created'));
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const anyErr = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const msg = anyErr?.response?.data?.message;
      toast.error(
        (Array.isArray(msg) ? msg.join(', ') : msg) ||
          (isEdit ? t('toast.updateError') : t('toast.createError')),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={'max-w-[600px] sm:max-w-[600px] max-h-screen overflow-y-auto'}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('editTitle') : t('createTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('editDescription') : t('createDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4'}>
          <InputGroup
            control={control}
            name={'code'}
            label={t('form.code')}
            placeholder={t('form.codePlaceholder')}
          />

          <div className={'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
            <GroupSelect
              control={control}
              name={'discountType'}
              label={t('form.discountType')}
              placeholder={t('form.discountType')}
              values={discountTypeValues}
            />

            <InputGroup
              control={control}
              name={'discountValue'}
              label={t('form.discountValue')}
              placeholder={t('form.discountValue')}
              type={'number'}
            />
          </div>

          <InputGroup
            control={control}
            name={'minOrderAmount'}
            label={t('form.minOrderAmount')}
            placeholder={t('form.minOrderAmountHint')}
            type={'number'}
          />

          <div className={'flex flex-col gap-2 rounded-md border border-border p-3'}>
            <CheckboxInput
              control={control}
              name={'isUnlimited'}
              label={t('form.isUnlimited')}
            />

            {!isUnlimited && (
              <InputGroup
                control={control}
                name={'maxUses'}
                label={t('form.maxUses')}
                placeholder={t('form.maxUses')}
                type={'number'}
              />
            )}
          </div>

          <div className={'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
            <InputGroup
              control={control}
              name={'validFrom'}
              label={t('form.validFrom')}
              placeholder={t('form.validFrom')}
              type={'date'}
            />
            <InputGroup
              control={control}
              name={'validTo'}
              label={t('form.validTo')}
              placeholder={t('form.validTo')}
              type={'date'}
            />
          </div>

          <InputGroup
            control={control}
            name={'description'}
            label={t('form.description')}
            placeholder={t('form.descriptionPlaceholder')}
          />

          <CheckboxInput
            control={control}
            name={'isActive'}
            label={t('form.isActive')}
          />

          <DialogFooter>
            <Button
              type={'button'}
              variant={'outline'}
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {tCommon('cancel')}
            </Button>
            <Button type={'submit'} disabled={submitting}>
              {submitting
                ? tCommon('saving')
                : isEdit
                  ? tCommon('save')
                  : tCommon('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
