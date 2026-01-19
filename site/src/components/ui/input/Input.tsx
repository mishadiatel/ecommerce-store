import {Control, FieldValues, Controller, Path} from "react-hook-form";

type BaseInputProps<T extends FieldValues> = {
    control: Control<T>;
    name: Path<T>;
    placeholder?: string;
};

export function Input<T extends FieldValues>({
                                                     control,
                                                     name,
                                                     placeholder,
                                                 }: BaseInputProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <div className={`input-wrapper ${fieldState.error ? 'error' : ''}`}>
                    <input {...field} value={field.value ?? ""} className="input" placeholder={placeholder} />
                    {fieldState.error && (
                        <div className="error-message">{fieldState.error.message}</div>
                    )}
                </div>
            )}
        />
    );
}