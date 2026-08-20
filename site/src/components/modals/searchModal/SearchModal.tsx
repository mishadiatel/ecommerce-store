'use client';

import SearchForm from '@/components/search/form/SearchForm';
import { useModalStore } from '@/stores/useModalStore';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState, startTransition } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { getPopularQueries, type PopularQuery } from '@/services/popularQuery';

export default function SearchModal({ open }: { open: boolean }) {
  const closeModal = useModalStore((state) => state.closeModal);
  const t = useTranslations('Search');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [queries, setQueries] = useState<PopularQuery[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getPopularQueries(locale, 20).then((data) => {
      if (!cancelled) setQueries(data);
    });
    return () => {
      cancelled = true;
    };
  }, [open, locale]);

  const handleQueryClick = (text: string) => {
    const term = text.trim().toLowerCase();
    const isOnSearchPage = pathname === '/search';

    startTransition(() => {
      router.push({ pathname: '/search', query: { term } });
      if (isOnSearchPage) {
        router.refresh();
      }
    });

    closeModal();
  };

  return (
    <div className="modal-search-block" onClick={closeModal}>
      <div
        className={`modal-search-main p-6 sm:p-8 rounded-2xl flex flex-col gap-6 sm:gap-8 ${open ? 'open' : ''}`}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="flex justify-between items-center">
          <div className="heading2">{t('popupTitle')}</div>
          <button
            className="button-main icon-button middle bg-gray"
            onClick={closeModal}
          >
            <i className="icon icon-x"></i>
          </button>
        </div>
        <div className="form-search relative w-full">
          <SearchForm onSubmit={closeModal} />
        </div>
        {queries.length > 0 && (
          <div className="keyword">
            <div className="heading3">{t('popularQueries')}</div>
            <div className="list-keyword flex items-center flex-wrap gap-2 mt-6">
              {queries.map((q) => (
                <button
                  key={q._id}
                  type="button"
                  onClick={() => handleQueryClick(q.queryText)}
                  className="item px-5 py-1.5 bg-extra-light-gray rounded-full text-gray-90 caption1 hover:bg-gray-20 transition-colors"
                >
                  {q.queryText}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
