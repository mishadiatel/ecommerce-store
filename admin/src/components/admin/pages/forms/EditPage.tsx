'use client';

import { Page } from '@/types/pages';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import InputGroup from '@/components/admin/ui/inputGroup';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/admin/shadcnuiComponents/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import GroupSelect from '@/components/admin/ui/selectGroup';
import { LANGUAGES_LIST } from '@/variables/languages';
import { updatePage } from '@/services/pages';
import { toast } from 'react-toastify';
import { useRef } from 'react';
import CheckboxInput from '@/components/admin/ui/checkboxInput';

interface EditPageFormProps {
  page: Page;
  updatePageList: () => void;
}

export default function EditPageForm({ page, updatePageList }: EditPageFormProps) {
  const t = useTranslations('pagesControlPage');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');
  const tVal = useTranslations('validation');
  const closeRef = useRef<HTMLButtonElement>(null);
  const editPageFormSchema = z.object({
    slug: z.string({ error: tVal('required', { field: tFields('slug') }) }).min(1, { message: tVal('required', { field: tFields('slug') }) }),
    title: z.string().optional(),
    description: z.string().optional(),
    breadcrumbTitle: z.string().optional(),
    language: z.string({ error: tVal('required', { field: tFields('language') }) }).min(1, { message: tVal('required', { field: tFields('language') }) }),
    index: z.boolean(),
    follow: z.boolean(),
  });
  type EditPageData = z.infer<typeof editPageFormSchema>

  const {
    control,
    handleSubmit,
  } = useForm<EditPageData>({
    resolver: zodResolver(editPageFormSchema),
    mode: 'onChange',
    defaultValues: {
      slug: page.slug || '',
      title: page.title || '',
      description: page.description || '',
      language: page.language || '',
      breadcrumbTitle: page.breadcrumbTitle || '',
      index: page.index || false,
      follow: page.follow || false
    },
  });

  const onSubmit = (data: EditPageData) => {
    updatePage(page._id, data)
      .then(data => {
        toast.success(t('toast.updated'));
        updatePageList();
      }).catch(error => {
      toast.error(t('toast.updateError'));
    }).finally(() => {
      closeRef.current?.click();
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('editPageTitle')}</DialogTitle>
      </DialogHeader>
      <form className={'flex flex-col gap-4'} onSubmit={handleSubmit(onSubmit)}>
        <InputGroup control={control} name={'slug'} label={tFields('pageSlug')} placeholder={tFields('slug')} />
        <InputGroup control={control} name={'title'} label={tFields('pageTitle')} placeholder={tFields('title')} />
        <InputGroup control={control} name={'description'} label={tFields('pageDescription')} placeholder={tFields('description')} />
        <InputGroup control={control} name={'breadcrumbTitle'} label={tFields('breadcrumbTitle')} placeholder={tFields('breadcrumbTitle')} />
        <CheckboxInput control={control} name={'index'} label={tFields('index')} />
        <CheckboxInput control={control} name={'follow'} label={tFields('follow')} />
        <GroupSelect control={control} name={'language'} values={LANGUAGES_LIST} label={tFields('pageLanguage')}
                     placeholder={tFields('language')} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" ref={closeRef}>{tCommon('cancel')}</Button>
          </DialogClose>
          <Button type="submit">{tCommon('saveChanges')}</Button>
        </DialogFooter>
      </form>

    </>

  );
}
