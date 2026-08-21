import { useRef, useState } from 'react';
import { z } from 'zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/admin/shadcnuiComponents/dialog';
import InputGroup from '@/components/admin/ui/inputGroup';
import CheckboxInput from '@/components/admin/ui/checkboxInput';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import FileInput from '@/components/admin/ui/fileInput';
import { createProduct } from '@/services/product';
import GroupSelect from '@/components/admin/ui/selectGroup';
import VariantsEditor, {
  ProductVariantInput,
} from '@/components/admin/products/forms/VariantsEditor';

interface CreateProductFormProps {
  updateProductsList: () => void;
  categoriesList: Array<{ _id: string, text: string }>;
}

export default function CreateProductForm({ updateProductsList, categoriesList }: CreateProductFormProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');
  const tVal = useTranslations('validation');
  const closeRef = useRef<HTMLButtonElement>(null);
  const createProductFormSchema = z.object({
    categoryId: z.string({ error: tVal('required', { field: tFields('category') }) }).min(1, { message: tVal('required', { field: tFields('category') }) }),
    slug: z.string({ error: tVal('required', { field: tFields('slug') }) }).min(1, { message: tVal('required', { field: tFields('slug') }) }),
    cardImage: z.string({ error: tVal('required', { field: tFields('cardImage') }) }).min(1, { message: tVal('required', { field: tFields('cardImage') }) })
      .refine(
        (val) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(val.split('?')[0]),
        {
          message: tVal('invalidImageExtension'),
        },
      ),
    images: z
      .array(
        z
          .string()
          .min(1, { message: tVal('required', { field: tFields('image') }) })
          .refine(
            (val) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(val.split('?')[0]),
            { message: tVal('invalidImageFormat') },
          ),
      )
      .min(1, tVal('atLeastOneImage')),
    newPrice: z.number({ error: tVal('required', { field: tFields('newPrice') }) }).min(1),
    oldPrice: z.number().optional(),
    discountPercents: z.number().optional(),
    reviewsCount: z.number().optional(),

    isNew: z.boolean(),
    isLimited: z.boolean(),
    isOnSale: z.boolean(),
    isOnePlusOne: z.boolean(),

    isVisible: z.boolean(),
    order: z.number({ error: tVal('required', { field: tFields('order') }) }),
  });
  const [stock, setStock] = useState<number>(0);
  const [outOfStock, setOutOfStock] = useState<boolean>(false);
  const [variants, setVariants] = useState<ProductVariantInput[]>([]);
  type CreateProductData = z.infer<typeof createProductFormSchema>

  const {
    control,
    handleSubmit,
  } = useForm<CreateProductData>({
    resolver: zodResolver(createProductFormSchema),
    mode: 'onChange',
    defaultValues: {
      categoryId: '',
      slug: '',
      cardImage: '',
      images: [],
      newPrice: 0,
      isNew: false,
      isLimited: false,
      isOnSale: false,
      isOnePlusOne: false,
      order: 0,
      isVisible: true,
    },
  });

  const { fields, append, remove } = useFieldArray<CreateProductData>({
    control: control,
    name: 'images' as never,
  });


  const onSubmit = (data: CreateProductData) => {
    if (variants.length > 0 && variants.some((v) => !v.sku.trim())) {
      toast.error(t('toast.variantSkuRequired'));
      return;
    }
    createProduct({
      ...data,
      images: data.images.filter(Boolean),
      stock,
      outOfStock,
      variants,
    })
      .then(result => {
        toast.success(t('toast.created'));
        updateProductsList();
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
        <div className={'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
          <InputGroup control={control} name={'slug'} label={tFields('slug')} placeholder={tFields('slug')} />
          <FileInput
            control={control}
            name={'cardImage'}
            label={tFields('cardImage')}
            placeholder={tFields('cardImage')}
          />
          <div className="sm:col-span-2 flex flex-col gap-2 w-full">
            <label>{tFields('images')}</label>
            <div className={'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <FileInput
                    control={control}
                    name={`images.${index}`}
                    label={`${tFields('image')} ${index + 1}`}
                    placeholder={tFields('imageUrl')}
                  />

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                      className="w-full sm:w-auto"
                    >
                      {tCommon('remove')}
                    </Button>
                  )}
                </div>
              ))}
            </div>


            <Button
              type="button"
              variant="outline"
              onClick={() => append('')}
            >
              {t('addImage')}
            </Button>
          </div>
          {categoriesList && categoriesList.length > 0 && (
            <GroupSelect control={control} name={'categoryId'} label={tFields('category')} values={categoriesList}
                         placeholder={tFields('category')} />)}
          <InputGroup control={control} name={'newPrice'} label={tFields('newPrice')} placeholder={tFields('newPrice')} type={'number'} />
          <InputGroup control={control} name={'oldPrice'} label={tFields('oldPrice')} placeholder={tFields('oldPrice')} type={'number'} />
          <InputGroup control={control} name={'discountPercents'} label={tFields('discountPercents')}
                      placeholder={tFields('discountPercents')} type={'number'} />
          <InputGroup control={control} name={'reviewsCount'} label={tFields('reviewsCount')} placeholder={tFields('reviewsCount')}
                      type={'number'} />
          <InputGroup control={control} name={'order'} label={tFields('order')} placeholder={tFields('order')} type={'number'} />
          <CheckboxInput control={control} name={'isNew'} label={tFields('isNew')} />
          <CheckboxInput control={control} name={'isLimited'} label={tFields('isLimited')} />
          <CheckboxInput control={control} name={'isOnSale'} label={tFields('isOnSale')} />
          <CheckboxInput control={control} name={'isOnePlusOne'} label={tFields('isOnePlusOne')} />
          <CheckboxInput control={control} name={'isVisible'} label={tFields('isVisible')} />
        </div>

        <VariantsEditor
          stock={stock}
          onStockChange={setStock}
          outOfStock={outOfStock}
          onOutOfStockChange={setOutOfStock}
          variants={variants}
          onVariantsChange={setVariants}
        />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline" ref={closeRef} className="w-full sm:w-auto">{tCommon('cancel')}</Button>
          </DialogClose>
          <Button type="submit" className="w-full sm:w-auto">{t('createButton')}</Button>
        </DialogFooter>
      </form>
    </>
  );
}
