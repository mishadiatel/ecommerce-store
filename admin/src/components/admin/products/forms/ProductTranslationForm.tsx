import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
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
  // const closeRef = useRef<HTMLButtonElement>(null);
  const isEditMode = Boolean(productTranslation);
  const productTranslationFormSchema = z.object({
    lang: z.string({ error: 'lang is required' }).min(1, { message: 'lang is required' }),
    title: z.string({ error: 'title is required' }).min(1, { message: 'title is required' }),
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
          `Successfully ${isEditMode ? 'updated' : 'created'} category translation`,
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
        toast.error(`Error while ${isEditMode ? 'updating' : 'creating'} product translation, try again letter`);
      })
  };

  return (
    <>
      <form className={'flex flex-col gap-4 flex-1'} onSubmit={handleSubmit(onSubmit)}>
        <GroupSelect control={control} name={'lang'} label={'lang'} placeholder={'lang'} values={LANGUAGES_LIST} disabled={isEditMode} />
        <InputGroup control={control} name={'title'} label={'title'} placeholder={'title'} />
        <InputGroup control={control} name={'expiration'} label={'expiration'} placeholder={'expiration'} />
        <EditorInput control={control} name={'shortDescription'} label={'shortDescription'} placeholder={'shortDescription'} />
        <EditorInput control={control} name={'longDescription'} label={'longDescription'} placeholder={'longDescription'} />
        <EditorInput control={control} name={'composition'} label={'composition'} placeholder={'composition'} />
        <EditorInput control={control} name={'nutritionalTable'} label={'nutritionalTable'} placeholder={'nutritionalTable'} />
        <div>
          <Button type="submit">{isEditMode ? 'update translation' : 'crete translation'}</Button>
        </div>
      </form>
    </>

  );
}