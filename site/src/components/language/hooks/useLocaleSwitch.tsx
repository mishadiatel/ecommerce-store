'use client'

import { usePathname, useRouter} from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

export function useLocaleSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const switchLocale = (locale: string) => {
    router.push(
      {
        pathname,
        query: Object.fromEntries(searchParams.entries()),
      },
      { locale }
    );
  };

  return { switchLocale };
}