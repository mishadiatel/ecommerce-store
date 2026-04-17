'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/shadcnuiComponents/select';
import { Globe } from 'lucide-react';
import { routing } from '@/i18n/routing';

type Locale = (typeof routing.locales)[number];

const LOCALE_META: Record<Locale, { label: string; flag: string }> = {
  en: { label: 'English', flag: 'EN' },
  ua: { label: 'Українська', flag: 'UA' },
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextLocale: string) => {
    startTransition(() => {
      // Preserve the current pathname (without the locale prefix) and any
      // dynamic route params when switching locales.
      router.replace(
        // @ts-expect-error -- The pathname is always typed, but params are generic.
        { pathname, params },
        { locale: nextLocale as Locale }
      );
    });
  };

  return (
    <Select value={locale} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger
        className={[
          'w-auto min-w-[92px] h-9 rounded-full gap-2 px-3',
          'border-border bg-secondary/60 text-sm font-medium',
          'focus:ring-1 focus:ring-ring',
        ].join(' ')}
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l}>
            <span className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                {LOCALE_META[l].flag}
              </span>
              <span>{LOCALE_META[l].label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
