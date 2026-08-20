'use client';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/admin/shadcnuiComponents/dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/shadcnuiComponents/select';
import PageControl from '@/components/admin/ui/pageControl';
import PopularQueryCard from '@/components/admin/popularQueries/PopularQueryCard';
import PopularQueryForm from '@/components/admin/popularQueries/PopularQueryForm';
import { getPopularQueries } from '@/services/popularQuery';
import { PopularQuery } from '@/types/popularQuery';
import { LANGUAGES_LIST } from '@/variables/languages';

export default function PopularQueriesList() {
  const t = useTranslations('popularQueriesPage');
  const [items, setItems] = useState<PopularQuery[]>([]);
  const [searchWord, setSearchWord] = useState('');
  const [language, setLanguage] = useState<string>('all');
  const [visibleFilter, setVisibleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | undefined>();
  const [totalDocuments, setTotalDocuments] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const limit = 25;

  const fetchList = () => {
    setIsLoading(true);
    const query: Record<string, string | number> = {
      page: currentPage,
      limit,
    };
    if (searchWord.trim()) query.search = searchWord.trim();
    if (language && language !== 'all') query.language = language;
    if (visibleFilter === 'true') query.visible = 'true';
    if (visibleFilter === 'false') query.visible = 'false';

    getPopularQueries(query)
      .then((res) => {
        setItems(res?.data ?? []);
        setTotalPages(res?.totalPages);
        setTotalDocuments(res?.totalDocuments);
      })
      .catch(() => toast.error(t('toast.loadError')))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [language, visibleFilter]);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, language, visibleFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchList();
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchWord]);

  return (
    <>
      <div className="w-full sm:w-fit">
        <Dialog>
          <DialogTrigger className="w-full sm:w-fit" asChild>
            <Button className="w-full sm:w-auto">{t('addButton')}</Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-1.5rem)] max-w-[600px] sm:max-w-[600px] max-h-screen overflow-y-auto">
            <PopularQueryForm onSuccess={fetchList} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="admin-filters">
        <div className="admin-filter-search">
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />
        </div>
        <div className="admin-filter-select">
          <Select
            value={language}
            onValueChange={(v) => setLanguage(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('languagePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allLanguages')}</SelectItem>
              {LANGUAGES_LIST.map((lang) => (
                <SelectItem key={lang._id} value={lang._id}>
                  {lang.text.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="admin-filter-select">
          <Select
            value={visibleFilter}
            onValueChange={(v) => setVisibleFilter(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('visibilityPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('visibilityAll')}</SelectItem>
              <SelectItem value="true">{t('visibilityVisible')}</SelectItem>
              <SelectItem value="false">{t('visibilityHidden')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">…</div>
        ) : items.length === 0 ? (
          <div>{t('notFound')}</div>
        ) : (
          <>
            {items.map((item) => (
              <PopularQueryCard
                key={item._id}
                item={item}
                updateList={fetchList}
              />
            ))}
            {totalPages && totalDocuments && (
              <PageControl
                currentPage={currentPage}
                limit={limit}
                totalDocuments={totalDocuments}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                documentsLength={items.length}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
