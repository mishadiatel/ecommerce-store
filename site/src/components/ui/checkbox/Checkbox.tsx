import { Control, FieldValues, Controller, Path } from 'react-hook-form';

type BaseInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string | React.ReactNode;
  className?: string;
};

export function Checkbox<T extends FieldValues>({
                                                  control,
                                                  name,

                                                  label,
                                                  className,
                                                }: BaseInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <label className={`input-wrapper ${className ? className : ''} ${fieldState.error ? 'error' : ''}`}>
          <div className="left flex items-start cursor-pointer checkbox-group">
            <div className="block-input checkbox">
              <input {...field} type={'checkbox'} />
              <div className="check-icon">
                <i className="icon icon-tick-small"></i>
              </div>
            </div>
            {label && <span className="caption1 text-black pl-2 relative -top-[2px]">{label}</span>}
          </div>

          {fieldState.error && (
            <div className="error-message">{fieldState.error.message}</div>
          )}
        </label>
      )}
    />
  );
}