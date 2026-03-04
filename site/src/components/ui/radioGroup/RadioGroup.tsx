import { Control, FieldValues, Controller, Path } from 'react-hook-form';

type RadioOption = {
  value: string;
  label: string | React.ReactNode;
};

type RadioGroupProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  options: RadioOption[];
  className?: string;
};

export function RadioGroup<T extends FieldValues>({
                                                    control,
                                                    name,
                                                    options,
                                                    className,
                                                  }: RadioGroupProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={`input-wrapper ${className ?? ''} ${fieldState.error ? 'error' : ''}`}>
          <div className={'flex flex-col gap-4'}>
            {options.map(option => {
              const id = `${name}-${option.value}`;

              return (
                <div className="" key={option.value}>
                  <div className="left flex items-center cursor-pointer checkbox-group">
                    <div className="block-input radio">
                      <input
                        type="radio"
                        id={id}
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                      />
                      <div className="check-icon"></div>
                    </div>

                    <label htmlFor={id} className="label">
                      {option.label}
                    </label>
                  </div>
                </div>
              );
            })}
          </div>


          {fieldState.error && (
            <div className="error-message">
              {fieldState.error.message}
            </div>
          )}
        </div>
      )}
    />
  );
}