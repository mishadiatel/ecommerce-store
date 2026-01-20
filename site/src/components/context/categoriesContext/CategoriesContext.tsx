'use client';

import { createContext, useContext } from 'react';
import { FullCategoryWithTranslation } from '@/types/category';

const CategoriesContext = createContext<FullCategoryWithTranslation[] | null>(null);

export const useCategories = () => {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error('CategoriesContext missing');
  return ctx;
};

export const CategoriesProvider = ({
                                   categories,
                                   children,
                                 }: {
  categories: FullCategoryWithTranslation[];
  children: React.ReactNode;
}) => (
  <CategoriesContext.Provider value={categories}>
    {children}
  </CategoriesContext.Provider>
);
