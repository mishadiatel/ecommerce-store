'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import InputGroup from '@/components/admin/ui/inputGroup';
import { Button } from '@/components/admin/shadcnuiComponents/button';

interface Props {
  categoryIndex: number;
}

export function FaqCategoryItems({ categoryIndex }: Props) {
  const { control } = useFormContext();

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `blockData.items.${categoryIndex}.items`,
  });

  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-medium">Items</h4>

      {fields.map((item, itemIndex) => (
        <div
          key={item.id}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 border p-3 rounded-md"
        >
          <InputGroup
            control={control}
            name={`blockData.items.${categoryIndex}.items.${itemIndex}._id`}
            label="Item ID"
          />
          <InputGroup
            control={control}
            name={`blockData.items.${categoryIndex}.items.${itemIndex}.title`}
            label="Title"
          />
          <InputGroup
            control={control}
            name={`blockData.items.${categoryIndex}.items.${itemIndex}.text`}
            label="Text"
          />
          <InputGroup
            control={control}
            name={`blockData.items.${categoryIndex}.items.${itemIndex}.order`}
            label="Order"
            type="number"
          />

          <Button
            type="button"
            variant="destructive"
            className="sm:col-span-2"
            onClick={() => remove(itemIndex)}
          >
            Remove item
          </Button>
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
            order: fields.length,
          })
        }
      >
        + Add item
      </Button>
    </div>
  );
}
