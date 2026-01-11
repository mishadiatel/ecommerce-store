import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/admin/shadcnuiComponents/field';
import { useState } from 'react';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import IframePreview from '@/components/admin/ui/iframePreview';


type EditorInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  placeholder?: string;
  label?: string;

};

export default function TextareaWithPreview<T extends FieldValues>({
                                                             control,
                                                             name,
                                                             placeholder,
                                                             label,

                                                           }: EditorInputProps<T>) {
  const [showPreview, setShowPreview] = useState(false);


  return (
    <FieldGroup>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>
              {label}
            </FieldLabel>

            <div>

                <textarea
                  className="w-full min-h-[220px] border rounded-md p-3 font-mono text-sm"
                  value={field.value || ''}
                  placeholder={placeholder}
                  onChange={(e) => field.onChange(e.target.value)}
                />

            </div>
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
            <div className={'w-fit'}>
              <Button
                type={'button'}
                variant={'outline'}
                onClick={() => setShowPreview(prev => !prev)}>
                {showPreview ? 'Hide preview' : 'Show preview'}
              </Button></div>
            {showPreview && <IframePreview html={field.value || ''} />}
          </Field>
        )}
      />
    </FieldGroup>

  );
}
