export interface VariantAttribute {
  name: string;
  value: string;
}

export interface ProductVariant {
  _id?: string;
  sku: string;
  name?: string;
  attributes: VariantAttribute[];
  newPrice: number;
  oldPrice?: number;
  stock: number;
  outOfStock?: boolean;
  isActive: boolean;
  image?: string;
}

export interface Product {
  _id: string;
  categoryId: string;

  slug: string;
  cardImage: string;
  images: string[];

  newPrice: number;
  oldPrice?: number;
  discountPercents?: number;

  reviewsCount?: number;

  isNew: boolean;
  isLimited: boolean;
  isOnSale: boolean;
  isOnePlusOne: boolean;
  isVisible: boolean;

  order: number;

  stock?: number;
  outOfStock?: boolean;
  variants?: ProductVariant[];

  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductTranslation {
  _id: string;
  productId: string;
  lang: string;
  title: string;
  shortDescription?: string;
  longDescription?: string;
  composition?: string;
  expiration?: string;
  nutritionalTable?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface FullProductWithTranslations {
  _id: string;
  categoryId: string;

  slug: string;
  cardImage: string;
  images: string[];

  newPrice: number;
  oldPrice?: number;
  discountPercents?: number;

  reviewsCount: number;

  isNew: boolean;
  isLimited: boolean;
  isOnSale: boolean;
  isOnePlusOne: boolean;
  isVisible: boolean;

  order: number;

  stock?: number;
  outOfStock?: boolean;
  variants?: ProductVariant[];

  createdAt: string;
  updatedAt: string;
  __v: number;

  translations: ProductTranslation[];
}
