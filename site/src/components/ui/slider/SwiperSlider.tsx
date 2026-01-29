'use client';
import Swiper from 'swiper';
import { SwiperOptions } from 'swiper/types';
import { Autoplay, FreeMode, Navigation, Pagination, Scrollbar } from 'swiper/modules';
import { useEffect, useRef } from 'react';

// eslint-disable-next-line react-hooks/rules-of-hooks
Swiper.use([Navigation, Pagination, FreeMode, Autoplay, Scrollbar]);

interface Props {
  options?: SwiperOptions;
  sliderId: string;
  children: React.ReactNode;
  className?: string;
}
export default function SwiperSlider({ options, sliderId, children, className} : Props) {

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;

    const swiper = new Swiper(ref.current, options);

    return () => swiper.destroy(true, true);
  }, [options, sliderId]);
  return (
    <div className={`swiper ${className ? className : ''}`} ref={ref}>{children}</div>
  )
}