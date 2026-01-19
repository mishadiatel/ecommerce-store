import type {Metadata} from "next";
import {Open_Sans} from "next/font/google";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../global.css';
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";
import {notFound} from "next/navigation";
// import { ToastContainer } from 'react-toastify';
import Provider from '@/components/provider/Provider';
import { getGeneralSettings } from '@/services/generalSettings';
import { generateFileUrl } from '@/lib/utils';


const openSansFont = Open_Sans({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-open-sans',
});


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
    return (
        <html lang={locale}>
        <body
            className={`${openSansFont.variable} antialiased`}
        >
        <Provider settings={settings}>
            <main>
                {children}
            </main>
        </Provider>
        {/*<ToastContainer />*/}
        </body>
        </html>
    );
}
