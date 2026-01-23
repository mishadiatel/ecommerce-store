'use client'

import { useState, useEffect } from 'react';
import { Block, StickyCardBlockData } from '@/types/blocks';
import Image from 'next/image';
import { generateFileUrl } from '@/lib/utils';
import dynamic from 'next/dynamic';

const SwiperSlider = dynamic(
  () => import('@/components/ui/slider/SwiperSlider')
);

interface StickeCardsBlockProps {
  block: Block<StickyCardBlockData>;
}

export default function StickeCardsBlock({ block }: StickeCardsBlockProps) {
  const [isMobile, setIsMobile] = useState(false);
  const {blockData} = block;
  const sliderId = block._id;

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 1024);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div className="my-[64px] sm:my-[80px] lg:my-[100px]">
      <div className="container">
        <div className="flex flex-wrap items-stretch">
          {/* LEFT COLUMN */}
          <div className="w-full lg:max-w-[437px] lg:pr-12 pb-12 lg:pb-0">
            <h2 className="heading1 text-center lg:text-left lg:sticky lg:top-20 whitespace-pre-line">
              {blockData.title}
            </h2>
          </div>

          {/* RIGHT COLUMN */}
          <div className="relative w-full lg:w-[calc(100%-438px)]">
            {isMobile ? (
              <SwiperSlider options={{
                slidesPerView: 1,
                autoHeight: true,
                navigation: {
                  prevEl: `.slider-prev-button-${sliderId}`,
                  nextEl: `.slider-next-button-${sliderId}`,
                }
              }}
              sliderId={sliderId}
              className={'features-slider'}
              >
                <div className={'swiper-wrapper'}>
                  {blockData.items.map((item) => (
                    <div key={item._id} className={'swiper-slide'}>
                      <FeatureCard item={item} />
                    </div>
                  ))}
                </div>
                <button className={`slider-prev-button-${sliderId} absolute z-[2] mobile-gray-swiper-button bottom-0 left-[calc(50%-60px)] lg:hidden button-main small icon-button bg-white`}>
                  <i className="icon icon-chevron-right-1"></i>
                </button>

                <button className={`slider-next-button-${sliderId} absolute z-[2] mobile-gray-swiper-button bottom-0 right-[calc(50%-60px)] lg:hidden button-main small icon-button bg-white`}>
                  <i className="icon icon-chevron-right"></i>
                </button>
              </SwiperSlider>
            ) : (
              <div className="flex flex-col gap-6 features-slider">
                {blockData.items.map((item) => (
                  <FeatureCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ item }: { item: { _id: string; title: string; text: string; icon: string; order: number } }) {
  return (
    <div className="flex gap-6 sm:gap-8 flex-col sm:flex-row p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-green-50">
      <Image
        src={generateFileUrl(item.icon)}
        alt=""
        width={64}
        height={64}
        className="min-w-16 w-16 h-auto max-h-16"
      />

      <div className="formatted-text info-block-v4">
        <h3>{item.title}</h3>
        <p>{item.text}</p>
      </div>
    </div>
  );
}