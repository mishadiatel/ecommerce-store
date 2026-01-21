'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import InputGroup from '@/components/admin/ui/inputGroup';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { FaqCategoryItems } from '@/components/admin/blocks/forms/faqComplex/FaqCategoryItems';

export default function FaqComplexForm() {
  const { control } = useFormContext();

  const {
    fields: categories,
    append: appendCategory,
    remove: removeCategory,
  } = useFieldArray({
    control,
    name: 'blockData.items',
  });

  return (
    <div className="flex flex-col gap-6 border p-4 rounded-xl bg-muted">
      <h3 className="text-lg font-semibold">FAQ Categories</h3>

      {categories.map((category, categoryIndex) => (
        <div
          key={category.id}
          className="border p-4 rounded-lg flex flex-col gap-4 bg-background"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputGroup
              control={control}
              name={`blockData.items.${categoryIndex}._id`}
              label="Category ID"
            />
            <InputGroup
              control={control}
              name={`blockData.items.${categoryIndex}.title`}
              label="Category title"
            />
          </div>

          {/* Items */}
          <FaqCategoryItems categoryIndex={categoryIndex} />

          <Button
            type="button"
            variant="destructive"
            onClick={() => removeCategory(categoryIndex)}
          >
            Remove category
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          appendCategory({
            _id: `${Date.now()}_${Math.random()}`,
            title: '',
            items: [],
          })
        }
      >
        + Add category
      </Button>
    </div>
  );
}
