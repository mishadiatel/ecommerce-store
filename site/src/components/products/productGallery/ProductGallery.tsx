import { FullProductWithTranslations } from '@/types/product';
import Image from 'next/image';
import { generateFileUrl } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

interface ProductGalleryProps {
  productInfo: FullProductWithTranslations;
}

export default function ProductGallery({productInfo}: ProductGalleryProps) {
  const bigSwiperRef = useRef<Swiper | null>(null);
  const thumbSwiperRef = useRef<Swiper | null>(null);

  const bigContainerRef = useRef<HTMLDivElement>(null);
  const thumbContainerRef = useRef<HTMLDivElement>(null);

  // Синхронізація активного thumb класу
  function updateActiveThumb(index: number) {
    if (!thumbContainerRef.current) return;
    const slides = thumbContainerRef.current.querySelectorAll('.swiper-slide');
    slides.forEach(slide => slide.classList.remove('swiper-slide-thumb-active'));
    if (slides[index]) {
      slides[index].classList.add('swiper-slide-thumb-active');
      // Прокручуємо thumb, щоб активний був видимим
      thumbSwiperRef.current?.slideTo(index);
    }
  }

  useEffect(() => {
    if (
      !bigContainerRef.current ||
      !thumbContainerRef.current ||
      bigSwiperRef.current
    ) return;

    // Ініціалізація великого слайдера
    bigSwiperRef.current = new Swiper(bigContainerRef.current, {
      modules: [Navigation],
      slidesPerView: 1,
      spaceBetween: 16,
      navigation: {
        nextEl: `.big_${productInfo._id}-button-next`,
        prevEl: `.big_${productInfo._id}-button-prev`,
      },
      on: {
        slideChange: () => {
          const activeIndex = bigSwiperRef.current?.activeIndex ?? 0;
          updateActiveThumb(activeIndex);
        },
      },
    });

    // Ініціалізація маленького слайдера
    thumbSwiperRef.current = new Swiper(thumbContainerRef.current, {
      slidesPerView: 4,
      spaceBetween: 8,
      freeMode: true,
      watchSlidesProgress: true,
    });

    // Додаємо обробники кліку по маленьких слайдах
    thumbContainerRef.current.querySelectorAll('.swiper-slide').forEach((slide, idx) => {
      slide.addEventListener('click', () => {
        bigSwiperRef.current?.slideTo(idx);
      });
    });

    // Поставити активний клас на перший слайд
    updateActiveThumb(0);

    return () => {
      bigSwiperRef.current?.destroy(true, true);
      thumbSwiperRef.current?.destroy(true, true);
      bigSwiperRef.current = null;
      thumbSwiperRef.current = null;
    };
  }, [productInfo._id, productInfo.images]);
  return (
    <>
      {productInfo.images && productInfo.images.length > 0 && (
        <div className={'sticky'}>
          <div ref={bigContainerRef}
               className="swiper mySwiper4 rounded-2xl bg-extra-light-gray py-4 px-4 overflow-hidden style-small-border">
            <div className="swiper-wrapper">
              {productInfo.images.map(img => (
                <div key={`big_${img}`} className="swiper-slide popup-link">
                  <Image src={generateFileUrl(img)} alt={img} width={500} height={500} className={'mx-auto'} />
                </div>
              ))}
            </div>
            <div
              className={`big_${productInfo._id}-button-prev swiper-button-prev2 button-main icon-button small bg-white !border-none shadow-[0px_0px_8px_0px_rgba(115,115,115,0.05)] left-4 !lg:hidden`}>
              <i className="icon icon-chevron-right-1"></i>
            </div>
            <div
              className={`big_${productInfo._id}-button-next swiper-button-next2 button-main icon-button small bg-white !border-none shadow-[0px_0px_8px_0px_rgba(115,115,115,0.05)] right-4 !lg:hidden`}>
              <i className="icon icon-chevron-right"></i>
            </div>
          </div>

          <div ref={thumbContainerRef} className="swiper mySwiper3 mt-4">
            <div className="swiper-wrapper">
              {productInfo.images.map(img => (
                <div key={`small_${img}`} className="swiper-slide cursor-pointer opacity-50">
                  <Image src={generateFileUrl(img)} alt={img} width={76} height={76} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>

  )
}