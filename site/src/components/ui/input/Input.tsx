'use client';

import { useState } from 'react';
import { Control, FieldValues, Controller, Path } from 'react-hook-form';

type BaseInputProps<T extends FieldValues> = {
    control: Control<T>;
    name: Path<T>;
    placeholder?: string;
    label?: string;
    className?: string;
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
    const isPasswordField = type === 'password';
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const effectiveType =
        isPasswordField && isPasswordVisible ? 'text' : type;

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <label
                    className={`input-wrapper ${className ? className : ''} ${fieldState.error ? 'error' : ''} ${disabled || readOnly ? 'disabled' : ''}`}
                >
                    {label && <span className={'input-label'}>{label}</span>}
                    <input
                        {...field}
                        type={effectiveType}
                        autoComplete={autoComplete}
                        value={field.value ?? ''}
                        className={`input ${isPasswordField ? 'password-input' : ''}`}
                        placeholder={placeholder}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    {isPasswordField && (
                        <button
                            type="button"
                            tabIndex={-1}
                            className={`toggle-password ${isPasswordVisible ? 'show-password' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setIsPasswordVisible((v) => !v);
                            }}
                            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                        >
                            <i className="icon icon-eye-off"></i>
                            <i className="icon icon-eye eye"></i>
                        </button>
                    )}
                    {fieldState.error && (
                        <div className="error-message">{fieldState.error.message}</div>
                    )}
                </label>
            )}
        />
    );
}
