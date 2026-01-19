'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { createBlock, updateBlock } from '@/services/blocks';
import CheckboxInput from '@/components/admin/ui/checkboxInput';
import InputGroup from '@/components/admin/ui/inputGroup';
import GroupSelect from '@/components/admin/ui/selectGroup';
import { BLOCKS_TYPES } from '@/variables/blocksTypes';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/admin/shadcnuiComponents/dialog';
import HeroBlockForm from '@/components/admin/blocks/forms/hero/AddHeroBlockForm';
import { DialogClose } from '@radix-ui/react-dialog';
import { toast } from 'react-toastify';
import NotFoundBlockForm from '@/components/admin/blocks/forms/notFound/NotFoundBlockForm';

interface BlockFormProps {
  initialData?: any;
  onSuccess: () => void;
}

export default function BlockForm({
                                    initialData,
                                    onSuccess,
                                  }: BlockFormProps) {
  const isEdit = Boolean(initialData);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [selectedType, setSelectedType] = useState<string | null>(
    initialData?.blockType ?? null,
  );

  const heroItemSchema = z.object({
    title: z.string().min(1),
    text: z.string().min(1),
    image: z.string().min(1)
      .refine(
        (val) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(val.split("?")[0]),
        {
          message: "Image name must end with a valid image extension",
        }
      ),
    buttonText: z.string().min(1),
    buttonLink: z.string().min(1),
    order: z.number(),
  });

  const heroBlockSchema = z.object({
    blockData: z.object({
      items: z.array(heroItemSchema).min(1),
    }),
  });

  const notFoundBlockSchema = z.object({
    blockData: z.object({
      text: z.string().min(1),
      buttonText: z.string().min(1),
      backgroundImage: z.string().min(1)
        .refine(
          (val) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(val.split("?")[0]),
          {
            message: "Image name must end with a valid image extension",
          }
        ),
    })
  })

  const baseBlockSchema = z.object({
    pages: z.string().min(1),
    languages: z.string().min(1),
    order: z.number(),
    blockType: z.string().min(1),
    visible: z.boolean(),
    blockData: z.object({}).passthrough(),
  });

  const blockSchemas: Record<string, z.ZodType<any>> = {
    hero: heroBlockSchema,
    ['not-found']: notFoundBlockSchema
  };

  const methods = useForm<any>({
    resolver: zodResolver(
      selectedType
        ? baseBlockSchema.merge(blockSchemas[selectedType])
        : baseBlockSchema,
    ),
    mode: 'onChange',
    defaultValues: {
        pages: initialData?.pages.join(',') || '',
        languages: initialData?.languages.join(',') || '',
        order: initialData?.order || 0,
        visible: initialData?.visible || true,
        blockType: initialData?.blockType || '',
        blockData: initialData?.blockType || {},
      },
  });

  const { handleSubmit, control, watch, reset } = methods;

  // Load block data on edit (including hero items)
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        pages: initialData.pages.join(', '),
        languages: initialData.languages.join(', '),
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data: any) => {
    const reqBody = {
      ...data,
      pages: data.pages.split(',').map((el: string) => el.trim()),
      languages: data.languages.split(',').map((el: string) => el.trim()),
      blockData: {
        ...data.blockData,
        ...(data.blockData.items
          ? {
            items: [...data.blockData.items].sort(
              (a, b) => Number(a.order) - Number(b.order),
            ),
          }
          : {}),
      },
    };

    const action = isEdit
      ? updateBlock(initialData._id, reqBody)
      : createBlock(reqBody);

    action
      .then(() => {
        toast.success(isEdit ? 'Block updated' : 'Block created');
        onSuccess();
      })
      .catch(() => {
        toast.error('Error, try again later');
      })
      .finally(() => {
        closeRef.current?.click();
      });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit block' : 'Add block'}</DialogTitle>
      </DialogHeader>

      <FormProvider {...methods}>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Select block type */}
          <GroupSelect
            control={control}
            name="blockType"
            label="Block type"
            values={BLOCKS_TYPES}
            placeholder="Select block type"
            disabled={isEdit}
            onSelectValueChange={(value) => setSelectedType(value)}
          />

          <InputGroup control={control} name="languages" label="Languages" />
          <InputGroup control={control} name="pages" label="Pages" />
          <InputGroup control={control} name="order" type="number" label="Order" />
          <CheckboxInput control={control} name="visible" label="Visible" />

          {selectedType === 'hero' && <HeroBlockForm />}
          {selectedType === 'not-found' && <NotFoundBlockForm />}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" ref={closeRef}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{isEdit ? 'Save changes' : 'Create block'}</Button>
          </DialogFooter>
        </form>
      </FormProvider>
    </>
  );
}
