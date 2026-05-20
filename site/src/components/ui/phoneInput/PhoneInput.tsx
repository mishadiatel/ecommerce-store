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
  const isInitializedRef = useRef(false);
  // Suppress callback emissions while we programmatically sync the value
  // (setNumber() fires `input`/`countrychange` events, and getNumber()
  // can transiently return '' while intl-tel-input's utils are still loading).
  const isSyncingRef = useRef(false);
  const lastSyncedValueRef = useRef<string>('');

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

    isInitializedRef.current = true;

    // set default value if exists
    if (field.value) {
      isSyncingRef.current = true;
      itiRef.current.setNumber(field.value);
      lastSyncedValueRef.current = field.value;
      // release the flag after current event loop tick so iti-emitted events are ignored
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    }

    const handleChange = () => {
      if (!itiRef.current) return;
      if (isSyncingRef.current) return;
      const fullNumber = itiRef.current.getNumber(); // E.164
      // Guard: if utils still resolve to '' but we know a value was set
      // externally, don't wipe it out.
      if (!fullNumber && lastSyncedValueRef.current) return;
      lastSyncedValueRef.current = fullNumber;
      field.onChange(fullNumber);
    };

    inputRef.current.addEventListener('input', handleChange);
    inputRef.current.addEventListener('countrychange', handleChange);

    return () => {
      inputRef.current?.removeEventListener('input', handleChange);
      inputRef.current?.removeEventListener('countrychange', handleChange);
      itiRef.current?.destroy();
      isInitializedRef.current = false;
    };
  }, []);

  // Sync external value changes (e.g. setValue / form.reset after async user load)
  useEffect(() => {
    if (!isInitializedRef.current || !itiRef.current) return;
    const incoming = field.value ?? '';
    if (incoming === lastSyncedValueRef.current) return;
    const currentNumber = itiRef.current.getNumber();
    if (incoming === currentNumber) {
      lastSyncedValueRef.current = incoming;
      return;
    }

    isSyncingRef.current = true;
    itiRef.current.setNumber(incoming);
    lastSyncedValueRef.current = incoming;
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  }, [field.value]);

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