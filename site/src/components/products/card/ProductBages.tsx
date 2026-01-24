import { FullProductWithTranslations } from '@/types/product';
import { useTranslations } from 'next-intl';

export default function ProductBages({product}: {product: FullProductWithTranslations}) {
  const t = useTranslations('Product');
  return (
    <>
      {(product.isNew || product.isOnSale || product.isOnePlusOne) && (
        <div className="absolute top-3 left-3 z-[1] flex gap-2 flex-wrap">
          {product.isOnSale && (
            <div
              className="product-tag !text-white text-sm uppercase px-3 py-1 lg:px-5 lg:py-1.5 inline-block rounded-full bg-semantic-red">
              {t('saleText')}
            </div>
          )}
          {product.isNew && (
            <div
              className="product-tag !text-white text-sm uppercase px-3 py-1 lg:px-5 lg:py-1.5 inline-block rounded-full bg-blue">
              {t('newText')}
            </div>
          )}
          {product.isOnePlusOne && (
            <div
              className="product-tag !text-white text-sm uppercase px-3 py-1 lg:px-5 lg:py-1.5 inline-block rounded-full bg-primary-green">
              1+1=3
            </div>
          )}

        </div>
      )}
    </>
  )
}