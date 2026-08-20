'use client'
import { useTranslations } from 'next-intl';
import { FormEvent, startTransition } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';

interface SearchFormProps {
  onSubmit?: () => void;
}

export default function SearchForm({onSubmit}: SearchFormProps) {
  const t = useTranslations('Header')
  const router = useRouter();
  const pathname = usePathname();
  const searchFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchTerm = String(formData.get('term')).trim().toLowerCase();
    const isOnSearchPage = pathname === '/search';

    startTransition(() => {
      router.push({ pathname: '/search', query: { term: searchTerm } });
      if (isOnSearchPage) {
        // Змушуємо серверний компонент /search перезапустити fetch,
        // навіть якщо Router Cache вважає сегмент "свіжим".
        router.refresh();
      }
    });

    if (onSubmit) onSubmit();
  }

  return (
    <form onSubmit={searchFormSubmit}>
      <div className="input-wrapper w-full" >
        <input className="input !pr-[60px]" type="text" id="val1" name="term" placeholder={t('searchInputLabel')} />
        <button type="submit" className="absolute right-[14px] top-3"><i className="icon icon-search"></i>
        </button>
      </div>
    </form>
  )
}