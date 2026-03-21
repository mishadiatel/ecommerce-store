'use client';

import { useEffect, useRef } from 'react';
import {
  Control,
  FieldValues,
  Path,
  useController,
} from 'react-hook-form';
import intlTelInput from 'intl-tel-input';
import type { Instance } from 'intl-tel-input';
import { Iso2 } from 'intl-tel-input/data';

type PhoneInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  defaultCountry?:  Iso2 | 'auto' | '';
};

export function PhoneInput<T extends FieldValues>({
                                                    control,
                                                    name,
                                                    label,
                                                    placeholder,
                                                    className,
                                                    defaultCountry = 'ua',
                                                  }: PhoneInputProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const itiRef = useRef<Instance | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    itiRef.current = intlTelInput(inputRef.current, {
      initialCountry: defaultCountry,
      separateDialCode: true,
      nationalMode: false,
      formatOnDisplay: true,
      useFullscreenPopup: false,
      loadUtils: () => import('intl-tel-input/build/js/utils.js')
    });

    // set default value if exists
    if (field.value) {
      itiRef.current.setNumber(field.value);
    }

    const handleChange = () => {
      if (!itiRef.current) return;
      const fullNumber = itiRef.current.getNumber(); // E.164
      field.onChange(fullNumber);
    };

    inputRef.current.addEventListener('input', handleChange);
    inputRef.current.addEventListener('countrychange', handleChange);

    return () => {
      inputRef.current?.removeEventListener('input', handleChange);
      inputRef.current?.removeEventListener('countrychange', handleChange);
      itiRef.current?.destroy();
    };
  }, []);

  return (
    <label
      className={`input-wrapper ${className ?? ''} ${error ? 'error' : ''}`}
    >
      {label && <span className="input-label">{label}</span>}

      <input
        ref={inputRef}
        type="tel"
        placeholder={placeholder}
        className={'input w-full'}
        onKeyDown={(e) => {
          const allowedKeys = [
            'Backspace',
            'Delete',
            'ArrowLeft',
            'ArrowRight',
            'Tab',
          ];

          if (
            !/[0-9]/.test(e.key) &&
            !allowedKeys.includes(e.key)
          ) {
            e.preventDefault();
          }
        }}
      />

      {error && (
        <div className="error-message">
          {error.message}
        </div>
      )}
    </label>
  );
}