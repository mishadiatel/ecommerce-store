'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/admin/shadcnuiComponents/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { useRef } from 'react';
import { Controller } from 'react-hook-form';
import GroupSelect from '@/components/admin/ui/selectGroup';
import InputGroup from '@/components/admin/ui/inputGroup';
import { Checkbox } from '@/components/admin/shadcnuiComponents/checkbox';
import { LANGUAGES_LIST } from '@/variables/languages';
import { PopularQuery } from '@/types/popularQuery';
import { createPopularQuery, updatePopularQuery } from '@/services/popularQuery';

interface PopularQueryFormProps {
  item?: PopularQuery;
  onSuccess?: () => void;
}

export default function PopularQueryForm({
  item,
  onSuccess,
}: PopularQueryFormProps) {
  const t = useTranslations('popularQueriesPage');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');
  const tVal = useTranslations('validation');
  const isEdit = Boolean(item);
  const closeRef = useRef<HTMLButtonElement>(null);

  const schema = z.object({
    queryText: z
      .string({ error: tVal('required', { field: tFields('queryText') }) })
      .trim()
      .min(1, {
        message: tVal('required', { field: tFields('queryText') }),
      })
      .max(200),
    language: z
      .string({ error: tVal('required', { field: tFields('language') }) })
      .min(1, {
        message: tVal('required', { field: tFields('language') }),
      }),
    visible: z.boolean(),
  });

  type FormData = z.infer<typeof schema>;

  const { handleSubmit, control } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      queryText: item?.queryText ?? '',
      language: item?.language ?? 'ua',
      visible: item?.visible ?? true,
    },
  });

  const onSubmit = (data: FormData) => {
    const action = isEdit
      ? updatePopularQuery(item!._id, data)
      : createPopularQuery(data);

    action
      .then(() => {
        toast.success(isEdit ? t('toast.updated') : t('toast.created'));
        onSuccess?.();
      })
      .catch((err) => {
        const msg =
          (err?.response?.data?.message as string | undefined) ??
          (isEdit ? t('toast.updateError') : t('toast.createError'));
        toast.error(msg);
      })
      .finally(() => {
        closeRef.current?.click();
      });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEdit ? t('updateTitle') : t('createTitle')}
        </DialogTitle>
      </DialogHeader>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <InputGroup
          control={control}
          name="queryText"
          label={tFields('queryText')}
          placeholder={tFields('queryText')}
        />
        <GroupSelect
          control={control}
          name="language"
          label={tFields('language')}
          values={LANGUAGES_LIST}
          placeholder={tCommon('selectLanguage')}
          disabled={false}
        />
        <Controller
          control={control}
          name="visible"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id="popular-query-visible"
                checked={field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
              />
              <label
                htmlFor="popular-query-visible"
                className="text-sm cursor-pointer"
              >
                {tFields('visible')}
              </label>
            </div>
          )}
        />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="w-full sm:w-fit"
              ref={closeRef}
            >
              {tCommon('cancel')}
            </Button>
          </DialogClose>
          <Button type="submit" className="w-full sm:w-fit">
            {isEdit ? tCommon('saveChanges') : t('createButton')}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
