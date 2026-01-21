import type {Metadata} from "next";
import { Mulish } from 'next/font/google';
import Provider from '@/components/provider/Provider';
import { getGeneralSettings } from '@/services/generalSettings';
import { generateFileUrl } from '@/lib/utils';
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
import 'swiper/css';
import 'swiper/css/pagination';
import '@/style/icomoon/style.min.css';
import '@/style/style.scss';
import '../global.css';
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";
import {notFound} from "next/navigation";
import Header from '@/components/layout/header/header';
import Setup from '@/components/setup/Setup';
import { getPublicCategories } from '@/services/category';
import Footer from '@/components/layout/footer/footer';
// import { ToastContainer } from 'react-toastify';


const mulishFont = Mulish({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-mulish',
})



export async function generateMetadata({ params }: {params: Promise<{locale: string}>}): Promise<Metadata> {
    const {locale} = await params;
    const settings = await getGeneralSettings(locale);

    return {
        title: {
            default: settings.companyName,
            template: `%s | ${settings.companyName}`,
        },
        icons: {
            icon: generateFileUrl(settings.favicon),
            shortcut: generateFileUrl(settings.favicon),
            apple: generateFileUrl(settings.favicon),
        }
    };
}



export default async function RootLayout({
                                       children, params
                                   }: Readonly<{
    children: React.ReactNode;
    params: Promise<{locale: string}>;
}>) {
    const {locale} = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }
    const settings = await getGeneralSettings(locale);
    const categories = await getPublicCategories(locale);
    return (
        <html lang={locale}>
        <body
            className={`${mulishFont.variable} antialiased`}
        >
        <Provider settings={settings} categories={categories}>
            <div className={'flex flex-col h-full'}>
                <Header />
                <main>
                    {children}
                    <Setup />
                </main>
                <Footer />
            </div>
        </Provider>
        {/*<ToastContainer />*/}
        </body>
        </html>
    );
}
