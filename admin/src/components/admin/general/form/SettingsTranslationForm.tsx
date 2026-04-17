import { GeneralSettingsTranslation } from '@/types/general';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createSettingsTranslations, updateSettingsTranslations } from '@/services/general';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/admin/shadcnuiComponents/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { useRef } from 'react';
import GroupSelect from '@/components/admin/ui/selectGroup';
import InputGroup from '@/components/admin/ui/inputGroup';
import { LANGUAGES_LIST } from '@/variables/languages';
import EditorInput from '@/components/admin/ui/editorInput';

interface SettingsTranslationFormProps {
  settingsTranslation?: GeneralSettingsTranslation;
  onSuccess?: () => void;
}

export default function SettingsTranslationForm ({settingsTranslation, onSuccess}: SettingsTranslationFormProps) {
  const t = useTranslations('general');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');
  const tVal = useTranslations('validation');
  const isEdit = Boolean(settingsTranslation);
  const closeRef = useRef<HTMLButtonElement>(null);
  const editSettingsTranslationSchema = z.object({
    language:z.string({ error: tVal('required', { field: tFields('language') }) }).min(1, { message: tVal('required', { field: tFields('language') }) }),
    schedule: z.string({ error: tVal('required', { field: tFields('schedule') }) }).min(1, { message: tVal('required', { field: tFields('schedule') }) }),
    payInfo: z.string().optional(),
    deliveryInfo: z.string().optional(),
  });
  type EditSettingsTranslationData = z.infer<typeof editSettingsTranslationSchema>
  const { handleSubmit, control } = useForm<EditSettingsTranslationData>({
    resolver: zodResolver(editSettingsTranslationSchema),
    mode: 'onChange',
    defaultValues: {
      language: settingsTranslation?.language || '',
      schedule: settingsTranslation?.schedule || '',
      payInfo: settingsTranslation?.payInfo || '',
      deliveryInfo: settingsTranslation?.deliveryInfo || '',
    },
  });

  const onSubmit = (data: EditSettingsTranslationData) => {
    const action = isEdit
      ? updateSettingsTranslations(settingsTranslation!._id, data)
      : createSettingsTranslations(data);

    action
      .then(() => {
        toast.success(isEdit ? t('toast.translationUpdated') : t('toast.translationCreated'));
        if(onSuccess) {
          onSuccess();
        }

      })
      .catch(() => {
        toast.error(t('toast.error'));
      })
      .finally(() => {
        if(!isEdit) {
          closeRef.current?.click();
        }

      });
  };

  return (
    <>
      {!isEdit && (
        <DialogHeader>
          <DialogTitle>{t('editBlock')}</DialogTitle>
        </DialogHeader>
      )}
      <form className={'flex flex-col gap-6'} onSubmit={handleSubmit(onSubmit)}>

        <GroupSelect
          control={control}
          name="language"
          label={tFields('language')}
          values={LANGUAGES_LIST}
          placeholder={tCommon('selectLanguage')}
          disabled={isEdit}
        />
        <InputGroup control={control} name={'schedule'} label={tFields('schedule')} placeholder={tFields('schedule')} />
        <EditorInput control={control} name={'payInfo'} label={tFields('payInfo')} placeholder={tFields('payInfo')} />
        <EditorInput control={control} name={'deliveryInfo'} label={tFields('deliveryInfo')} placeholder={tFields('deliveryInfo')} />


        {!isEdit ? (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className={'w-fit'} ref={closeRef}>
                {tCommon('cancel')}
              </Button>
            </DialogClose>
            <Button type="submit" className={'w-fit'}>{isEdit ? tCommon('saveChanges') : t('createTranslation')}</Button>
          </DialogFooter>
        ) : (
          <Button type="submit" className={'w-fit'}>{isEdit ? tCommon('saveChanges') : t('createTranslation')}</Button>
        )}

      </form>
    </>

  )
}
