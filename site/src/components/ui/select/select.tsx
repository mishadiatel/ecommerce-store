'use client';
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/svgIcon/Icon";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface CountryOption {
    key: string;
    label: string;
}

interface SelectProps<T extends FieldValues> {
    options: CountryOption[];
    label: string;
    control: Control<T>;
    name: Path<T>;
    error?: string;
}

export default function Select<T extends FieldValues>({
                                                          options,
                                                          label,
                                                          control,
                                                          name,
                                                      }: SelectProps<T>) {
    const [open, setOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        const handleScroll = () => {
            setOpen(false);
        };

        document.addEventListener('click', handleClickOutside);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                const selected = options.find(o => o.key === field.value);

                return (
                    <div
                        className={`input-wrapper relative cursor-pointer ${fieldState.error ? 'error' : ''}`}
                        ref={selectRef}
                    >
                        <div
                            className={`input flex justify-between items-center ${open ? '!border-violet-2 !outline !outline-violet-2' : ''}`}
                            onClick={() => setOpen(prev => !prev)}
                        >
                            {selected ? (
                                <span>{selected.label}</span>
                            ) : (
                                <span className="text-light-gray">{label}</span>
                            )}
                            <Icon
                                name={'icon-down'}
                                className={`h-3 w-3 text-light-gray transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`}
                            />
                        </div>

                        {open && (
                            <div
                                className="absolute top-[calc(100%-5px)] bg-white flex flex-col w-[calc(100%-12px)] left-1/2 -translate-x-1/2 z-10 shadow-box"
                            >
                                {options.map(option => (
                                    <div
                                        key={option.key}
                                        className="px-[6px] py-[2px] text-dark-gray font-light text-[12px] hover:bg-violet-2 hover:text-white cursor-pointer"
                                        onClick={() => {
                                            field.onChange(option.key);
                                            setOpen(false);
                                        }}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        )}

                        {fieldState.error && (
                            <div className="error-message">{fieldState.error.message}</div>
                        )}
                    </div>
                );
            }}
        />
    );
}
