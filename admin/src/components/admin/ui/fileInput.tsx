'use client';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useState } from 'react';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/admin/shadcnuiComponents/field';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import { toast } from 'react-toastify';
import FilePreview from '@/components/admin/ui/filePreview';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
};

export default function FileInput<T extends FieldValues>({
                                                                control,
                                                                name,
                                                                label,
                                                                placeholder,
                                                              }: Props<T>) {
  const [uploading, setUploading] = useState(false);

  // File upload function
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();

      // must return URL string
      return data.fileName;
    } finally {
      setUploading(false);
    }
  };

  return (
    <FieldGroup>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            {label && <FieldLabel>{label}</FieldLabel>}

            {/* TEXT INPUT FOR MANUAL URL */}
            <Input
              {...field}
              placeholder={placeholder || 'Enter image URL…'}
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
              autoComplete="off"
            />

            {/* FILE UPLOAD INPUT */}
            <div className="flex items-center gap-3 mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  if (!e.target.files?.[0]) return;
                  const file = e.target.files[0];

                  try {
                    const fileName = await uploadFile(file);
                    field.onChange(fileName); // set returned url
                    toast.success('upload successfully')
                  } catch (err) {
                    console.error(err);
                    toast.error('Upload failed')
                  }
                }}
              />
              <FilePreview fileName={field.value} />

              {uploading && <span className="text-sm opacity-70">Uploading…</span>}
            </div>

            {/* ERROR */}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
