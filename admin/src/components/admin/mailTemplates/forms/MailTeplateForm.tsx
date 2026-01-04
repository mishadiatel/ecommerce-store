import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/admin/shadcnuiComponents/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { useRef } from 'react';
import GroupSelect from '@/components/admin/ui/selectGroup';
import InputGroup from '@/components/admin/ui/inputGroup';
import { LANGUAGES_LIST } from '@/variables/languages';
import { MailTemplate } from '@/types/mailTemplate';
import { createMailTemplate, updateMailTemplate } from '@/services/mailTemplate';
import EditorInput from '@/components/admin/ui/editorInput';

interface MailTemplateFormProps {
  mailTemplate?: MailTemplate;
  onSuccess?: () => void;
}

export default function MailTemplateForm({ mailTemplate, onSuccess }: MailTemplateFormProps) {
  const isEdit = Boolean(mailTemplate);
  const closeRef = useRef<HTMLButtonElement>(null);
  const editMailTemplateSchema = z.object({
    language: z.string({ error: 'language is required' }).min(1, { message: 'language is required' }),
    slug: z.string({ error: 'slug is required' }).min(1, { message: 'slug is required' }),
    subject: z.string({ error: 'subject is required' }).min(1, { message: 'subject is required' }),
    html: z.string({ error: 'html is required' }).min(1, { message: 'html is required' }),
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
        toast.success(isEdit ? 'Mail template updated' : 'Mail template created');
        if (onSuccess) {
          onSuccess();
        }

      })
      .catch(() => {
        toast.error('Error, try again later');
      })
      .finally(() => {
        closeRef.current?.click();
      });
  };

  return (
    <>

      <DialogHeader>
        <DialogTitle>{isEdit ? 'Update mail template' : 'Create mail template'}</DialogTitle>
      </DialogHeader>
      <form className={'flex flex-col gap-6'} onSubmit={handleSubmit(onSubmit)}>

        <GroupSelect
          control={control}
          name="language"
          label="language"
          values={LANGUAGES_LIST}
          placeholder="Select language"
          disabled={false}
        />
        <InputGroup control={control} name={'slug'} label={'slug'} placeholder={'slug'} />
        <InputGroup control={control} name={'subject'} label={'subject'} placeholder={'subject'} />
        <EditorInput control={control} name={'html'} label={'html'} placeholder={'html'} />


        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className={'w-fit'} ref={closeRef}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" className={'w-fit'}>{isEdit ? 'Save changes' : 'Create mail template'}</Button>
        </DialogFooter>
      </form>
    </>

  );
}