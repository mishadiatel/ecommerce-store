'use client';

import {ReactNode, useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname, useRouter} from '@/i18n/navigation';
import {useAuthStore} from '@/stores/authStore';
import {authLogout} from '@/services/auth';
import {toast} from 'react-toastify';

interface AccountLayoutProps {
    children: ReactNode;
}

interface NavItem {
    href: string;
    labelKey: string;
}

const navItems: NavItem[] = [
    {href: '/account/profile', labelKey: 'Account.menuMyData'},
    {href: '/account/orders', labelKey: 'Account.menuOrders'},
    {href: '/account/changePassword', labelKey: 'Account.menuChangePassword'},
];

export default function AccountLayout({children}: AccountLayoutProps) {
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const logoutFromStore = useAuthStore(s => s.logout);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const user = useAuthStore(s => s.user);

    // Мобільний/планшетний стейт: показувати aside (true) чи контент (false).
    // За замовчуванням — контент. На lg+ — обидві колонки видно завжди.
    const [isAsideOpen, setIsAsideOpen] = useState(false);

    // При зміні шляху (тобто після переходу по посиланню) — гарантовано
    // показуємо контент нової сторінки, а aside ховаємо.
    useEffect(() => {
        setIsAsideOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authLogout();
        } catch {
            // ignore — we still log out locally
        } finally {
            logoutFromStore();
            toast.info(t('Account.logoutMessage'));
            router.replace('/account/login');
            setIsLoggingOut(false);
        }
    };


    return (
        <div className="my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
            <div className="container">
                <div className="content-main flex flex-col lg:flex-row gap-8 w-full ">
                    <aside
                        className={`flex-[0_1_auto] lg:flex-[0_0_405px] lg:block ${
                            isAsideOpen ? 'block' : 'hidden lg:block'
                        }`}
                    >
                        <div
                            className="user-infor bg-extra-light-gray pt-6 pb-4 px-5 md:px-8 md:pt-8 md:pb-6 lg:p-8 rounded-2xl">
                            {user && (
                                <div className="flex flex-col border-b border-b-gray-20 pb-4 mb-3 lg:pb-6 lg:mb-6">

                                    <div className="heading3">
                                        {user?.firstName} {user?.lastName}
                                    </div>
                                    <div className="text-gray-90 mt-1">
                                        {user.email}
                                    </div>
                                </div>
                            )}
                            <div className={'menu-tab list-category w-full max-w-none js--list-category'}>
                                {navItems.map(item => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsAsideOpen(false)}
                                            className={`text-gray-90 text-[20px] sm:text-[22px] lg:text-[20px] category-tab-item js--category-tab-item flex items-center justify-between gap-3 w-full px-0 lg:pl-5 lg:pr-3 py-3 rounded-lg cursor-pointer duration-300
                                             ${isActive ? 'active' : ''}`
                                            }
                                        >
                                            <span>{t(item.labelKey)}</span>
                                            {isActive && (
                                                <i className="icon icon-chevron-right"></i>
                                            )}
                                        </Link>
                                    );
                                })}
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="text-semantic-red text-[20px] sm:text-[22px] lg:text-[20px] category-tab-item js--category-tab-item flex items-center justify-between gap-3 w-full px-0 lg:pl-5 lg:pr-3 py-3 rounded-lg cursor-pointer duration-300"
                                >
                                <span>
                                  {isLoggingOut
                                      ? t('Account.loggingOutText')
                                      : t('Account.menuLogout')}
                                </span>
                                </button>
                            </div>


                        </div>
                    </aside>
                    <div
                        className={`lg:flex-grow lg:block ${
                            isAsideOpen ? 'hidden lg:block' : 'block'
                        }`}
                    >
                        <div className={'text-content w-full h-full'}>
                            <div className={'block lg:hidden'}>
                                <button
                                    type="button"
                                    onClick={() => setIsAsideOpen(true)}
                                    aria-label={t('Account.showMenuAriaLabel')}
                                    className="button-main bg-white middle icon-button mb-3 "
                                >
                                    <i className="icon icon-arrow-left-small"></i>
                                </button>
                            </div>
                            <div
                                className={'flex flex-col bg-extra-light-gray rounded-2xl py-6 px-5 sm:p-8 w-full h-full'}>
                                {children}
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>

    );
}
