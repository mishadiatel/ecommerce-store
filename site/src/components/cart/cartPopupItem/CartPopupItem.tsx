import { CartItem } from '@/types/cart';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { generateFileUrl } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { Link } from '@/i18n/navigation';

export default function CartPopupItem({item}: {item: CartItem}) {
  const t = useTranslations();
  const removeItemFromCart = useCartStore(s => s.remove);
  return (
    <div className="prd_item flex justify-between gap-3 sm:gap-4">
      <Link href={`/product/${item.product.slug}`} target={'_blank'} className="flex gap-3 sm:gap-4">
        <div
          className="flex-shrink-0 w-[80px] h-[80px] p-1.5 rounded-lg overflow-hidden text-center bg-extra-light-gray">
          <Image
            src={generateFileUrl(item.product.cardImage)}
            alt={item.product.translations[0].title}
            width={51}
            height={68}
            className="max-w-full max-h-full block mx-auto"
          />

        </div>
        <div className="flex flex-col h-[80px] justify-between items-start">
          <div className="heading6 text-black line-clamp-2">{item.product.translations[0].title}</div>
          <div className="secondary-body text-gray-30 mt-2">{item.quantity}&nbsp;{t('Cart.itemsCountLabel')}</div>
        </div>
      </Link>

      <div className="flex flex-col justify-between items-end h-[80px]">
        <button type="button"
                className="button-main icon-button small bg-white swiper-no-swiping"
                onClick={() => removeItemFromCart(item.product._id)}
        ><i className="icon icon-x"></i>
        </button>

        <div className="caption1 text-gray-90 whitespace-nowrap">
          {item.product.newPrice} {t('Product.currencyUah')}
        </div>
      </div>
    </div>
  )
}