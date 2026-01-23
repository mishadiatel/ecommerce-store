'use client';
import { useFormContext } from 'react-hook-form';
import InputGroup from '@/components/admin/ui/inputGroup';

export default function CategoriesSliderBlockForm() {
  const { control } = useFormContext();
  return (
    <div className="flex flex-col gap-4 border p-4 rounded-xl bg-muted">
      <InputGroup control={control} name={`blockData.title`} label="title" placeholder="Title" />
    </div>
  );
}
