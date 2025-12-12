import { GeneralSettingsTranslation } from '@/types/general';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createSettingsTranslations, updateSettingsTranslations } from '@/services/general';
import { toast } from 'react-toastify';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/admin/shadcnuiComponents/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { useRef } from 'react';
import GroupSelect from '@/components/admin/ui/selectGroup';
import InputGroup from '@/components/admin/ui/inputGroup';
import { LANGUAGES_LIST } from '@/variables/languages';

interface SettingsTranslationFormProps {
  settingsTranslation?: GeneralSettingsTranslation;
  onSuccess?: () => void;
}

export default function SettingsTranslationForm ({settingsTranslation, onSuccess}: SettingsTranslationFormProps) {
  const isEdit = Boolean(settingsTranslation);
  const closeRef = useRef<HTMLButtonElement>(null);
  const editSettingsTranslationSchema = z.object({
    language:z.string({ error: 'language is required' }).min(1, { message: 'language is required' }),
    schedule: z.string({ error: 'schedule is required' }).min(1, { message: 'schedule is required' }),
  });
  type EditSettingsTranslationData = z.infer<typeof editSettingsTranslationSchema>
  const { handleSubmit, control } = useForm<EditSettingsTranslationData>({
    resolver: zodResolver(editSettingsTranslationSchema),
    mode: 'onChange',
    defaultValues: {
      language: settingsTranslation?.language || '',
      schedule: settingsTranslation?.schedule || ''
    },
  });

  const onSubmit = (data: EditSettingsTranslationData) => {
    const action = isEdit
      ? updateSettingsTranslations(settingsTranslation._id, data)
      : createSettingsTranslations(data);

    action
      .then(() => {
        toast.success(isEdit ? 'Settings translation updated' : 'Settings translation created');
        if(onSuccess) {
          onSuccess();
        }

      })
      .catch(() => {
        toast.error('Error, try again later');
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
          <DialogTitle>Edit block</DialogTitle>
        </DialogHeader>
      )}
      <form className={'flex flex-col gap-6'} onSubmit={handleSubmit(onSubmit)}>

        <GroupSelect
          control={control}
          name="language"
          label="language"
          values={LANGUAGES_LIST}
          placeholder="Select language"
          disabled={isEdit}
        />
        <InputGroup control={control} name={'schedule'} label={'schedule'} placeholder={'schedule'} />

        {!isEdit ? (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className={'w-fit'} ref={closeRef}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className={'w-fit'}>{isEdit ? 'Save changes' : 'Create Translation'}</Button>
          </DialogFooter>
        ) : (
          <Button type="submit" className={'w-fit'}>{isEdit ? 'Save changes' : 'Create Translation'}</Button>
        )}

      </form>
    </>

  )
}