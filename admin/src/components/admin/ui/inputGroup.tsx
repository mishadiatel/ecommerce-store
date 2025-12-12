import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/admin/shadcnuiComponents/field';
import { Input } from '@/components/admin/shadcnuiComponents/input';

type InputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  placeholder?: string;
  label?: string;
  type?: string
};
export default function InputGroup<T extends FieldValues>({
                                                            control,
                                                            name,
                                                            placeholder,
                                                            label,
                                                            type
                                                          }: InputProps<T>) {
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
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              placeholder={placeholder}
              autoComplete="off"
              type={type || 'text'}
              onChange={(e) => {
                field.onChange(type === 'number' ? +e.target.value : e.target.value)
              }}
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
    </FieldGroup>
  );
}