import { Block, CategoriesSliderBlockData } from '@/types/blocks';
import dynamic from 'next/dynamic';
import CategoryCard from '@/components/blocks/categories/card/CategoryCard';
import { getPublicCategories } from '@/services/category';
import { getLocale } from 'next-intl/server';

const SwiperSlider = dynamic(
  () => import('@/components/ui/slider/SwiperSlider')
);

interface CategoriesSliderBlockProps {
  block: Block<CategoriesSliderBlockData>;
}

export default async function CategoriesSlider({block}: CategoriesSliderBlockProps) {
  const locale = await getLocale()
  const categories = await getPublicCategories(locale);
  return (
    <div className="my-[64px] sm:my-[80px] lg:my-[100px] overflow-x-hidden">
      <div className="container">
        {block.blockData.title && (
          <div className="heading1 text-center mb-[32px] sm:mb-[40px] lg:mb-[48px]">
            {block.blockData.title}
          </div>
        )}
        {categories && categories.length > 0 && (
          <div
            className="list-categories hide-product-sold relative pb-[72px] lg:pb-4 section-swiper-navigation style-outline style-small-border ">
            <button className={`slider-categories-button-prev-${block._id} absolute z-[2] mobile-gray-swiper-button bottom-0 left-[calc(50%-60px)] lg:bottom-auto lg:-left-[20px] lg:top-1/2 button-main small icon-button bg-white`}>
              <i className="icon icon-chevron-right-1"></i>
            </button>
            <SwiperSlider
              sliderId={block._id}
              className={'h-full relative js--slider-categories !p-4 !lg:p-6 !-m-4 !lg:-m-6 !max-sm:overflow-visible'}
              options={{
                navigation: {
                  prevEl: `.slider-categories-button-prev-${block._id}`,
                  nextEl: `.slider-categories-button-next-${block._id}`,
                },
                slidesPerView: 1,
                spaceBetween: 16,
                breakpoints: {
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 24,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 32
                  }

                }
              }}
            >

              <div className={'swiper-wrapper'}>
                {categories.map(category => (
                  <div className={'swiper-slide'} key={category._id}>
                    <CategoryCard category={category} />
                  </div>
                ))}
              </div>

            </SwiperSlider>
            <button className={`slider-categories-button-next-${block._id} absolute z-[2] mobile-gray-swiper-button bottom-0 right-[calc(50%-60px)] lg:bottom-auto lg:-right-[20px] lg:top-1/2 button-main small icon-button bg-white`}>
              <i className="icon icon-chevron-right"></i>
            </button>
          </div>
        )}

      </div>
    </div>
  )
}