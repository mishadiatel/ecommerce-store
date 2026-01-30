'use client'

import { useWishlistStore } from '@/stores/wishlistStore';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Loader from '@/components/ui/loader/Loader';
import ProductCard from '@/components/products/card/ProductCard';

export default function WishlistList() {
  const isLoadingWishlist = useWishlistStore(s => s.isLoading);
  const wishlistItems = useWishlistStore(s => s.items)
  const t = useTranslations('Wishlist');
  return (
    <div className="shop-product breadcrumb1 my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
      <div className="container">
        <div className="flex max-md:flex-wrap gap-y-8">
          <div className="list-product-block style-grid w-full">
            {isLoadingWishlist ? (
              <div className={'w-full flex justify-center items-center mb-5 sm:mb-6 lg:mb-8'}>
                <Loader />
              </div>
            ) : (
              <>
                {wishlistItems && wishlistItems.length > 0 ? (
                  <div
                    className="list-product1 hide-product-sold grid sm:grid-cols-3 lg:grid-cols-4 grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-5 sm:mb-6 lg:mb-8">
                    {wishlistItems.map((product) => (
                      <ProductCard product={product} key={product._id} />
                    ))}
                  </div>
                ) : (
                  <div
                    className="font-semibold lg:font-bold text-center text-xl sm:text-[22px] lg:text-[32px] mb-5 sm:mb-6 lg:mb-8">
                    {t('emptyWishlistMessage')}
                  </div>
                )}
              </>
            )}
            <div className="flex flex-col items-center gap-8">
              <Link className="button-main w-full sm:w-fit" href={'/products'}>{t('catalogButtonText')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}