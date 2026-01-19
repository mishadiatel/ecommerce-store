import { NextIntlClientProvider } from 'next-intl';
import { SettingsProvider } from '@/components/generalSettings/GeneralSettingsContext';
import { FullSettingsWithTranslations } from '@/types/general';

export default function Provider({children, settings}: {
  children: React.ReactNode;
  settings: FullSettingsWithTranslations;
}) {
  return (
    <NextIntlClientProvider>
      <SettingsProvider settings={settings} >
        <main>
          {children}
        </main>
      </SettingsProvider>
    </NextIntlClientProvider>
  )
}
