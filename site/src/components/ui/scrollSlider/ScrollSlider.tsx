import { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { FreeMode, Mousewheel, Scrollbar } from 'swiper/modules';

interface ScrollSliderProps {
  sliderId: string;
  children: React.ReactNode;
  className?: string;
}

export default function ScrollSlider({sliderId, children, className}: ScrollSliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;

    const swiper = new Swiper(ref.current, {
      modules: [Scrollbar, Mousewheel, FreeMode],
      scrollbar: {
        hide: false,
        draggable: true,
        el: `.${sliderId}-scrollbar`
      },
      direction: "vertical",
      slidesPerView: "auto",
      freeMode: true,
      mousewheel: true
    });

    return () => swiper.destroy(true, true);
  }, [sliderId]);
  return (
    <div className={`swiper ${className ? className : ''}`} ref={ref}>{children}</div>
  )
}