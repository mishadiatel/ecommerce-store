'use client';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/admin/shadcnuiComponents/dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import PageCard from '@/components/admin/pages/card/PageCard';
import { Page } from '@/types/pages';
import AddPageForm from '@/components/admin/pages/forms/AddPage';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import { getPages } from '@/services/pages';
import { toast } from 'react-toastify';
import PageControl from '@/components/admin/ui/pageControl';


export default function PagesList() {
  const t = useTranslations('pagesControlPage');
  const isFirstRender = useRef(true);
  const [pagesState, setPagesState] = useState<Page[] | undefined>([]);
  const [searchWord, setSearchWord] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [totalDocuments, setTotalDocuments] = useState<number | undefined>(undefined);
  const [limit, setLimit] = useState<number>(10);

  const updatePagesList = () => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const query: Record<string, string | number> = {
      page: currentPage,
      limit: limit,
    };
    if (searchWord.trim()) {
      query.search = searchWord.trim();
    }
    getPages(query).then((pagesResult) => {
      setPagesState(pagesResult?.data);
      setTotalPages(pagesResult?.totalPages);
      setTotalDocuments(pagesResult?.totalDocuments);
    }).catch((err) => {
      toast.error(t('toast.loadError'));
    });
  };

  useEffect(() => {
    updatePagesList();
  }, [currentPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      updatePagesList();
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchWord]);
  return (
    <>
      <div className={'w-fit'}>
        <Dialog>
          <DialogTrigger className={'w-fit'} asChild>
            <Button>{t('addButton')}</Button>
          </DialogTrigger>
          <DialogContent className={'max-h-screen overflow-y-auto'}>
            <AddPageForm updatePagesList={updatePagesList} />
          </DialogContent>
        </Dialog>
      </div>

      <Input type={'text'}
             placeholder={t('searchPlaceholder')}
             className={'w-[200px] flex-shrink max-w-full max-[500px]:w-full'}
             value={searchWord}
             onChange={e => setSearchWord(e.target.value)}
      />

      <div className={'flex flex-col gap-5'}>
        {pagesState && pagesState.length > 0 ? (
          <>
            {pagesState.map((page) => (
              <PageCard page={page} key={page._id} updatePagesList={updatePagesList} />
            ))}
            {totalPages && totalDocuments && (
              <PageControl currentPage={currentPage} limit={limit} totalDocuments={totalDocuments}
                           setCurrentPage={setCurrentPage} totalPages={totalPages}
                           documentsLength={pagesState.length} />
            )}
          </>
        ) : (
          <div>{t('notFound')}</div>
        )}
      </div>
    </>
  );
}
