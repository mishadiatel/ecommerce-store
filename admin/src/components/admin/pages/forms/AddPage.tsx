'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InputGroup from '@/components/admin/ui/inputGroup';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/admin/shadcnuiComponents/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import GroupSelect from '@/components/admin/ui/selectGroup';
import { LANGUAGES_LIST } from '@/variables/languages';
import { createPage } from '@/services/pages';
import { toast } from 'react-toastify';
import { useRef } from 'react';
import CheckboxInput from '@/components/admin/ui/checkboxInput';

interface AddPageFormProps {
  updatePagesList: () => void;
}

export default function AddPageForm({updatePagesList}: AddPageFormProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const editPageFormSchema = z.object({
    slug: z.string({ error: 'slug is required' }).min(1, { message: 'slug is required' }),
    title: z.string().optional(),
    description: z.string().optional(),
    breadcrumbTitle: z.string().optional(),
    language: z.string({ error: 'language is required' }).min(1, { message: 'language is required' }),
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
      slug: '',
      title: '',
      description: '',
      language: '',
      breadcrumbTitle: '',
      index: false,
      follow: false
    },
  });

  const onSubmit = (data: EditPageData) => {
    createPage(data)
      .then(data => {
        toast.success('Successfully created page');
        updatePagesList()
      }).catch(error => {
      toast.error('Error while creating page, try again letter');
    }).finally(() => {
      closeRef.current?.click();
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add page</DialogTitle>
      </DialogHeader>
      <form className={'flex flex-col gap-4'} onSubmit={handleSubmit(onSubmit)}>
        <InputGroup control={control} name={'slug'} label={'page slug'} placeholder={'slug'} />
        <InputGroup control={control} name={'title'} label={'page title'} placeholder={'title'} />
        <InputGroup control={control} name={'description'} label={'page description'} placeholder={'description'} />
        <InputGroup control={control} name={'breadcrumbTitle'} label={'breadcrumb title'} placeholder={'breadcrumb title'} />
        <CheckboxInput control={control} name={'index'} label={'index'} />
        <CheckboxInput control={control} name={'follow'} label={'follow'} />
        <GroupSelect control={control} name={'language'} values={LANGUAGES_LIST} label={'page language'}
                     placeholder={'language'} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" ref={closeRef}>Cancel</Button>
          </DialogClose>
          <Button type="submit">create page</Button>
        </DialogFooter>
      </form>

    </>

  );
}