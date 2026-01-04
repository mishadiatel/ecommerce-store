import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/admin/shadcnuiComponents/field';
import { useState } from 'react';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import IframePreview from '@/components/admin/ui/iframePreview';
import Editor, { EditorProvider } from 'react-simple-wysiwyg';

type EditorInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  placeholder?: string;
  label?: string;

};
export default function EditorInput<T extends FieldValues>({
                                                             control,
                                                             name,
                                                             placeholder,
                                                             label,

                                                           }: EditorInputProps<T>) {
  const [showPreview, setShowPreview] = useState(false);
  return (
    <EditorProvider>
      <FieldGroup>
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                {label}
              </FieldLabel>
              <Editor  {...field} placeholder={placeholder} />
              {/*<IframeEditor value={field.value} onChange={field.onChange} />*/}
              {/*<Input*/}
              {/*  {...field}*/}
              {/*  aria-invalid={fieldState.invalid}*/}
              {/*  placeholder={placeholder}*/}
              {/*  autoComplete="off"*/}
              {/*/>*/}
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
              <div className={'w-fit'}><Button type={'button'} variant={'outline'}
                         onClick={() => setShowPreview(prev => !prev)}>{showPreview ? 'Hide preview' : 'Show preview'}</Button></div>
              {showPreview && <IframePreview html={field.value || ''} />}
            </Field>
          )}
        />
      </FieldGroup>
    </EditorProvider>

  );
}
