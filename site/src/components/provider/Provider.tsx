import { NextIntlClientProvider } from 'next-intl';
import { SettingsProvider } from '@/components/context/generalSettings/GeneralSettingsContext';
import { FullSettingsWithTranslations } from '@/types/general';
import { FullCategoryWithTranslation } from '@/types/category';
import { CategoriesProvider } from '@/components/context/categoriesContext/CategoriesContext';

export default function Provider({children, settings, categories}: {
  children: React.ReactNode;
  settings: FullSettingsWithTranslations;
  categories: FullCategoryWithTranslation[]
}) {
  return (
    <NextIntlClientProvider>
      <SettingsProvider settings={settings} >
        <CategoriesProvider categories={categories} >
          {children}
        </CategoriesProvider>
      </SettingsProvider>
    </NextIntlClientProvider>
  )
}
