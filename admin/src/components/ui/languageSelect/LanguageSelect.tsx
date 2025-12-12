'use client'

import {useEffect, useRef, useState} from "react";
import Icon from "@/components/ui/svgIcon/Icon";
import {useLocale} from "use-intl";
import {Link} from "@/i18n/navigation";

interface LanguageSelectProps {
    isTop?: boolean;
}

export default function LanguageSelect({isTop = false}: LanguageSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const currentLocale = useLocale();
    const languages = [
        { locale: 'ru', label: 'RU' },
        { locale: 'es', label: 'ES' },
    ];

    const [selectedLanguage, setSelectedLanguage] = useState(
        languages.find(el => el.locale === currentLocale) ||
        languages[0]
    );

    const selectRef = useRef<HTMLDivElement>(null);

    const handleLanguageChange = (lang: { locale: string; label: string }) => {
        setSelectedLanguage(lang);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            setIsOpen(false);
        };

        document.addEventListener('click', handleClickOutside);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={`language-select w-fit ${isOpen ? 'open' : ''} ${isTop ? 'top-open' : ''}`} ref={selectRef}>
            <div
                className={'h-11 flex items-center justify-center p-2 border border-white gap-2 cursor-pointer'}
                onClick={() => setIsOpen(prev => !prev)}
            >
                <span className={'text-sm font-light text-white'}>{selectedLanguage.label}</span>
                <Icon name={'icon-down'} className={`text-white w-2 h-2 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            <div className={'language-select__options'}>
                {languages.map((item) => (
                    <Link key={Math.random()}
                          href="/"
                          locale={item.locale}
                         className={'w-full pl-2 py-1 font-light text-xs text-dark-gray cursor-pointer transition transition-200 hover:bg-violet hover:text-white'}
                         onClick={() => handleLanguageChange(item)}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>
        </div>
    )
}