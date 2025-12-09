import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/admin/shadcnuiComponents/field';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/admin/shadcnuiComponents/select';

type SelectProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  placeholder?: string;
  label?: string;
  values: { _id: string, text: string }[];
};
export default function GroupSelect<T extends FieldValues>({
                                                             control,
                                                             name,
                                                             placeholder,
                                                             label,
                                                             values,
                                                           }: SelectProps<T>) {
  return (
    <><FieldGroup>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>
              {label}
            </FieldLabel>
            <Select onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {values.map(value => (
                  <SelectItem value={value._id} key={value._id}>{value.text}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
    </FieldGroup>
    </>
  );
}