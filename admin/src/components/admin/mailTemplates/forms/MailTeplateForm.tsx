import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/admin/shadcnuiComponents/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { useRef } from 'react';
import GroupSelect from '@/components/admin/ui/selectGroup';
import InputGroup from '@/components/admin/ui/inputGroup';
import { LANGUAGES_LIST } from '@/variables/languages';
import { MailTemplate } from '@/types/mailTemplate';
import { createMailTemplate, updateMailTemplate } from '@/services/mailTemplate';
import TextareaWithPreview from '@/components/admin/ui/textareaWithPreview';

interface MailTemplateFormProps {
  mailTemplate?: MailTemplate;
  onSuccess?: () => void;
}

export default function MailTemplateForm({ mailTemplate, onSuccess }: MailTemplateFormProps) {
  const t = useTranslations('mailTemplatesPage');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');
  const tVal = useTranslations('validation');
  const isEdit = Boolean(mailTemplate);
  const closeRef = useRef<HTMLButtonElement>(null);
  const editMailTemplateSchema = z.object({
    language: z.string({ error: tVal('required', { field: tFields('language') }) }).min(1, { message: tVal('required', { field: tFields('language') }) }),
    slug: z.string({ error: tVal('required', { field: tFields('slug') }) }).min(1, { message: tVal('required', { field: tFields('slug') }) }),
    subject: z.string({ error: tVal('required', { field: tFields('subject') }) }).min(1, { message: tVal('required', { field: tFields('subject') }) }),
    html: z.string({ error: tVal('required', { field: tFields('html') }) }).min(1, { message: tVal('required', { field: tFields('html') }) }),
  });
  type EditMailTemplateData = z.infer<typeof editMailTemplateSchema>
  const { handleSubmit, control } = useForm<EditMailTemplateData>({
    resolver: zodResolver(editMailTemplateSchema),
    mode: 'onChange',
    defaultValues: {
      language: mailTemplate?.language || '',
      slug: mailTemplate?.slug || '',
      subject: mailTemplate?.subject || '',
      html: mailTemplate?.html || '',

    },
  });

  const onSubmit = (data: EditMailTemplateData) => {
    const action = isEdit
      ? updateMailTemplate(mailTemplate!._id, data)
      : createMailTemplate(data);

    action
      .then(() => {
        toast.success(isEdit ? t('toast.updated') : t('toast.created'));
        if (onSuccess) {
          onSuccess();
        }

      })
      .catch(() => {
        toast.error(isEdit ? t('toast.updateError') : t('toast.createError'));
      })
      .finally(() => {
        closeRef.current?.click();
      });
  };

  return (
    <>

      <DialogHeader>
        <DialogTitle>{isEdit ? t('updateTitle') : t('createTitle')}</DialogTitle>
      </DialogHeader>
      <form className={'flex flex-col gap-6'} onSubmit={handleSubmit(onSubmit)}>

        <GroupSelect
          control={control}
          name="language"
          label={tFields('language')}
          values={LANGUAGES_LIST}
          placeholder={tCommon('selectLanguage')}
          disabled={false}
        />
        <InputGroup control={control} name={'slug'} label={tFields('slug')} placeholder={tFields('slug')} />
        <InputGroup control={control} name={'subject'} label={tFields('subject')} placeholder={tFields('subject')} />
        <TextareaWithPreview control={control} name={'html'} label={tFields('html')} placeholder={tFields('html')} />


        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline" className={'w-full sm:w-fit'} ref={closeRef}>
              {tCommon('cancel')}
            </Button>
          </DialogClose>
          <Button type="submit" className={'w-full sm:w-fit'}>{isEdit ? tCommon('saveChanges') : t('createButton')}</Button>
        </DialogFooter>
      </form>
    </>

  );
}
