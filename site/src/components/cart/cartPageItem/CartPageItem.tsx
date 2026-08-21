'use client'

import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from '@/types/cart';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { debounce, generateFileUrl } from '@/lib/utils';
import { useMemo, useState } from 'react';

export default function CartPageItem({item}: {item: CartItem}) {
  const t = useTranslations();
  const removeItemFromCart = useCartStore(s => s.remove);
  const updateItemQuantity = useCartStore(s => s.update);
  const [quantity, setQuantity] = useState<number>(item.quantity);

  const debouncedUpdateQuantity = useMemo(
    () => debounce(updateItemQuantity, 400),
    []
  );

  return (
    <div
      className="cart-item mb-5 lg:mb-4 pb-5 lg:pb-4 last:pb-0 last:mb-0 border-b border-b-gray-20 last:border-b-0 ">
      <div
        className="grid lg:grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-2 max-lg:gap-3 lg:h-[80px] lg:items-center max-lg:grid-cols-[auto_1fr_auto] max-lg:grid-rows-2">
        <Link href={`/product/${item.product.slug}`} target={'_blank'}
           className="flex-shrink-0 w-[80px] h-[80px] max-lg:h-[106px] flex items-center max-lg:row-span-2 p-1.5 rounded-lg overflow-hidden text-center bg-extra-light-gray">
          <Image
            src={generateFileUrl(item.product.cardImage)}
            alt={item.product.translations[0].title}
            width={51}
            height={68}
            className="max-w-full max-h-full block mx-auto"
          />
        </Link>
        <div className="flex flex-col gap-1 h-fit">
          <Link href={`/product/${item.product.slug}`} target={'_blank'}
             className="heading6 text-black line-clamp-3 max-lg:line-clamp-2 break-all">
            {item.product.translations[0].title}</Link>
          {item.variantName && (
            <span className="caption1 text-gray-80">{item.variantName}</span>
          )}
        </div>

        <div
          className="flex justify-center flex-wrap items-center text-center gap-1 max-lg:hidden">
          {(item.effectiveOldPrice ?? item.product.oldPrice) ? (
            <>
              <div
                className="caption1 text-gray-30 whitespace-nowrap line-through js--cart-item-price-old">
                {(item.effectiveOldPrice ?? item.product.oldPrice)} {t('Product.currencyUah')}
              </div>
              <div className="caption1 whitespace-nowrap js--cart-item-price text-semantic-red ">
                {(item.effectivePrice ?? item.product.newPrice)} {t('Product.currencyUah')}
              </div>
            </>
          ) : (
            <div className="caption1 text-gray-90 whitespace-nowrap">{(item.effectivePrice ?? item.product.newPrice)} {t('Product.currencyUah')}</div>
          )}

        </div>

        <div
          className="flex items-center justify-center max-lg:order-5 max-lg:items-end max-lg:justify-start">
          <div
            className="quantity-block bg-extra-light-gray flex items-center justify-between rounded-full">
            <button
              className="flex h-[42px] w-[42px] justify-center items-center cursor-pointer"
              type="button"
              onClick={() => {
                setQuantity(prevQuantity => {
                  if(prevQuantity > 1) {
                    debouncedUpdateQuantity(item.product._id, prevQuantity - 1, item.variantSku ?? null)
                    return prevQuantity - 1;
                  }
                  return prevQuantity;
                })
              }}
            >
              <i className="icon icon-minus text-base max-md:text-sm"></i>
            </button>
            <div className="text-button quantity js--quantity-text">{quantity}</div>
            <button
              className="flex h-[42px] w-[42px] justify-center items-center cursor-pointer"
              type="button"
              onClick={() => {
                setQuantity(prevQuantity => {
                  debouncedUpdateQuantity(item.product._id, prevQuantity + 1, item.variantSku ?? null)
                  return prevQuantity + 1;
                })
              }}
            >
              <i className="icon icon-plus text-base max-md:text-sm"></i>
            </button>
          </div>
        </div>
        <div
          className="flex justify-center flex-wrap items-center text-center gap-1 max-lg:justify-end max-lg:items-end max-lg:flex-col max-lg:order-6">
          {(item.effectiveOldPrice ?? item.product.oldPrice) ? (
            <>
              <div
                className="caption1 text-gray-30 whitespace-nowrap line-through js--cart-item-price-old">
                {(item.effectiveOldPrice ?? item.product.oldPrice) * quantity} {t('Product.currencyUah')}
              </div>
              <div className="caption1 whitespace-nowrap js--cart-item-price text-semantic-red ">
                {(item.effectivePrice ?? item.product.newPrice)  * quantity} {t('Product.currencyUah')}
              </div>
            </>
          ) : (
            <div className="caption1 text-gray-90 whitespace-nowrap">{(item.effectivePrice ?? item.product.newPrice) * quantity} {t('Product.currencyUah')}</div>
          )}
        </div>

        <div
          className="flex justify-center items-center max-lg:order-4 max-lg:justify-end max-lg:items-start">
          <button
            type="button"
            className="button-main icon-button small bg-white"
            onClick={() => removeItemFromCart(item.product._id, item.variantSku ?? null)}
          ><i className="icon icon-x"></i>
          </button>
        </div>
      </div>
    </div>

  )
}