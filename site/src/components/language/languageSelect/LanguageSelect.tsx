'use client';

import { useLocale } from 'use-intl';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { useLocaleSwitch } from '@/components/language/hooks/useLocaleSwitch';

const languages = [
  { locale: 'ua', label: 'Українська' },
  { locale: 'en', label: 'English' },
];

export default function LanguageSelect() {
  const currentLocale = useLocale();
  const {switchLocale} = useLocaleSwitch()

  const initialSelected = languages.find((l) => l.locale === currentLocale) || languages[0];

  return (
    <Dropdown
      options={languages}
      initialSelected={initialSelected}
      dropdownContainerClass={'choose-language relative'}
    >
      {({
          isOpen,
          toggle,
          selected,
          listRef
        }) => (
        <>
          <button
            onClick={toggle}
            type="button"
            className={`flex items-center gap-3 dropdown-button ${isOpen ? 'open' : ''}`}
          >
            <span className="selected caption2 text-gray-90">{selected?.label}</span>
            <i className="icon icon-chevron-down"></i>
          </button>


            <div className={`dropdown ${isOpen ? 'open' : ''}`}>
              <ul
                ref={listRef}
                className="flex flex-col gap-3"
              >
                {languages.map((item) => {

                  return (
                    <li
                      key={item.locale}
                      onClick={() => {
                        switchLocale(item.locale)
                      }}
                      className={`caption2`}
                    >
                      <div
                        className={`dropdown-item ${currentLocale === item.locale ? 'active' : ''}`}
                      >
                        {item.label}
                       <i className="icon icon-tick-small ml-2"></i>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

        </>
      )}
    </Dropdown>
  );
}
