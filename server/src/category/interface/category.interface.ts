export interface CategoryTranslation {
  _id: string;
  categoryId: string;
  lang: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface FullCategoryWithTranslation {
  _id: string;
  slug: string;
  image: string;
  backgroundColor: string;
  isVisible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  translations: CategoryTranslation[];
}
