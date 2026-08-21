'use client';
import { GetItemsResponse } from '@/types/getItemsResponse';
import { FullProductWithTranslations } from '@/types/product';
import ProductGallery from '@/components/products/productGallery/ProductGallery';
import { useTranslations } from 'next-intl';
import { cleanHtmlString } from '@/lib/utils';
import { useState } from 'react';
import ProductInfoTabs from '@/components/products/productInfoTabs/ProductInfoTabs';
import dynamic from 'next/dynamic';
import ProductCard from '@/components/products/card/ProductCard';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { Link } from '@/i18n/navigation';

const SwiperSlider = dynamic(
  () => import('@/components/ui/slider/SwiperSlider')
);

interface ProductPageProps {
  sameCategoryProducts?: GetItemsResponse<FullProductWithTranslations>;
  productInfo: FullProductWithTranslations;
}

export default function ProductPage({ sameCategoryProducts, productInfo }: ProductPageProps) {
  const toggleWishlist = useWishlistStore(s => s.toggle);
  const isWishlistLoading = useWishlistStore(s => s.isLoading);
  const isInWishlist = useWishlistStore(
    s => s.ids.includes(productInfo._id)
  );
  const addToCart = useCartStore(s => s.add);
  const t = useTranslations('Product');
  const [count, setCount] = useState(1);

  // ── Варіанти ────────────────────────────────────────────────
  const variants = (productInfo.variants ?? []).filter(v => v.isActive !== false);
  const hasVariants = variants.length > 0;
  const [selectedSku, setSelectedSku] = useState<string | null>(
    hasVariants ? variants[0].sku : null,
  );
  const selectedVariant = hasVariants
    ? variants.find(v => v.sku === selectedSku) ?? variants[0]
    : null;

  const displayPrice = selectedVariant?.newPrice ?? productInfo.newPrice;
  const displayOldPrice = selectedVariant?.oldPrice ?? productInfo.oldPrice;
  // Залишок (stock) — інформаційне поле: показуємо тільки якщо > 0.
  const availableStock = selectedVariant
    ? selectedVariant.stock
    : (productInfo.stock ?? 0);
  // Купівлю блокує ТІЛЬКИ прапорець outOfStock (керується адміном).
  const outOfStock = selectedVariant
    ? selectedVariant.outOfStock === true
    : productInfo.outOfStock === true;

  const isAddedToCart = Boolean(useCartStore(s =>
    s.cart?.items.find(el =>
      el.product._id === productInfo._id &&
      (el.variantSku ?? null) === (selectedSku ?? null),
    ),
  ));

  return (
    <div className={'product-detail grouped style-grouped'}>
      <div className={'featured-product underwear filter-product-img pb-[112px] sm:pb-[128px] lg:pb-24'}>
        <div className={'container flex justify-between gap-y-4 flex-wrap'}>
          <div className={'list-img w-full lg:w-1/2 lg:pr-[16px]'}>
            <ProductGallery productInfo={productInfo} />
          </div>
          <div className={'product-infor w-full lg:w-1/2 lg:pl-[16px]'}>
            <div className="flex justify-between items-start gap-4">
              {productInfo.translations[0].title && (
                <h1 className="product-name heading1 font-bold">{productInfo.translations[0].title}</h1>
              )}

              <button
                disabled={isWishlistLoading}
                onClick={() => toggleWishlist(productInfo._id)}
                className={`add-wishlist-btn w-12 h-12 ml-auto flex-shrink-0 flex items-center justify-center cursor-pointer rounded-full bg-extra-light-gray duration-300 hover:bg-primary-green hover:text-white ${isInWishlist ? 'active' : ''}`}>
                <i className={`icon icon-favorites text-[32px]`}></i>
                <i className= {`icon icon-filled_like text-[32px]`}></i>
              </button>
            </div>
            {productInfo.isLimited && (
              <div
                className="bg-semantic-orange inline-block px-5 py-[10px] mt-2 sm:mt-3 lg:mt-4 mb-1 lg:mb-2 rounded-full font-bold text-white text-[14px] leading-[17px] lg:text-[16px] lg:leading-[19px]">
                {t('limitedText')}
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <i className="icon-message-text-alt text-[20px]"></i>
              <span
                className="caption1 text-gray-80">{t('reviewsCount', { count: Number(productInfo.reviewsCount) ?? 0 })}</span>
            </div>
            {productInfo.translations[0].shortDescription && (
              <div
                className="formated-text green-marked-link mt-4"
                dangerouslySetInnerHTML={{ __html: cleanHtmlString(productInfo.translations[0].shortDescription) }}
              ></div>
            )}
            <div className="list-action mt-4">
              <div>
                <div className="heading6 text-gray-90 mb-1">
                  {t('priceLabel')}
                </div>
                <div>
                  {displayOldPrice ? (
                    <>
                      <div className="product-price heading2 !text-semantic-red !font-medium inline-block">
                        {Number(displayPrice) * count} {t('currencyUah')}
                      </div>
                      <div className="product-origin-price inline-block heading3 !font-medium !text-gray-30 ml-2">
                        <del>{Number(displayOldPrice) * count} {t('currencyUah')}</del>
                      </div>
                    </>
                  ) : (
                    <div className="product-price heading2 inline-block !text-gray-90">
                      {Number(displayPrice) * count} {t('currencyUah')}
                    </div>
                  )}

                </div>
              </div>
              {count && count > 1 && (
                <div className="text-sm text-gray-80 mt-3 md:mt-4">
                  <div>
                    {t('countMessage', { count: count })}
                  </div>
                  <div>{t('priceMessage', { price: `${displayPrice} ${t('currencyUah')}` })}</div>
                </div>
              )}

              {/* ── Варіанти ─────────────────────────────────── */}
              {hasVariants && (
                <div className="mt-4">
                  <div className="heading6 mb-2">{t('variantLabel')}</div>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => {
                      const isSelected = v.sku === selectedSku;
                      const isDisabled = v.outOfStock === true;
                      return (
                        <button
                          key={v.sku}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            setSelectedSku(v.sku);
                            setCount(1);
                          }}
                          className={[
                            'px-4 py-2 rounded-full border text-sm transition-colors',
                            isSelected
                              ? 'bg-primary-green text-white border-primary-green'
                              : 'bg-extra-light-gray border-transparent hover:border-primary-green',
                            isDisabled ? 'opacity-40 cursor-not-allowed line-through' : '',
                          ].join(' ')}
                        >
                          {v.name || v.attributes.map(a => a.value).join(' / ') || v.sku}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Наявність ────────────────────────────────── */}
              {outOfStock ? (
                <div className="mt-3 text-sm">
                  <span className="text-semantic-red font-semibold">
                    {t('outOfStock')}
                  </span>
                </div>
              ) : availableStock > 0 ? (
                <div className="mt-3 text-sm">
                  <span className="text-primary-green font-semibold">
                    {t('inStock', { count: availableStock })}
                  </span>
                </div>
              ) : null}

              <div className="heading6 mt-4">
                {t('countLabel')}
              </div>

              <div className="choose-quantity flex items-center max-xl:flex-wrap gap-4 mt-3">
                <div
                  className="quantity-block flex items-center justify-between rounded-full bg-extra-light-gray w-[148px] flex-shrink-0 px-2">
                  <button
                    className="flex items-center justify-center w-[54px] h-[54px] cursor-pointer"
                    type="button"
                    onClick={() => {
                      if (count > 1) {
                        setCount(prevState => prevState - 1);
                      }
                    }}
                  >
                    <i className='icon-minus'></i>
                  </button>
                  <div className="quantity heading4 font-semibold">{count}</div>
                  <button
                    className="flex items-center justify-center w-[54px] h-[54px] cursor-pointer"
                    type="button"
                    onClick={() => setCount(prevState => prevState + 1)}
                  >
                    <i className="icon-plus"></i>
                  </button>
                </div>
                {isAddedToCart ? (
                  <Link href={'/cart'} className={'button-main whitespace-nowrap w-full lg:w-fit text-center'}>{t('cartLinkText')}</Link>
                  ) : (
                  <button
                    className="add-cart-btn button-main whitespace-nowrap w-full lg:w-fit text-center disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={outOfStock}
                    onClick={() => addToCart(productInfo._id, count, selectedSku)}
                  >
                    {t('cartButtonText')}
                  </button>
                )}
              </div>
            </div>
            <ProductInfoTabs productInfo={productInfo} />
            {sameCategoryProducts?.data && sameCategoryProducts?.data.length > 0 && (
              <div className={'list-product hide-product-sold menu-main mt-6'}>
                <div className={'heading4 pb-5 lg:pb-8'}>{t('otherInThisCategory')}</div>
                <div className={'list-collection relative '}>
                  <SwiperSlider
                    sliderId={`same-category-${productInfo._id}`}
                    className={'swiper-product-scroll h-full relative mb-6'}
                    options={{
                      scrollbar: {
                        el: `.same-category-${productInfo._id}-scrollbar`,
                        hide: true,
                        draggable: true
                      },
                      loop: false,
                      slidesPerView: 2,
                      spaceBetween: 16,
                      navigation: {
                        nextEl: `.same-category-${productInfo._id}-button-next`,
                        prevEl: `.same-category-${productInfo._id}-button-prev`,
                      },
                      breakpoints: {
                        640: {
                          slidesPerView: 3,
                          spaceBetween: 20,
                        },
                        1024: {
                          slidesPerView: 3,
                          spaceBetween: 20,
                        },
                      },
                    }}
                  >
                    <div className={'swiper-wrapper'}>
                      {sameCategoryProducts.data.filter(el => el._id !== productInfo._id).map(product => (
                        <div className={'swiper-slide'} key={`same-category-product-${product._id}`}>
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                    <div
                      className={`same-category-${productInfo._id}-scrollbar swiper-scrollbar !bg-transparent`}></div>
                  </SwiperSlider>
                  <button
                    className={`same-category-${productInfo._id}-button-prev button-main icon-button middle bg-gray !border-none absolute top-[unset] lg:top-[-69px] translate-y-0 left-[calc(50%-60px)] lg:left-[unset] lg:right-20`}
                   >
                    <i className="icon icon-chevron-right-1"></i>
                  </button>
                  <button
                    className={`same-category-${productInfo._id}-button-next button-main icon-button middle bg-gray !border-none absolute top-[unset] lg:top-[-69px] translate-y-0 right-[calc(50%-60px)] lg:right-4`}>
                    <i className="icon icon-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}