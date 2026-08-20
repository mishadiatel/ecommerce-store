import { Block, CategoriesSliderBlockData, HeroBlockData } from '@/types/blocks';
import dynamic from 'next/dynamic';
import CategoryCard from '@/components/blocks/categories/card/CategoryCard';
import { getPublicCategories } from '@/services/category';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

const SwiperSlider = dynamic(
  () => import('@/components/ui/slider/SwiperSlider')
);

interface HeroBlockProps {
  block: Block<HeroBlockData>;
}

export default async function HeroBlock({block}: HeroBlockProps) {

  return (
    <div className="slider-block style-one  w-full">
        <div className="slider-main h-full w-full main-page-slider">
             <SwiperSlider
                          sliderId={block._id}
                          className={'h-full relative'}
                          options={{
                            spaceBetween: 0,
                            slidesPerView: 1,
                            autoHeight: true,
                            pagination: {
                                el: `.swiper-pagination-${block._id}`,
                                clickable: true,
                            },
                            loop: true,
                            autoplay: {
                                delay: 4000,
                                disableOnInteraction: false,
                            },
                            speed: 800,
                          }}
                        >
            
                          <div className={'swiper-wrapper'}>
                           {block.blockData.items && block.blockData.items.length > 0 && block.blockData.items.map(item => (
                            <div className="swiper-slide" key={item._id}>
                                <div className="slider-item h-full w-full relative">
                                    <div className="container w-full h-full flex flex-col sm:flex-row items-center sm:gap-6 lg:gap-14 relative lg:py-[100px] sm:py-[74px] py-[24px]">
                                        <div className="text-content sm:basis-1/2">
                                        {item.title && <div className="text-display mb-3 lg:mb-6">{item.title}</div>}
                                        {item.text && <div className="text-sub-display mb-6 sm:mb-8 lg:mb-10">{item.text}</div>}
                                        {item.buttonLink && item.buttonText && (
                                            <Link href={item.buttonLink} className='button-main !hidden sm:!inline-flex'>{item.buttonText}</Link>
                                        )}
                                                                            </div>
                                        <div className="sub-img sm:basis-1/2 w-full relative">
                                            {item.image && item.title && (
                                                <Image src={item.image} alt={item.title} width={612} height={408} />
                                            )}
                                        
                                        </div>
                                                                        
                                        {item.buttonLink && item.buttonText && (
                                            <Link href={item.buttonLink} className='button-main flex w-full mt-16 sm:!hidden'>{item.buttonText}</Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                           ))}
                          </div>
                        <div className={`swiper-pagination swiper-pagination-${block._id}`}></div>
                        </SwiperSlider>
        </div>
    </div>
  )
}