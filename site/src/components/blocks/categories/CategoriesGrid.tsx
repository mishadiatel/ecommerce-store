import CategoryCard from '@/components/blocks/categories/card/CategoryCard';
import { getPublicCategories } from '@/services/category';
import { getLocale } from 'next-intl/server';


export default async function CategoriesGridBlock() {
  const locale = await getLocale()
  const categories = await getPublicCategories(locale);
  return (
    <div className="my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {categories && categories.length > 0 && categories.map(category => (
            <div className={'swiper-slide'} key={category._id}>
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}