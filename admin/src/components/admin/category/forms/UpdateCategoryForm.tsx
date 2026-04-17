import { useRef, useState } from 'react';
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
import { updateCategory } from '@/services/category';
import FileInput from '@/components/admin/ui/fileInput';
import { CategoryTranslation, FullCategoryWithTranslation } from '@/types/category';
import CategoryTranslationForm from '@/components/admin/category/forms/CategoryTranslationForm';

interface UpdateCategoryFormProps {
  updateCategoriesList: () => void;
  category: FullCategoryWithTranslation
}

export default function UpdateCategoryForm({updateCategoriesList, category}: UpdateCategoryFormProps) {
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');
  const tVal = useTranslations('validation');
  // const closeRef = useRef<HTMLButtonElement>(null);
  const updateCategoryFormSchema = z.object({
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
  const [translations, setTranslations] = useState<Array<CategoryTranslation | null>>(category.translations || []);
  type CreateCategoryData = z.infer<typeof updateCategoryFormSchema>

  const {
    control,
    handleSubmit,
  } = useForm<CreateCategoryData>({
    resolver: zodResolver(updateCategoryFormSchema),
    mode: 'onChange',
    defaultValues: {
      slug: category.slug || '',
      image: category.image || '',
      backgroundColor: category.backgroundColor || '',
      order: category.order || 0,
      isVisible: Boolean(category.isVisible)
    },
  });

  const onSubmit = (data: CreateCategoryData) => {
    updateCategory(category._id, data)
      .then(data => {
        toast.success(t('toast.updated'));
        updateCategoriesList()
      }).catch(error => {
      toast.error(t('toast.updateError'));
    })
    //   .finally(() => {
    //   closeRef.current?.click();
    // });
  };

  const addCategoryTranslationForm = () => {
    const lastTranslationItem = translations.at(-1)
    if(Boolean(lastTranslationItem) || lastTranslationItem === undefined) {
      setTranslations(prev => [...prev, null])
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('updateTitle')}</DialogTitle>
      </DialogHeader>
      <form className={'flex flex-col gap-4'} onSubmit={handleSubmit(onSubmit)}>
        <InputGroup control={control} name={'slug'} label={tFields('slug')} placeholder={tFields('slug')} />
        <FileInput control={control} name={'image'} label={tFields('image')} placeholder={tFields('image')} />
        <InputGroup control={control} name={'backgroundColor'} label={tFields('backgroundColor')} placeholder={tFields('backgroundColor')} />
        <InputGroup control={control} name={'order'} label={tFields('order')} placeholder={tFields('order')} type={'number'} />
        <CheckboxInput control={control} name={'isVisible'} label={tFields('isVisible')} />
        <div className={'w-fit'}>
          <Button type="submit">{t('updateButton')}</Button>
        </div>
      </form>
      <div className={'flex flex-col gap-4'}>
        <div className={'w-fit'}><Button type={'button'} onClick={addCategoryTranslationForm}>{t('addTranslation')}</Button></div>
        <div className={'flex gap-4'}>
          {translations.map((translation) => (
            <CategoryTranslationForm
              key={translation ? translation._id : Math.random()}
              categoryTranslation={translation}
              categoryId={category._id}
              setTranslations={setTranslations}
              updateCategoriesList={updateCategoriesList}
            />
          ))}
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline"
                  // ref={closeRef}
          >{tCommon('cancel')}</Button>
        </DialogClose>
      </DialogFooter>
    </>

  );
}
