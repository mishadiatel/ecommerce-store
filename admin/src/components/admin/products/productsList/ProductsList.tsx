import { useEffect, useRef, useState } from 'react';

import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogTrigger } from '@/components/admin/shadcnuiComponents/dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import PageControl from '@/components/admin/ui/pageControl';

import { FullProductWithTranslations } from '@/types/product';
import { getAdminProducts } from '@/services/product';
import ProductCard from '@/components/admin/products/card/ProductCard';
import CreateProductForm from '@/components/admin/products/forms/CreateProductForm';
import { getAllAdminCategories } from '@/services/category';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/shadcnuiComponents/select';

export default function ProductsList() {
  const isFirstRender = useRef(true);
  const [productsState, setProductsState] = useState<FullProductWithTranslations[] | undefined>([]);
  const [categoriesList, setCategoriesList] = useState<Array<{_id: string, text: string}>>([]);
  const [searchWord, setSearchWord] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [totalDocuments, setTotalDocuments] = useState<number | undefined>(undefined);
  const [limit, setLimit] = useState<number>(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const updateProductsList = () => {
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

    if(selectedCategory && selectedCategory !== 'all') {
      query.category = selectedCategory;
    }
    getAdminProducts(query).then((pagesResult) => {
      setProductsState(pagesResult?.data);
      setTotalPages(pagesResult?.totalPages);
      setTotalDocuments(pagesResult?.totalDocuments);
    }).catch((err) => {
      toast.error('error loading products.');
    });
  };

  useEffect(() => {
    getAllAdminCategories().then(data => {
      if(data && data.length > 0) {
        const categoriesArray = data.map(el => ({
          _id: el._id,
          text: el.translations[0].name
        }));
        setCategoriesList(categoriesArray)
      }
    })
  }, []);

  useEffect(() => {
    updateProductsList();
  }, [currentPage, selectedCategory]);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateProductsList();
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchWord]);

  return (
    <>
      <div className={'w-fit'}>
        <Dialog>
          <DialogTrigger className={'w-fit'} asChild>
            <Button>Add product</Button>
          </DialogTrigger>
          <DialogContent className={'max-w-[1000px] sm:max-w-[1000px] max-h-screen overflow-y-auto'}>
            <CreateProductForm updateProductsList={updateProductsList} categoriesList={categoriesList} />
          </DialogContent>
        </Dialog>
      </div>

      <div className={'flex gap-4 items-center'}>
        <Input type={'text'}
                placeholder={'Search...'}
                className={'w-[200px] flex-shrink max-w-full max-[500px]:w-full'}
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
      />
        {categoriesList && categoriesList?.length > 0 && (
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All categories
              </SelectItem>

              {categoriesList.map((category) => (
                <SelectItem
                  key={category._id}
                  value={category._id}
                >
                  {category.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className={'flex flex-col gap-5'}>
        {productsState && productsState.length > 0 ? (
          <>
            {productsState.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                updateProductList={updateProductsList}
                categoriesList={categoriesList}
              />
            ))}
            {totalPages && totalDocuments && (
              <PageControl currentPage={currentPage} limit={limit} totalDocuments={totalDocuments}
                           setCurrentPage={setCurrentPage} totalPages={totalPages}
                           documentsLength={productsState.length} />
            )}
          </>
        ) : (
          <div>not found products</div>
        )}
      </div>
    </>
  );
}