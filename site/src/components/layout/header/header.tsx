'use client';

import { useSettings } from '@/components/context/generalSettings/GeneralSettingsContext';
import { Link } from '@/i18n/navigation';
import LanguageSelect from '@/components/language/languageSelect/LanguageSelect';
import Image from 'next/image';
import { generateFileUrl } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import HeaderMenu from '@/components/layout/header/menu/HeaderMenu';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import SearchForm from '@/components/search/form/SearchForm';

export default function Header() {
  const t = useTranslations('Header');
  const settings = useSettings();
  const [isOpenLoginPopup, setIsOpenLoginPopup] = useState(false);
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const loginPopupRef = useRef<HTMLDivElement>(null);
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);

  const closeMobileMenu = () => {
    setIsOpenMobileMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loginPopupRef.current && !loginPopupRef.current.contains(event.target as Node)) {
        setIsOpenLoginPopup(false);
      }
    };

    const handleScroll = () => {
      setIsOpenLoginPopup(false);
    };

    const fixHeaderAtTop = () => {

        if (window.scrollY > 100) {
          setIsHeaderFixed(true);
        } else {
          setIsHeaderFixed(false);
        }

    }

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', fixHeaderAtTop, { passive: true });

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', fixHeaderAtTop)
    };
  }, []);
  return (
    <>
      <div id="top-nav"
           className="top-nav style-one bg-white border-b border-gray-20 md:h-[44px] h-[30px] hidden sm:block">
        <div className="container mx-auto h-full">
          <div className="top-nav-main flex justify-between max-md:justify-center h-full">
            <div className="left-content flex items-center gap-5 max-md:hidden">
              {settings.instagram && (
                <Link href={settings.instagram} target={'_blank'} rel={'nofollow'} className={'flex'}>
                  <i className={'icon icon-instagram1'}></i>
                </Link>
              )}

              {settings.facebook && (
                <Link href={settings.facebook} target={'_blank'} rel={'nofollow'} className={'flex'}>
                  <i className={'icon icon-facebook'}></i>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-8 font-semibold text-[14px]">
              {settings.phoneNumber && (
                <Link href={`tel:${settings.phoneNumber}`} className="text-primary-green hover:underline">
                  {settings.phoneNumber}
                </Link>
              )}

              {settings.email && (
                <Link href={`mailto:${settings.email}`} className="text-primary-green hover:underline">
                  {settings.email}
                </Link>
              )}
            </div>
            <div className="right-content flex items-center gap-5 max-md:hidden">
              <LanguageSelect />
            </div>
          </div>
        </div>
      </div>

      <div id="header" className="relative w-full">
        <div className={`header-menu style-one absolute top-0 left-0 right-0 w-full lg:h-[70px] h-[72px] bg-transparent ${isHeaderFixed ? 'fixed' : ''}`}>
          <div className="container mx-auto h-full">
            <div className="header-main flex justify-between h-full max-sm:gap-3">
              {settings.logo && (
                <div className="left flex items-center logo">
                  <div className="flex items-center">
                    <Link href={'/'}>
                      <Image src={generateFileUrl(settings.logo)} alt={'logo'} width={180} height={43} />
                    </Link>
                  </div>
                </div>
              )}
              <div className="center flex items-center">
                <div className="menu-main h-full max-lg:hidden">
                  <HeaderMenu />
                </div>
              </div>
              <div className="right flex gap-12 z-[1]">
                <div className="max-md:hidden search-icon flex items-center cursor-pointer relative">
                  <i className="icon-search max-lg:text-[28px]"></i>
                  <div className="line absolute bg-gray-20 w-px h-6 -right-6 cursor-default"></div>
                </div>
                <div className="list-action flex items-center gap-4">
                  <Link href={'/wishlist'}
                     className="max-md:hidden wishlist-icon flex items-center relative cursor-pointer">
                    <i className="icon-favorites max-lg:text-[28px]"></i>
                    <span
                      className="quantity wishlist-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-primary-green w-4 h-4 flex items-center justify-center rounded-full js--wishlist-total">2</span>
                  </Link>

                  <div className="user-icon flex items-center justify-center cursor-pointer" ref={loginPopupRef}>
                    <button type={'button'}
                            className={'flex cursor-pointer'}
                            onClick={() => setIsOpenLoginPopup(prevState => !prevState)}>
                      <i className="icon-personal-account max-lg:text-[28px]"></i>
                    </button>
                    <div
                      className={`login-popup flex items-center flex-col p-5 sm:p-8 rounded-2xl bg-white border border-gray-20 ${isOpenLoginPopup ? 'open' : ''}`}
                    >
                      <Link href={'/account/login'}
                            className="button-main !w-full text-center">
                        {t('loginPopupButton')}
                      </Link>
                      <div className="caprion1 text-gray-90 text-center mt-7 sm:mt-8">
                        {t('loginPopupHaveAccount')}
                        <Link
                          href={'/account/signup'}
                          className="text-sm text-primary-green uppercase font-bold pl-1 ">
                          {t('loginPopupSignupButton')}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="cart-icon flex items-center relative cursor-pointer js--cart-container">
                    <div className="js--cart-action flex" data-cart-action="show">
                      <i className="icon-cart max-lg:text-[28px]"></i>
                      <span
                        className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-primary-green w-4 h-4 flex items-center justify-center rounded-full js--cart-total-items">
            0        </span>
                    </div>
                  </div>
                  <div className="line h-[24px] w-px bg-gray-20 lg:hidden"></div>
                  <button
                    type={'button'}
                    className="menu-mobile-icon flex lg:hidden items-center"
                    onClick={() => setIsOpenMobileMenu(true)}>
                    <i className="icon-menu max-lg:text-[28px]"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="menu-mobile" className={`lg:hidden ${isOpenMobileMenu ? 'open' : ''}`}>
          <div className="menu-container bg-white ">
            <div className="container ">
              <div className="menu-main  overflow-x-hidden min-h-screen flex flex-col pb-5">
                <div className="heading py-[12px] relative flex items-center justify-between">

                  {settings.logo && (
                    <div className="flex items-center">
                      <Image src={generateFileUrl(settings.logo)} alt={'logo'} width={180} height={43} />
                    </div>
                  )}

                  <button
                    type={'button'}
                    className="close-menu-mobile-btn flex items-center"
                    onClick={closeMobileMenu}
                  >
                    <i className="icon-x max-lg:text-[28px]"></i>
                  </button>
                </div>
                <div className="form-search relative mt-5">
                  <SearchForm onSubmit={closeMobileMenu} />
                </div>

                <div className="list-nav mt-6 text-gray-90 font-semibold">
                  <div className="flex flex-col items-start gap-[12px] pb-[16px] mb-[16px] border-b border-gray-20 ">
                    <Link
                      href={'/wishlist'}
                      className="wishlist-icon w-full flex items-center gap-3 relative cursor-pointer"
                      onClick={closeMobileMenu}
                    >
                      <i className="icon-favorites max-lg:text-[28px]"></i><span>{t('wishlist')}</span>
                    </Link>
                    <Dropdown
                      options={[]}
                      dropdownContainerClass={'relative js--dropdown-container-2 menu-dropdown w-full'}
                    >
                      {({
                          isOpen,
                          toggle,
                          listRef,
                        }) => (
                        <>
                          <div
                            className={`w-full flex items-center justify-content-between dropdown-button ${isOpen ? 'open' : ''}`}
                            onClick={toggle}
                          >
                            <div className="w-full flex items-center gap-3 cursor-pointer">
                              <i className="icon-personal-account max-lg:text-[28px]"></i>
                              <span>{t('personalAccount')}</span>
                            </div>
                            <i className="icon icon-chevron-down text-[24px]"></i>
                          </div>


                          <div className={`dropdown ${isOpen ? 'open' : ''}`}>
                            <ul
                              ref={listRef}
                              className="flex flex-col gap-3"
                            >
                              <li>
                                <Link href={'/account/login'}
                                      className="link text-secondary duration-300 hover:underline"
                                      onClick={closeMobileMenu}>{t('login')}</Link>
                              </li>
                              <li>
                                <Link href={'/account/signup'}
                                      className="link text-secondary duration-300 hover:underline"
                                      onClick={closeMobileMenu}>{t('register')}</Link>
                              </li>
                            </ul>
                          </div>

                        </>
                      )}
                    </Dropdown>
                    <Link
                      href={'/cart'}
                      onClick={closeMobileMenu}
                      className="cart-icon w-full flex items-center gap-3 relative cursor-pointer">
                      <i className="icon-cart max-lg:text-[28px]"></i><span>{t('cart')}</span>
                    </Link>
                  </div>

                  <HeaderMenu closeMobileMenu={closeMobileMenu} />

                </div>
                <div className="mt-auto text-gray-80 font-semibold text-[14px]">

                  {(settings.phoneNumber || settings.email) && (
                    <>
                      <div className="mb-[4px]">
                        {t('contactsLabel')}
                      </div>
                      <div className="text-black text-[16px] mb-3 flex flex-col gap-2 header-menu-contacts">
                        {settings.phoneNumber && (
                          <Link
                            href={`tel:${settings.phoneNumber}`}
                            className="text-primary-green hover:underline">
                            {settings.phoneNumber}
                          </Link>
                        )}

                        {settings.email && (
                          <Link
                            href={`mailto:${settings.email}`}
                            className="text-primary-green hover:underline">
                            {settings.email}
                          </Link>
                        )}
                      </div>
                    </>
                  )}

                  {(settings.instagram || settings.facebook) && (
                    <>
                      <div className="text-gray-80 font-semibold text-[14px] mb-[4px]">
                        {t('socialsLabel')}
                      </div>
                      <div className="flex items-center gap-8 pb-3 border-b border-gray-20">
                        {settings.instagram && (
                          <Link href={settings.instagram} target={'_blank'} rel={'nofollow'} className={'flex'}>
                            <i className={'icon icon-instagram1'}></i>
                          </Link>
                        )}

                        {settings.facebook && (
                          <Link href={settings.facebook} target={'_blank'} rel={'nofollow'} className={'flex'}>
                            <i className={'icon icon-facebook'}></i>
                          </Link>
                        )}
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-4 mt-6">
                    <LanguageSelect />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}