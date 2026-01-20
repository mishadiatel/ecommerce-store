'use client'
import { useTranslations } from 'next-intl';
import { FormEvent } from 'react';
import { useRouter } from '@/i18n/navigation';

interface SearchFormProps {
  onSubmit?: () => void;
}

export default function SearchForm({onSubmit}: SearchFormProps) {
  const t = useTranslations('Header')
  const router = useRouter();
  const searchFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchTerm = String(formData.get('term')).trim().toLowerCase();
    router.push(`/search?term=${encodeURIComponent(searchTerm)}`);
   if(onSubmit) {
     onSubmit();
   }
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