'use client';
import { useFieldArray, useFormContext } from 'react-hook-form';
import InputGroup from '@/components/admin/ui/inputGroup';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import FileInput from '@/components/admin/ui/fileInput';

export default function StickeCardsForm() {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'blockData.items',
  });

  return (
    <div className="flex flex-col gap-4 border p-4 rounded-xl bg-muted">
      <InputGroup control={control} name={`blockData.title`} label="title" />

      <h3 className="font-semibold text-lg">Items</h3>

      {fields.map((item, index) => (
        <div key={item.id} className="border p-4 rounded-md grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputGroup control={control} name={`blockData.items.${index}._id`} label="Id" />
          <InputGroup control={control} name={`blockData.items.${index}.title`} label="Title" />
          <InputGroup control={control} name={`blockData.items.${index}.text`} label="Text" />
          <FileInput control={control} name={`blockData.items.${index}.icon`} label={'Icon'} />
          <InputGroup control={control} name={`blockData.items.${index}.order`} label="Order" type={'number'} />
          <Button variant="destructive" className={'sm:col-span-2'} onClick={() => remove(index)}>Remove</Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            _id: `${Date.now()}_${Math.random()}`,
            title: '',
            text: '',
           icon: '',
            order: fields.length,
          })
        }
      >
        + Add item
      </Button>
    </div>
  );
}
