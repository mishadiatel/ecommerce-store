import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import InputGroup from '@/components/admin/ui/inputGroup';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import GroupSelect from '@/components/admin/ui/selectGroup';
import { LANGUAGES_LIST } from '@/variables/languages';
import { Dispatch, SetStateAction } from 'react';
import { ProductTranslation } from '@/types/product';
import { createProductTranslation, updateProductTranslation } from '@/services/product';
import EditorInput from '@/components/admin/ui/editorInput';

interface ProductTranslationFormProps {
  productTranslation: ProductTranslation | null,
  productId: string,
  setTranslations: Dispatch<SetStateAction<(ProductTranslation | null)[]>>;
  updateProductsList: () => void;
}

export default function ProductTranslationForm({productTranslation, productId, setTranslations, updateProductsList}: ProductTranslationFormProps) {
  const t = useTranslations('products');
  const tFields = useTranslations('fields');
  const tVal = useTranslations('validation');
  // const closeRef = useRef<HTMLButtonElement>(null);
  const isEditMode = Boolean(productTranslation);
  const productTranslationFormSchema = z.object({
    lang: z.string({ error: tVal('required', { field: tFields('lang') }) }).min(1, { message: tVal('required', { field: tFields('lang') }) }),
    title: z.string({ error: tVal('required', { field: tFields('title') }) }).min(1, { message: tVal('required', { field: tFields('title') }) }),
    shortDescription: z.string().optional(),
    longDescription: z.string().optional(),
    composition: z.string().optional(),
    expiration: z.string().optional(),
    nutritionalTable: z.string().optional(),

  });
  type ProductTranslationData = z.infer<typeof productTranslationFormSchema>

  const {
    control,
    handleSubmit,
  } = useForm<ProductTranslationData>({
    resolver: zodResolver(productTranslationFormSchema),
    mode: 'onChange',
    defaultValues: {
      lang: productTranslation?.lang || '',
      title: productTranslation?.title || '',
      shortDescription: productTranslation?.shortDescription || '',
      longDescription: productTranslation?.longDescription || '',
      composition: productTranslation?.composition || '',
      expiration: productTranslation?.expiration || '',
      nutritionalTable: productTranslation?.nutritionalTable || ''
    },
  });

  const onSubmit = (data: ProductTranslationData) => {
    const reqBody = {
      ...data,
      productId
    }


    const action = isEditMode ?
      updateProductTranslation(productTranslation!._id, reqBody) :
      createProductTranslation(reqBody);

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
              next[index] = response as ProductTranslation;
              return next;
            }

            return [...prev, response];
          }

          return prev.map((item) =>
            item && item._id === response._id ? response : item,
          );
        });
        updateProductsList();
      })
      .catch(error => {
        toast.error(isEditMode ? t('toast.translationUpdateError') : t('toast.translationCreateError'));
      })
  };

  return (
    <>
      <form className={'flex flex-col gap-4 flex-1'} onSubmit={handleSubmit(onSubmit)}>
        <GroupSelect control={control} name={'lang'} label={tFields('lang')} placeholder={tFields('lang')} values={LANGUAGES_LIST} disabled={isEditMode} />
        <InputGroup control={control} name={'title'} label={tFields('title')} placeholder={tFields('title')} />
        <InputGroup control={control} name={'expiration'} label={tFields('expiration')} placeholder={tFields('expiration')} />
        <EditorInput control={control} name={'shortDescription'} label={tFields('shortDescription')} placeholder={tFields('shortDescription')} />
        <EditorInput control={control} name={'longDescription'} label={tFields('longDescription')} placeholder={tFields('longDescription')} />
        <EditorInput control={control} name={'composition'} label={tFields('composition')} placeholder={tFields('composition')} />
        <EditorInput control={control} name={'nutritionalTable'} label={tFields('nutritionalTable')} placeholder={tFields('nutritionalTable')} />
        <div>
          <Button type="submit">{isEditMode ? t('updateTranslation') : t('createTranslation')}</Button>
        </div>
      </form>
    </>

  );
}
