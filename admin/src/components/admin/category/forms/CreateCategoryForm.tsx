import { useRef } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
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
  const closeRef = useRef<HTMLButtonElement>(null);
  const createCategoryFormSchema = z.object({
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
        toast.success('Successfully created page');
        updateCategoriesList()
      }).catch(error => {
      toast.error('Error while creating page, try again letter');
    }).finally(() => {
      closeRef.current?.click();
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create category</DialogTitle>
      </DialogHeader>
      <form className={'flex flex-col gap-4'} onSubmit={handleSubmit(onSubmit)}>
        <InputGroup control={control} name={'slug'} label={'slug'} placeholder={'slug'} />
        <FileInput control={control} name={'image'} label={'image'} placeholder={'image'} />
        <InputGroup control={control} name={'backgroundColor'} label={'backgroundColor'} placeholder={'backgroundColor'} />
        <InputGroup control={control} name={'order'} label={'order'} placeholder={'order'} type={'number'} />
        <CheckboxInput control={control} name={'isVisible'} label={'isVisible'} />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" ref={closeRef}>Cancel</Button>
          </DialogClose>
          <Button type="submit">Create category</Button>
        </DialogFooter>
      </form>

    </>

  );
}