import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/admin/shadcnuiComponents/field';
import { useRef, useState } from 'react';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import IframePreview from '@/components/admin/ui/iframePreview';
import ReactQuill from 'react-quill-new';
import type ReactQuillType from 'react-quill-new';


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
  const [htmlMode, setHtmlMode] = useState(false);
  const quillRef = useRef<ReactQuillType | null>(null);

  function toggleHtmlMode(value: string, onChange: (v: string) => void) {
    if (!htmlMode && quillRef.current) {
      // Save current editor HTML before switching
      const html = quillRef.current.getEditor().root.innerHTML;
      onChange(html);
    }
    setHtmlMode(prev => !prev);
  }

  return (
    // <EditorProvider>
    <FieldGroup>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>
              {label}
            </FieldLabel>
            {/*<Editor  {...field} placeholder={placeholder} />*/}
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => toggleHtmlMode(field.value, field.onChange)}
              >
                {htmlMode ? 'Visual' : 'HTML'}
              </Button>
            </div>

            <div>
              {/* Editor */}
              {htmlMode ? (
                <textarea
                  className="w-full min-h-[220px] border rounded-md p-3 font-mono text-sm"
                  value={field.value || ''}
                  placeholder={placeholder}
                  onChange={field.onChange}
                />
              ) : (
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={field.value || ''}
                  onChange={(content, _, __, editor) => {
                    const text = editor.getText().trim();
                    if (!text) {
                      field.onChange('');
                    } else {
                      field.onChange(content);
                    }
                  }}
                  placeholder={placeholder}
                />
              )}
            </div>

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
    // </EditorProvider>

  );
}
