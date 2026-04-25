import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
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
  setTranslations: Dispatch<SetStateAction<(CategoryTranslation | null)[]>>;
  updateCategoriesList: () => void;
}

export default function CategoryTranslationForm({categoryTranslation, categoryId, setTranslations, updateCategoriesList}: CategoryTranslationFormProps) {
  const t = useTranslations('categories');
  const tFields = useTranslations('fields');
  const tVal = useTranslations('validation');
  // const closeRef = useRef<HTMLButtonElement>(null);
  const isEditMode = Boolean(categoryTranslation);
  const categoryTranslationFormSchema = z.object({
    lang: z.string({ error: tVal('required', { field: tFields('lang') }) }).min(1, { message: tVal('required', { field: tFields('lang') }) }),
    name: z.string({ error: tVal('required', { field: tFields('name') }) }).min(1, { message: tVal('required', { field: tFields('name') }) }),
    pageTitle: z.string({ error: tVal('required', { field: tFields('pageTitle') }) }).min(1, { message: tVal('required', { field: tFields('pageTitle') }) }),
    pageDescription: z.string({ error: tVal('required', { field: tFields('pageDescription') }) }).min(1, { message: tVal('required', { field: tFields('pageDescription') }) })
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
      pageTitle: categoryTranslation?.pageTitle || '',
      pageDescription: categoryTranslation?.pageDescription || ''
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
          isEditMode ? t('toast.translationUpdated') : t('toast.translationCreated'),
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
        updateCategoriesList();
      })
      .catch(error => {
        toast.error(isEditMode ? t('toast.translationUpdateError') : t('toast.translationCreateError'));
      })
  };

  return (
    <>
      <form className={'flex flex-col gap-4 flex-1'} onSubmit={handleSubmit(onSubmit)}>
        <GroupSelect control={control} name={'lang'} label={tFields('lang')} placeholder={tFields('lang')} values={LANGUAGES_LIST} disabled={isEditMode} />
        <InputGroup control={control} name={'name'} label={tFields('name')} placeholder={tFields('name')} />
        <InputGroup control={control} name={'pageTitle'} label={tFields('pageTitle')} placeholder={tFields('pageTitle')} />
        <InputGroup control={control} name={'pageDescription'} label={tFields('pageDescription')} placeholder={tFields('pageDescription')} />
        <div className="w-full sm:w-fit">
          <Button type="submit" className="w-full sm:w-auto">{isEditMode ? t('updateTranslation') : t('createTranslation')}</Button>
        </div>
      </form>
    </>

  );
}
