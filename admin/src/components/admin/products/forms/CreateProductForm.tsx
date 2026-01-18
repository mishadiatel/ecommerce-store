import { useRef } from 'react';
import { z } from 'zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/admin/shadcnuiComponents/dialog';
import InputGroup from '@/components/admin/ui/inputGroup';
import CheckboxInput from '@/components/admin/ui/checkboxInput';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import FileInput from '@/components/admin/ui/fileInput';
import { createProduct } from '@/services/product';
import GroupSelect from '@/components/admin/ui/selectGroup';

interface CreateProductFormProps {
  updateProductsList: () => void;
  categoriesList: Array<{ _id: string, text: string }>;
}

export default function CreateProductForm({ updateProductsList, categoriesList }: CreateProductFormProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const createProductFormSchema = z.object({
    categoryId: z.string({ error: 'categoryId is required' }).min(1, { message: 'categoryId is required' }),
    slug: z.string({ error: 'slug is required' }).min(1, { message: 'slug is required' }),
    cardImage: z.string({ error: 'cardImage is required' }).min(1, { message: 'cardImage is required' })
      .refine(
        (val) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(val.split('?')[0]),
        {
          message: 'Image name must end with a valid image extension',
        },
      ),
    images: z
      .array(
        z
          .string()
          .min(1, { message: 'Image is required' })
          .refine(
            (val) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(val.split('?')[0]),
            { message: 'Invalid image format' },
          ),
      )
      .min(1, 'At least one image is required'),
    newPrice: z.number({ error: 'newPrice is required' }).min(1),
    oldPrice: z.number().optional(),
    discountPercents: z.number().optional(),
    reviewsCount: z.number().optional(),

    isNew: z.boolean(),
    isLimited: z.boolean(),
    isOnSale: z.boolean(),
    isOnePlusOne: z.boolean(),

    isVisible: z.boolean(),
    order: z.number({ error: 'order is required' }),
  });
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
    console.log(data);
    createProduct({
      ...data,
      images: data.images.filter(Boolean)
    })
      .then(result => {
        toast.success('Successfully created product');
        updateProductsList();
      }).catch(error => {
      toast.error('Error while creating product, try again letter');
    }).finally(() => {
      closeRef.current?.click();
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create product</DialogTitle>
      </DialogHeader>
      <form className={'flex flex-col gap-4'} onSubmit={handleSubmit(onSubmit)}>
        <div className={'grid grid-cols-2 gap-4'}>
          <InputGroup control={control} name={'slug'} label={'slug'} placeholder={'slug'} />
          <FileInput
            control={control}
            name={'cardImage'}
            label={`cardImage`}
            placeholder="cardImage"
          />
          <div className="col-span-2 flex flex-col gap-2 w-full">
            <label>Images</label>
            <div className={'grid grid-cols-2 gap-4'}>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <FileInput
                    control={control}
                    name={`images.${index}`}
                    label={`Image ${index + 1}`}
                    placeholder="Image URL"
                  />

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                    >
                      Remove
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
              + Add image
            </Button>
          </div>
          {categoriesList && categoriesList.length > 0 && (
            <GroupSelect control={control} name={'categoryId'} label={'category'} values={categoriesList}
                         placeholder={'category'} />)}
          <InputGroup control={control} name={'newPrice'} label={'newPrice'} placeholder={'newPrice'} type={'number'} />
          <InputGroup control={control} name={'oldPrice'} label={'oldPrice'} placeholder={'oldPrice'} type={'number'} />
          <InputGroup control={control} name={'discountPercents'} label={'discountPercents'}
                      placeholder={'discountPercents'} type={'number'} />
          <InputGroup control={control} name={'reviewsCount'} label={'reviewsCount'} placeholder={'reviewsCount'}
                      type={'number'} />
          <InputGroup control={control} name={'order'} label={'order'} placeholder={'order'} type={'number'} />
          <CheckboxInput control={control} name={'isNew'} label={'isNew'} />
          <CheckboxInput control={control} name={'isLimited'} label={'isLimited'} />
          <CheckboxInput control={control} name={'isOnSale'} label={'isOnSale'} />
          <CheckboxInput control={control} name={'isOnePlusOne'} label={'isOnePlusOne'} />
          <CheckboxInput control={control} name={'isVisible'} label={'isVisible'} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" ref={closeRef}>Cancel</Button>
          </DialogClose>
          <Button type="submit">Create product</Button>
        </DialogFooter>
      </form>
    </>
  );
}