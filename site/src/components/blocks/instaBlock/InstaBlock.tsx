import { Block, InstaBlockData } from '@/types/blocks';
import Image from 'next/image';
import { generateFileUrl } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { getGeneralSettings } from '@/services/generalSettings';
import { getLocale } from 'next-intl/server';

interface InstaBlockProps {
  block: Block<InstaBlockData>;
}

const SwiperSlider = dynamic(
  () => import('@/components/ui/slider/SwiperSlider')
);

export default async function InstaBlock({block}: InstaBlockProps) {
  const locale = await getLocale();
  const {blockData} = block;
 const settings = await getGeneralSettings(locale);
 const sliderId = block._id;
  return (
    <div className="instagram-block my-[64px] sm:my-[80px] lg:my-[100px]">
      <div className="">
        {blockData.title && (
          <div className="container">
            <h2 className="heading1 text-center mb-[32px] sm:mb-[40px] lg:mb-[48px]">{blockData.title}</h2>
          </div>
        )}

        <div className="list-instagram overflow-hidden">
          <SwiperSlider options={{
            loop: true,
            autoplay: {
              delay: 4000,
              disableOnInteraction: false,
            },
            freeMode: true,
            pagination: {
              el: `.swiper-pagination-${sliderId}`,
              clickable: true
            },
            slidesPerView: 'auto',
            spaceBetween: 8,
            breakpoints: {
              1024: {
                spaceBetween: 24,
              },
            }
          }}
          sliderId={sliderId}
          className={'!pb-9 sm:!pb-11'}
          >
            <div className={'swiper-wrapper'}>
              {blockData.items && blockData.items.length > 0 && blockData.items.map((slide) => (
                <div className={'swiper-slide'}
                  key={slide._id}>
                  {settings?.instagram ? (
                    <Link
                      href={settings.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="item relative block overflow-hidden rounded-[16px] w-full min-h-[215px] lg:min-h-[300px]"
                    >
                      <Image
                        src={generateFileUrl(slide.image)}
                        alt=""
                        width={240}
                        height={300}
                        className="duration-500"
                      />

                      <span className="icon w-[34px] h-[34px] lg:w-12 lg:h-12 bg-white hover:bg-primary-green duration-500 flex items-center justify-center rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">
                      <span className="icon icon-instagram text-[20px] lg:text-[28px] text-primary-green" />
                    </span>
                    </Link>
                  ) : (
                    <div className="relative w-full min-h-[215px] lg:min-h-[300px] rounded-[16px] overflow-hidden">
                      <Image
                        src={generateFileUrl(slide.image)}
                        alt=""
                        width={240}
                        height={300}
                        className="object-cover duration-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className={`swiper-pagination swiper-pagination-${sliderId}`}></div>
          </SwiperSlider>
        </div>
      </div>
    </div>
  )
}