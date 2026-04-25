import { useEffect, useRef, useState } from 'react';

import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { FullCategoryWithTranslation } from '@/types/category';
import { getAdminCategories } from '@/services/category';
import { Dialog, DialogContent, DialogTrigger } from '@/components/admin/shadcnuiComponents/dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import PageControl from '@/components/admin/ui/pageControl';
import CategoryCard from '@/components/admin/category/card/CategoryCard';
import CreateCategoryForm from '@/components/admin/category/forms/CreateCategoryForm';

export default function CategoriesList() {
  const t = useTranslations('categories');
  const isFirstRender = useRef(true);
  const [categoriesState, setCategoriesState] = useState<FullCategoryWithTranslation[] | undefined>([]);
  const [searchWord, setSearchWord] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [totalDocuments, setTotalDocuments] = useState<number | undefined>(undefined);
  const [limit, setLimit] = useState<number>(10);

  const updateCategoriesList = () => {
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
    getAdminCategories(query).then((pagesResult) => {
      setCategoriesState(pagesResult?.data);
      setTotalPages(pagesResult?.totalPages);
      setTotalDocuments(pagesResult?.totalDocuments);
    }).catch((err) => {
      toast.error(t('toast.loadError'));
    });
  };

  useEffect(() => {
    updateCategoriesList();
  }, [currentPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateCategoriesList();
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchWord]);

  return (
    <>
      <div className={'w-full sm:w-fit'}>
        <Dialog>
          <DialogTrigger className={'w-full sm:w-fit'} asChild>
            <Button className={'w-full sm:w-auto'}>{t('addButton')}</Button>
          </DialogTrigger>
          <DialogContent className={'w-[calc(100%-1.5rem)] max-w-[1000px] sm:max-w-[1000px] max-h-screen overflow-y-auto'}>
            <CreateCategoryForm updateCategoriesList={updateCategoriesList} />
          </DialogContent>
        </Dialog>
      </div>

      <div className={'admin-filters'}>
        <div className={'admin-filter-search'}>
          <Input type={'text'}
                 placeholder={t('searchPlaceholder')}
                 value={searchWord}
                 onChange={e => setSearchWord(e.target.value)}
          />
        </div>
      </div>

      <div className={'flex flex-col gap-5'}>
        {categoriesState && categoriesState.length > 0 ? (
          <>
            {categoriesState.map((category) => (
              <CategoryCard category={category} key={category._id} updateCategoriesList={updateCategoriesList} />
            ))}
            {totalPages && totalDocuments && (
              <PageControl currentPage={currentPage} limit={limit} totalDocuments={totalDocuments}
                           setCurrentPage={setCurrentPage} totalPages={totalPages}
                           documentsLength={categoriesState.length} />
            )}
          </>
        ) : (
          <div>{t('notFound')}</div>
        )}
      </div>
    </>
  );
}
