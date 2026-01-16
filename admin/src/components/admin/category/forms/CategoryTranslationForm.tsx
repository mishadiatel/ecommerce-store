import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import InputGroup from '@/components/admin/ui/inputGroup';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { createCategoryTranslation, updateCategoryTranslation } from '@/services/category';
import { CategoryTranslation } from '@/types/category';
import GroupSelect from '@/components/admin/ui/selectGroup';
import { LANGUAGES_LIST } from '@/variables/languages';
import { Dispatch, SetStateAction } from 'react';

interface CategoryTranslationFormProps {
  categoryTranslation: CategoryTranslation | null,
  categoryId: string,
  setTranslations: Dispatch<SetStateAction<(CategoryTranslation | null)[]>>
}

export default function CategoryTranslationForm({categoryTranslation, categoryId, setTranslations}: CategoryTranslationFormProps) {
  // const closeRef = useRef<HTMLButtonElement>(null);
  const isEditMode = Boolean(categoryTranslation);
  const categoryTranslationFormSchema = z.object({
    lang: z.string({ error: 'lang is required' }).min(1, { message: 'lang is required' }),
    name: z.string({ error: 'name is required' }).min(1, { message: 'name is required' }),
  });
  type CategoryTranslationData = z.infer<typeof categoryTranslationFormSchema>

  const {
    control,
    handleSubmit,
  } = useForm<CategoryTranslationData>({
    resolver: zodResolver(categoryTranslationFormSchema),
    mode: 'onChange',
    defaultValues: {
      lang: categoryTranslation?.lang || '',
      name: categoryTranslation?.name || '',
    },
  });

  const onSubmit = (data: CategoryTranslationData) => {
    const reqBody = {
      ...data,
      categoryId
    }

    const action = isEditMode ?
      updateCategoryTranslation(categoryTranslation!._id, reqBody) :
      createCategoryTranslation(reqBody);

    action
      .then((response) => {
        if(!response) {
          return;
        }
        toast.success(
          `Successfully ${isEditMode ? 'updated' : 'created'} category translation`,
        );
        setTranslations((prev) => {
          if (!prev) return prev;

          if (!isEditMode) {
            const index = prev.findIndex((item) => item === null);

            if (index !== -1) {
              const next = [...prev];
              next[index] = response as CategoryTranslation;
              return next;
            }

            return [...prev, response];
          }

          return prev.map((item) =>
            item && item._id === response._id ? response : item,
          );
        });
      })
      .catch(error => {
        toast.error(`Error while ${isEditMode ? 'updating' : 'creating'} category translation, try again letter`);
      })
  };

  return (
    <>
      <form className={'flex flex-col gap-4 flex-1'} onSubmit={handleSubmit(onSubmit)}>
        <GroupSelect control={control} name={'lang'} label={'lang'} placeholder={'lang'} values={LANGUAGES_LIST} disabled={isEditMode} />
        <InputGroup control={control} name={'name'} label={'name'} placeholder={'name'} />
        <div>
          <Button type="submit">{isEditMode ? 'update translation' : 'crete translation'}</Button>
        </div>
      </form>
    </>

  );
}