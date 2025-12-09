import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/admin/shadcnuiComponents/field';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import { Checkbox } from '@/components/admin/shadcnuiComponents/checkbox';
import { Label } from '@/components/admin/shadcnuiComponents/label';

type CheckboxInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
};
export default function CheckboxInput<T extends FieldValues>({
                                                            control,
                                                            name,
                                                            label,
                                                          }: CheckboxInputProps<T>) {
  return (
    <FieldGroup>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Label className="">
              <Checkbox
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
              />
              <p className="text-sm leading-none font-medium">
                {label}
              </p>

            </Label>
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
    </FieldGroup>
  );
}