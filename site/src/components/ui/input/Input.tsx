import {Control, FieldValues, Controller, Path} from "react-hook-form";
import { ReactNode } from 'react';

type BaseInputProps<T extends FieldValues> = {
    control: Control<T>;
    name: Path<T>;
    placeholder?: string;
    label?:string;
    className?:string;
};

export function Input<T extends FieldValues>({
                                                     control,
                                                     name,
                                                     placeholder,
                                                      label,
                                                      className,
                                                 }: BaseInputProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
              <label className={`input-wrapper ${className ? className : ''} ${fieldState.error ? 'error' : ''}`}>
                {label && <span className={'input-label'}>{label}</span>}
                <input {...field} value={field.value ?? ""} className="input" placeholder={placeholder} />
                {fieldState.error && (
                  <div className="error-message">{fieldState.error.message}</div>
                )}
              </label>
            )}
        />
    );
}