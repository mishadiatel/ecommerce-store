import { useRef, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
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
  // const closeRef = useRef<HTMLButtonElement>(null);
  const updateCategoryFormSchema = z.object({
    slug: z.string({ error: 'slug is required' }).min(1, { message: 'slug is required' }),
    image: z.string({ error: 'image is required' }).min(1, { message: 'image is required' })
      .refine(
        (val) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(val.split("?")[0]),
        {
          message: "Image name must end with a valid image extension",
        }
      ),
    backgroundColor: z.string({ error: 'backgroundColor is required' }).min(1, { message: 'backgroundColor is required' }),
    isVisible: z.boolean(),
    order: z.number({error: 'order is required'}),
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
        toast.success('Successfully updated page');
        updateCategoriesList()
      }).catch(error => {
      toast.error('Error while updating page, try again letter');
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
        <DialogTitle>Update category</DialogTitle>
      </DialogHeader>
      <form className={'flex flex-col gap-4'} onSubmit={handleSubmit(onSubmit)}>
        <InputGroup control={control} name={'slug'} label={'slug'} placeholder={'slug'} />
        <FileInput control={control} name={'image'} label={'image'} placeholder={'image'} />
        <InputGroup control={control} name={'backgroundColor'} label={'backgroundColor'} placeholder={'backgroundColor'} />
        <InputGroup control={control} name={'order'} label={'order'} placeholder={'order'} type={'number'} />
        <CheckboxInput control={control} name={'isVisible'} label={'isVisible'} />
        <div className={'w-fit'}>
          <Button type="submit">Update category</Button>
        </div>
      </form>
      <div className={'flex flex-col gap-4'}>
        <div className={'w-fit'}><Button type={'button'} onClick={addCategoryTranslationForm}>Add translation</Button></div>
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
          >Cancel</Button>
        </DialogClose>
      </DialogFooter>
    </>

  );
}