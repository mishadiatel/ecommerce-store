import {Control, FieldValues, Controller, Path} from "react-hook-form";

type BaseInputProps<T extends FieldValues> = {
    control: Control<T>;
    name: Path<T>;
    placeholder?: string;
    label?:string;
    className?:string;
    type?: string;
    autoComplete?: string;
    disabled?: boolean;
    readOnly?: boolean;
};

export function Input<T extends FieldValues>({
                                                     control,
                                                     name,
                                                     placeholder,
                                                      label,
                                                      className,
                                                      type = 'text',
                                                      autoComplete,
                                                      disabled = false,
                                                      readOnly = false,
                                                 }: BaseInputProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
              <label className={`input-wrapper ${className ? className : ''} ${fieldState.error ? 'error' : ''} ${disabled || readOnly ? 'disabled' : ''}`}>
                {label && <span className={'input-label'}>{label}</span>}
                <input
                  {...field}
                  type={type}
                  autoComplete={autoComplete}
                  value={field.value ?? ""}
                  className="input"
                  placeholder={placeholder}
                  disabled={disabled}
                  readOnly={readOnly}
                />
                {fieldState.error && (
                  <div className="error-message">{fieldState.error.message}</div>
                )}
              </label>
            )}
        />
    );
}
