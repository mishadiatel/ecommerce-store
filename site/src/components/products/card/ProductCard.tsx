'use client';
import { FullProductWithTranslations } from '@/types/product';
import Image from 'next/image';
import { generateFileUrl } from '@/lib/utils';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import ProductBages from '@/components/products/card/ProductBages';
import { useWishlistStore } from '@/stores/wishlistStore';


export default function ProductCard({ product }: { product: FullProductWithTranslations }) {
  const toggleWishlist = useWishlistStore(s => s.toggle);
  const isWishlistLoading = useWishlistStore(s => s.isLoading);
  const isInWishlist = useWishlistStore(
    s => s.ids.includes(product._id)
  );
  const t = useTranslations('Product');
  const router = useRouter();
  return (
    <div
      className="product-item grid-type"
      onClick={() => router.push(`/product/${product.slug}`)}
    >
      <div className="product-main cursor-pointer block">
        <div
          className="product-thumb bg-extra-light-gray bg-christmas relative overflow-hidden rounded-xl flex items-center justify-center w-full aspect-[296/400]">
         <ProductBages product={product} />
          <div className="list-action-right absolute top-3 right-3 z-[2]">
                <button
                  disabled={isWishlistLoading}
                  type={'button'}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleWishlist(product._id)
                  }}
                  className={`add-wishlist-btn w-9 h-9 flex items-center justify-center rounded-full bg-white duration-300 relative ${isInWishlist ? 'active' : ''}`}>
                    <i className="icon icon-favorites text-xl"></i>
                    <i className="icon icon-filled_like text-xl"></i>
                </button>
          </div>



            <div className="product-img flex justify-center items-center w-full h-full relative">
              {product.cardImage && (
                <Image
                  src={generateFileUrl(product.cardImage)}
                  alt={product.translations[0].title}
                  className="duration-700"
                  width={296}
                  height={400}
                />
              )}
              {product.isLimited && (
                <div
                  className="bg-semantic-orange absolute bottom-0 w-full flex items-center justify-center text-white text-[14px] leading-[17px] lg:text-[16px] lg:leading-[19px] p-[5px] font-bold min-h-[27px] sm:min-h-[40px]">
                  {t('limitedText')}
                </div>
              )}

            </div>



        </div>
        <div className="product-infor mt-3 lg:mt-4 ">
          {product.translations[0].title && (
            <Link href={`/product/${product.slug}`}
                  className="product-name duration-300 text-black line-clamp-2 text-base sm:text-lg lg:text-[22px] min-h-[48px] lg:min-h-[56px]">
              {product.translations[0].title}
            </Link>
          )}


          <div className="product-price-block flex items-center gap-2 justify-between mt-1 duration-300 relative z-[1]">
            <div className="flex flex-col">
              {product.oldPrice && (
                <div className="product-origin-price text-gray-30 text-sm lg:text-base">
                  <del>{product.oldPrice} {t('currencyUah')}</del>
                </div>
              )}
              {product.newPrice && (
                <div className={`product-price text-base lg:text-xl ${product.oldPrice ? 'text-semantic-red' : 'text-gray-90'} `}>
                  {product.newPrice} {t('currencyUah')}
                </div>
              )}

            </div>

            <button type="button" className="button-main bg-gray icon-button middle">
              <i className="icon icon-shopping-cart"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}