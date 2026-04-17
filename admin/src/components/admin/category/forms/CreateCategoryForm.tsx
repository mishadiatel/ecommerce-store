import { useRef } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/admin/shadcnuiComponents/dialog';
import InputGroup from '@/components/admin/ui/inputGroup';
import CheckboxInput from '@/components/admin/ui/checkboxInput';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { createCategory } from '@/services/category';
import FileInput from '@/components/admin/ui/fileInput';

interface CreateCategoryFormProps {
  updateCategoriesList: () => void;
}

export default function CreateCategoryForm({updateCategoriesList}: CreateCategoryFormProps) {
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');
  const tVal = useTranslations('validation');
  const closeRef = useRef<HTMLButtonElement>(null);
  const createCategoryFormSchema = z.object({
    slug: z.string({ error: tVal('required', { field: tFields('slug') }) }).min(1, { message: tVal('required', { field: tFields('slug') }) }),
    image: z.string({ error: tVal('required', { field: tFields('image') }) }).min(1, { message: tVal('required', { field: tFields('image') }) })
      .refine(
        (val) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(val.split("?")[0]),
        {
          message: tVal('invalidImageExtension'),
        }
      ),
    backgroundColor: z.string({ error: tVal('required', { field: tFields('backgroundColor') }) }).min(1, { message: tVal('required', { field: tFields('backgroundColor') }) }),
    isVisible: z.boolean(),
    order: z.number({error: tVal('required', { field: tFields('order') })}),
  });
  type CreateCategoryData = z.infer<typeof createCategoryFormSchema>

  const {
    control,
    handleSubmit,
  } = useForm<CreateCategoryData>({
    resolver: zodResolver(createCategoryFormSchema),
    mode: 'onChange',
    defaultValues: {
      slug: '',
      image: '',
      backgroundColor: '',
      order: 0,
      isVisible: true
    },
  });

  const onSubmit = (data: CreateCategoryData) => {
    createCategory(data)
      .then(data => {
        toast.success(t('toast.created'));
        updateCategoriesList()
      }).catch(error => {
      toast.error(t('toast.createError'));
    }).finally(() => {
      closeRef.current?.click();
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('createTitle')}</DialogTitle>
      </DialogHeader>
      <form className={'flex flex-col gap-4'} onSubmit={handleSubmit(onSubmit)}>
        <InputGroup control={control} name={'slug'} label={tFields('slug')} placeholder={tFields('slug')} />
        <FileInput control={control} name={'image'} label={tFields('image')} placeholder={tFields('image')} />
        <InputGroup control={control} name={'backgroundColor'} label={tFields('backgroundColor')} placeholder={tFields('backgroundColor')} />
        <InputGroup control={control} name={'order'} label={tFields('order')} placeholder={tFields('order')} type={'number'} />
        <CheckboxInput control={control} name={'isVisible'} label={tFields('isVisible')} />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" ref={closeRef}>{tCommon('cancel')}</Button>
          </DialogClose>
          <Button type="submit">{t('createButton')}</Button>
        </DialogFooter>
      </form>

    </>

  );
}
