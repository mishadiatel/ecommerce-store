import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { useCategories } from '@/context/categoriesContext/CategoriesContext';

interface HeaderMenuProps {
  closeMobileMenu?: () => void;
}

export default function HeaderMenu({ closeMobileMenu }: HeaderMenuProps) {
  const t = useTranslations('Header');
  const categories = useCategories();
  return (
    <ul
      className="flex items-center gap-[40px] h-full text-[16px] font-[600] max-lg:flex-col max-lg:gap-5 max-lg:items-start max-lg:h-fit max-lg:mb-[40px]">
      <li className="h-full max-lg:h-fit  ">
        <Link href={'/about'}
              className="link text-secondary duration-300 h-full flex items-center justify-center"
              onClick={() => {
                if (closeMobileMenu) {
                  closeMobileMenu();
                }
              }}
        >
          {t('menuAbout')}
        </Link>

      </li>
      {categories && categories.length > 0 && (
        <li className={'h-full max-lg:h-fit max-lg:w-full'}>
          <Dropdown
            options={categories}
            // initialSelected={initialSelected}
            dropdownContainerClass={'h-full max-lg:h-fit  relative js--dropdown-container-2 menu-dropdown max-lg:w-full'}
          >
            {({
                isOpen,
                toggle,
                listRef,
              }) => (
              <>
                <Link
                  href={'/products'}
                  onClick={toggle}
                  className={`duration-300 h-full flex items-center justify-center gap-2 dropdown-button js--dropdown-button-2 max-lg:w-full max-lg:justify-between js--not-open-link-mobile ${isOpen ? 'open' : ''}`}
                >
                  <span
                    className="link text-secondary duration-300 h-full flex items-center justify-center">{t('menuProducts')}</span>
                  <i className="icon icon-chevron-down text-[24px]"></i>
                </Link>


                <div className={`dropdown ${isOpen ? 'open' : ''}`}>
                  <ul
                    ref={listRef}
                    className="flex flex-col gap-3"
                  >
                    {categories.map((item) => (
                      <li key={item._id} className={'w-full'}>
                        <Link
                          href={`/products/${item.slug}`}
                          className={`link text-secondary duration-300 hover:underline`}
                          onClick={() => {
                            if (closeMobileMenu) {
                              closeMobileMenu();
                            }
                          }}
                        >
                          {item.translations[0].name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

              </>
            )}
          </Dropdown>
        </li>
      )}

      <li className="h-full max-lg:h-fit  ">
        <Link
          href={'/contacts'}
          className="link text-secondary duration-300 h-full flex items-center justify-center"
          onClick={() => {
            if (closeMobileMenu) {
              closeMobileMenu();
            }
          }}>
          {t('menuContacts')} </Link>

      </li>
      <li className="h-full max-lg:h-fit  ">
        <Link
          href={'/faq'}
          className="link text-secondary duration-300 h-full flex items-center justify-center"
          onClick={() => {
            if (closeMobileMenu) {
              closeMobileMenu();
            }
          }}>
          {t('menuFaq')} </Link>

      </li>
    </ul>
  );
}