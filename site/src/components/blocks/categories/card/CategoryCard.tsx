'use client';

import { FullCategoryWithTranslation } from '@/types/category';
import { Link, useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { generateFileUrl } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export default function CategoryCard({category}: {category: FullCategoryWithTranslation}) {
  const router = useRouter();
  const t = useTranslations('Categories');
  return (
    <div
      className="category-item cursor-pointer"
      style={{backgroundColor: category.backgroundColor}}
      onClick={() => router.push(`/products/${category.slug}`)}
    >
      <div className="category-item__title-wrap">
        <Link href={`/products/${category.slug}`}><span className="category-item__title">{category.translations[0].name}</span></Link>
        <button className="button-main bg-white icon-button category-item__button-mobile">
          <i className="icon icon-arrow-right-small"></i>
        </button>
      </div>
      <Image src={generateFileUrl(category.image)} alt={'category image'} className={'category-item__image'} width={456} height={364} />
      <div className="button-main bg-white category-item__button-desktop">
        {t('cardButtonText')}
      </div>
    </div>
  )
}