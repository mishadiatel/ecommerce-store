'use client';
import { useFieldArray, useFormContext } from 'react-hook-form';
import InputGroup from '@/components/admin/ui/inputGroup';
import { Button } from '@/components/admin/shadcnuiComponents/button';

export default function HeroBlockForm() {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'blockData.items',
  });

  return (
    <div className="flex flex-col gap-4 border p-4 rounded-xl bg-muted">
      <h3 className="font-semibold text-lg">Hero items</h3>

      {fields.map((item, index) => (
        <div key={item.id} className="border p-4 rounded-md grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputGroup control={control} name={`blockData.items.${index}.title`} label="Title" />
          <InputGroup control={control} name={`blockData.items.${index}.text`} label="Text" />
          <InputGroup control={control} name={`blockData.items.${index}.image`} label="Image URL" />
          <InputGroup control={control} name={`blockData.items.${index}.buttonText`} label="Button Text" />
          <InputGroup control={control} name={`blockData.items.${index}.buttonLink`} label="Button Link" />
          <InputGroup control={control} name={`blockData.items.${index}.order`} label="Order" type={'number'} />

          <Button variant="destructive" className={'sm:col-span-2'} onClick={() => remove(index)}>Remove</Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            title: '',
            text: '',
            image: '',
            buttonText: '',
            buttonLink: '',
            order: fields.length,
          })
        }
      >
        + Add item
      </Button>
    </div>
  );
}
