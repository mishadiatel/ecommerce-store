'use client';
import { useFieldArray, useFormContext } from 'react-hook-form';
import InputGroup from '@/components/admin/ui/inputGroup';
import { Button } from '@/components/admin/shadcnuiComponents/button';

export default function RunningLineForm() {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'blockData.items',
  });

  return (
    <div className="flex flex-col gap-4 border p-4 rounded-xl bg-muted">
      <h3 className="font-semibold text-lg">Running line items</h3>
      {fields.map((item, index) => (
        <div key={item.id} className="border p-4 rounded-md grid grid-cols-2 gap-3">
          <InputGroup control={control} name={`blockData.items.${index}._id`} label="id" />
          <InputGroup control={control} name={`blockData.items.${index}.text`} label="text" />

          <Button variant="destructive" className={'sm:col-span-2'} onClick={() => remove(index)}>Remove</Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            _id: `${Date.now()}_${Math.random()}`,
            text: '',
          })
        }
      >
        + Add item
      </Button>
    </div>
  );
}
