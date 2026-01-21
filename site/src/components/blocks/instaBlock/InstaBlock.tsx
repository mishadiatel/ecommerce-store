'use client'

import { InstaBlockData } from '@/types/blocks';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useSettings } from '@/components/context/generalSettings/GeneralSettingsContext';
import Image from 'next/image';
import { Autoplay, FreeMode, Pagination } from 'swiper/modules';
import { generateFileUrl } from '@/lib/utils';

interface InstaBlockProps {
  blockData: InstaBlockData;
}

export default function InstaBlock({blockData}: InstaBlockProps) {
 const settings = useSettings();
  return (
    <div className="instagram-block my-[64px] sm:my-[80px] lg:my-[100px]">
      <div className="">
        {blockData.title && (
          <div className="container">
            <h2 className="heading1 text-center mb-[32px] sm:mb-[40px] lg:mb-[48px]">{blockData.title}</h2>
          </div>
        )}

        <div className="list-instagram overflow-hidden">
          <Swiper
            modules={[Autoplay, Pagination, FreeMode]}
            loop
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            freeMode
            pagination={{ clickable: true }}
            slidesPerView="auto"
            spaceBetween={8}
            breakpoints={{
              1024: {
                spaceBetween: 24,
              },
            }}
            className="!pb-9 sm:!pb-11"
          >
            {blockData.items && blockData.items.length > 0 && blockData.items.map((slide) => (
              <SwiperSlide
                key={slide._id}
                className=""
              >
                {settings.instagram ? (
                  <a
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
                      className="object-cover duration-500"
                    />

                    <span className="icon w-[34px] h-[34px] lg:w-12 lg:h-12 bg-white hover:bg-primary-green duration-500 flex items-center justify-center rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">
                      <span className="icon icon-instagram text-[20px] lg:text-[28px] text-primary-green" />
                    </span>
                  </a>
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
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        {/*  <div className="swiper !pb-9 !sm:pb-11 swiper-initialized swiper-horizontal swiper-free-mode"*/}
        {/*       id="swiper-slider-weOnInstagramm-1769022763-653">*/}
        {/*    <div className="swiper-wrapper" id="swiper-wrapper-abc41b92c8e672ba" aria-live="off"*/}
        {/*         style="transition-duration: 0ms; transform: translate3d(-792px, 0px, 0px); transition-delay: 0ms;">*/}


        {/*      <div className="swiper-slide" role="group" aria-label="9 / 11" data-swiper-slide-index="8"*/}
        {/*           style="margin-right: 24px;">*/}
        {/*        <a className="item relative block overflow-hidden rounded-[16px] w-full min-h-[215px] lg:min-h-[300px]"*/}
        {/*           href="https://www.instagram.com/_sunfill_/" target="_blank">*/}
        {/*          <picture>*/}
        {/*            <source srcSet="https://sunfill.ua/images/sliders/slides/21/1756207724_efc0da92bae340698d9a.webp"*/}
        {/*                    type="image/webp" />*/}
        {/*            <img src="https://sunfill.ua/images/sliders/slides/21/1756207724_efc0da92bae340698d9a.jpg" alt=""*/}
        {/*                 loading="lazy" />*/}
        {/*          </picture>*/}
        {/*          <span*/}
        {/*            className="icon w-[34px] h-[34px] lg:w-12 lg:h-12 bg-white hover:bg-primary-green  duration-500 flex items-center justify-center rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">*/}
        {/*                                <span*/}
        {/*                                  className="icon icon-instagram text-[20px] lg:text-[28px] text-primary-green"></span>*/}
        {/*                            </span>*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*      <div className="swiper-slide" role="group" aria-label="10 / 11" data-swiper-slide-index="9"*/}
        {/*           style="margin-right: 24px;">*/}
        {/*        <a className="item relative block overflow-hidden rounded-[16px] w-full min-h-[215px] lg:min-h-[300px]"*/}
        {/*           href="https://www.instagram.com/_sunfill_/" target="_blank">*/}
        {/*          <picture>*/}
        {/*            <source srcSet="https://sunfill.ua/images/sliders/slides/22/1756207766_b87147410cf0202fa950.webp"*/}
        {/*                    type="image/webp" />*/}
        {/*            <img src="https://sunfill.ua/images/sliders/slides/22/1756207766_b87147410cf0202fa950.jpg" alt=""*/}
        {/*                 loading="lazy" />*/}
        {/*          </picture>*/}
        {/*          <span*/}
        {/*            className="icon w-[34px] h-[34px] lg:w-12 lg:h-12 bg-white hover:bg-primary-green  duration-500 flex items-center justify-center rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">*/}
        {/*                                <span*/}
        {/*                                  className="icon icon-instagram text-[20px] lg:text-[28px] text-primary-green"></span>*/}
        {/*                            </span>*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*      <div className="swiper-slide swiper-slide-prev" role="group" aria-label="11 / 11"*/}
        {/*           data-swiper-slide-index="10" style="margin-right: 24px;">*/}
        {/*        <a className="item relative block overflow-hidden rounded-[16px] w-full min-h-[215px] lg:min-h-[300px]"*/}
        {/*           href="https://www.instagram.com/_sunfill_/" target="_blank">*/}
        {/*          <picture>*/}
        {/*            <source srcSet="https://sunfill.ua/images/sliders/slides/23/1756207782_97d8f78bea8a82bdd7bc.webp"*/}
        {/*                    type="image/webp" />*/}
        {/*            <img src="https://sunfill.ua/images/sliders/slides/23/1756207782_97d8f78bea8a82bdd7bc.jpg" alt=""*/}
        {/*                 loading="lazy" />*/}
        {/*          </picture>*/}
        {/*          <span*/}
        {/*            className="icon w-[34px] h-[34px] lg:w-12 lg:h-12 bg-white hover:bg-primary-green  duration-500 flex items-center justify-center rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">*/}
        {/*                                <span*/}
        {/*                                  className="icon icon-instagram text-[20px] lg:text-[28px] text-primary-green"></span>*/}
        {/*                            </span>*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*      <div className="swiper-slide swiper-slide-active" role="group" aria-label="1 / 11"*/}
        {/*           data-swiper-slide-index="0" style="margin-right: 24px;">*/}
        {/*        <a className="item relative block overflow-hidden rounded-[16px] w-full min-h-[215px] lg:min-h-[300px]"*/}
        {/*           href="https://www.instagram.com/_sunfill_/" target="_blank">*/}
        {/*          <picture>*/}
        {/*            <source srcSet="https://sunfill.ua/images/sliders/slides/13/1756126789_2cdebf48db3c988f684a.webp"*/}
        {/*                    type="image/webp" />*/}
        {/*            <img src="https://sunfill.ua/images/sliders/slides/13/1756126789_2cdebf48db3c988f684a.jpg" alt=""*/}
        {/*                 loading="lazy" />*/}
        {/*          </picture>*/}
        {/*          <span*/}
        {/*            className="icon w-[34px] h-[34px] lg:w-12 lg:h-12 bg-white hover:bg-primary-green  duration-500 flex items-center justify-center rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">*/}
        {/*                                <span*/}
        {/*                                  className="icon icon-instagram text-[20px] lg:text-[28px] text-primary-green"></span>*/}
        {/*                            </span>*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*      <div className="swiper-slide swiper-slide-next" role="group" aria-label="2 / 11"*/}
        {/*           data-swiper-slide-index="1" style="margin-right: 24px;">*/}
        {/*        <a className="item relative block overflow-hidden rounded-[16px] w-full min-h-[215px] lg:min-h-[300px]"*/}
        {/*           href="https://www.instagram.com/_sunfill_/" target="_blank">*/}
        {/*          <picture>*/}
        {/*            <source srcSet="https://sunfill.ua/images/sliders/slides/14/1756126804_8bc4d77a0cec3e9c0e53.webp"*/}
        {/*                    type="image/webp" />*/}
        {/*            <img src="https://sunfill.ua/images/sliders/slides/14/1756126804_8bc4d77a0cec3e9c0e53.jpg" alt=""*/}
        {/*                 loading="lazy" />*/}
        {/*          </picture>*/}
        {/*          <span*/}
        {/*            className="icon w-[34px] h-[34px] lg:w-12 lg:h-12 bg-white hover:bg-primary-green  duration-500 flex items-center justify-center rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">*/}
        {/*                                <span*/}
        {/*                                  className="icon icon-instagram text-[20px] lg:text-[28px] text-primary-green"></span>*/}
        {/*                            </span>*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*      <div className="swiper-slide" role="group" aria-label="3 / 11" data-swiper-slide-index="2"*/}
        {/*           style="margin-right: 24px;">*/}
        {/*        <a className="item relative block overflow-hidden rounded-[16px] w-full min-h-[215px] lg:min-h-[300px]"*/}
        {/*           href="https://www.instagram.com/_sunfill_/" target="_blank">*/}
        {/*          <picture>*/}
        {/*            <source srcSet="https://sunfill.ua/images/sliders/slides/15/1756126834_4e53e85f8cb928dace1b.webp"*/}
        {/*                    type="image/webp" />*/}
        {/*            <img src="https://sunfill.ua/images/sliders/slides/15/1756126834_4e53e85f8cb928dace1b.jpg" alt=""*/}
        {/*                 loading="lazy" />*/}
        {/*          </picture>*/}
        {/*          <span*/}
        {/*            className="icon w-[34px] h-[34px] lg:w-12 lg:h-12 bg-white hover:bg-primary-green  duration-500 flex items-center justify-center rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">*/}
        {/*                                <span*/}
        {/*                                  className="icon icon-instagram text-[20px] lg:text-[28px] text-primary-green"></span>*/}
        {/*                            </span>*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*      <div className="swiper-slide" role="group" aria-label="4 / 11" data-swiper-slide-index="3"*/}
        {/*           style="margin-right: 24px;">*/}
        {/*        <a className="item relative block overflow-hidden rounded-[16px] w-full min-h-[215px] lg:min-h-[300px]"*/}
        {/*           href="https://www.instagram.com/_sunfill_/" target="_blank">*/}
        {/*          <picture>*/}
        {/*            <source srcSet="https://sunfill.ua/images/sliders/slides/16/1756126847_225ed73b8e8a697a78b1.webp"*/}
        {/*                    type="image/webp" />*/}
        {/*            <img src="https://sunfill.ua/images/sliders/slides/16/1756126847_225ed73b8e8a697a78b1.jpg" alt=""*/}
        {/*                 loading="lazy" />*/}
        {/*          </picture>*/}
        {/*          <span*/}
        {/*            className="icon w-[34px] h-[34px] lg:w-12 lg:h-12 bg-white hover:bg-primary-green  duration-500 flex items-center justify-center rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">*/}
        {/*                                <span*/}
        {/*                                  className="icon icon-instagram text-[20px] lg:text-[28px] text-primary-green"></span>*/}
        {/*                            </span>*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*      <div className="swiper-slide" role="group" aria-label="5 / 11" data-swiper-slide-index="4"*/}
        {/*           style="margin-right: 24px;">*/}
        {/*        <a className="item relative block overflow-hidden rounded-[16px] w-full min-h-[215px] lg:min-h-[300px]"*/}
        {/*           href="https://www.instagram.com/_sunfill_/" target="_blank">*/}
        {/*          <picture>*/}
        {/*            <source srcSet="https://sunfill.ua/images/sliders/slides/17/1756126862_87f68258f6e0bfaaac51.webp"*/}
        {/*                    type="image/webp" />*/}
        {/*            <img src="https://sunfill.ua/images/sliders/slides/17/1756126862_87f68258f6e0bfaaac51.jpg" alt=""*/}
        {/*                 loading="lazy" />*/}
        {/*          </picture>*/}
        {/*          <span*/}
        {/*            className="icon w-[34px] h-[34px] lg:w-12 lg:h-12 bg-white hover:bg-primary-green  duration-500 flex items-center justify-center rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">*/}
        {/*                                <span*/}
        {/*                                  className="icon icon-instagram text-[20px] lg:text-[28px] text-primary-green"></span>*/}
        {/*                            </span>*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*      <div className="swiper-slide" role="group" aria-label="6 / 11" data-swiper-slide-index="5"*/}
        {/*           style="margin-right: 24px;">*/}
        {/*        <a className="item relative block overflow-hidden rounded-[16px] w-full min-h-[215px] lg:min-h-[300px]"*/}
        {/*           href="https://www.instagram.com/_sunfill_/" target="_blank">*/}
        {/*          <picture>*/}
        {/*            <source srcSet="https://sunfill.ua/images/sliders/slides/18/1756126876_500c04c5ce504866c421.webp"*/}
        {/*                    type="image/webp" />*/}
        {/*            <img src="https://sunfill.ua/images/sliders/slides/18/1756126876_500c04c5ce504866c421.jpg" alt=""*/}
        {/*                 loading="lazy" />*/}
        {/*          </picture>*/}
        {/*          <span*/}
        {/*            className="icon w-[34px] h-[34px] lg:w-12 lg:h-12 bg-white hover:bg-primary-green  duration-500 flex items-center justify-center rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">*/}
        {/*                                <span*/}
        {/*                                  className="icon icon-instagram text-[20px] lg:text-[28px] text-primary-green"></span>*/}
        {/*                            </span>*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*      <div className="swiper-slide" role="group" aria-label="7 / 11" data-swiper-slide-index="6"*/}
        {/*           style="margin-right: 24px;">*/}
        {/*        <a className="item relative block overflow-hidden rounded-[16px] w-full min-h-[215px] lg:min-h-[300px]"*/}
        {/*           href="https://www.instagram.com/_sunfill_/" target="_blank">*/}
        {/*          <picture>*/}
        {/*            <source srcSet="https://sunfill.ua/images/sliders/slides/19/1756207682_dfc4078545466c9639b0.webp"*/}
        {/*                    type="image/webp" />*/}
        {/*            <img src="https://sunfill.ua/images/sliders/slides/19/1756207682_dfc4078545466c9639b0.jpg" alt=""*/}
        {/*                 loading="lazy" />*/}
        {/*          </picture>*/}
        {/*          <span*/}
        {/*            className="icon w-[34px] h-[34px] lg:w-12 lg:h-12 bg-white hover:bg-primary-green  duration-500 flex items-center justify-center rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">*/}
        {/*                                <span*/}
        {/*                                  className="icon icon-instagram text-[20px] lg:text-[28px] text-primary-green"></span>*/}
        {/*                            </span>*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*      <div className="swiper-slide" role="group" aria-label="8 / 11" data-swiper-slide-index="7"*/}
        {/*           style="margin-right: 24px;">*/}
        {/*        <a className="item relative block overflow-hidden rounded-[16px] w-full min-h-[215px] lg:min-h-[300px]"*/}
        {/*           href="https://www.instagram.com/_sunfill_/" target="_blank">*/}
        {/*          <picture>*/}
        {/*            <source srcSet="https://sunfill.ua/images/sliders/slides/20/1756207707_cb547683fa18440217b6.webp"*/}
        {/*                    type="image/webp" />*/}
        {/*            <img src="https://sunfill.ua/images/sliders/slides/20/1756207707_cb547683fa18440217b6.jpg" alt=""*/}
        {/*                 loading="lazy" />*/}
        {/*          </picture>*/}
        {/*          <span*/}
        {/*            className="icon w-[34px] h-[34px] lg:w-12 lg:h-12 bg-white hover:bg-primary-green  duration-500 flex items-center justify-center rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">*/}
        {/*                                <span*/}
        {/*                                  className="icon icon-instagram text-[20px] lg:text-[28px] text-primary-green"></span>*/}
        {/*                            </span>*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*    <div*/}
        {/*      className="swiper-pagination swiper-pagination-clickable swiper-pagination-bullets swiper-pagination-horizontal">*/}
        {/*      <span className="swiper-pagination-bullet swiper-pagination-bullet-active" tabIndex="0" role="button"*/}
        {/*            aria-label="Go to slide 1" aria-current="true"></span><span className="swiper-pagination-bullet"*/}
        {/*                                                                        tabIndex="0" role="button"*/}
        {/*                                                                        aria-label="Go to slide 2"></span><span*/}
        {/*      className="swiper-pagination-bullet" tabIndex="0" role="button" aria-label="Go to slide 3"></span><span*/}
        {/*      className="swiper-pagination-bullet" tabIndex="0" role="button" aria-label="Go to slide 4"></span><span*/}
        {/*      className="swiper-pagination-bullet" tabIndex="0" role="button" aria-label="Go to slide 5"></span><span*/}
        {/*      className="swiper-pagination-bullet" tabIndex="0" role="button" aria-label="Go to slide 6"></span><span*/}
        {/*      className="swiper-pagination-bullet" tabIndex="0" role="button" aria-label="Go to slide 7"></span><span*/}
        {/*      className="swiper-pagination-bullet" tabIndex="0" role="button" aria-label="Go to slide 8"></span><span*/}
        {/*      className="swiper-pagination-bullet" tabIndex="0" role="button" aria-label="Go to slide 9"></span><span*/}
        {/*      className="swiper-pagination-bullet" tabIndex="0" role="button" aria-label="Go to slide 10"></span><span*/}
        {/*      className="swiper-pagination-bullet" tabIndex="0" role="button" aria-label="Go to slide 11"></span></div>*/}
        {/*    <span className="swiper-notification" aria-live="assertive" aria-atomic="true"></span></div>*/}
        {/*</div>*/}
      </div>
    </div>
  )
}