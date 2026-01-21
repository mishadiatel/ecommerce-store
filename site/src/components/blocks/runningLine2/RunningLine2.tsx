'use client'

import { RunningLineBlockData } from '@/types/blocks';
import Marquee from 'react-fast-marquee';
import SsrMarquee from '@/components/ui/ssrMarquee/SsrMarquee';

interface RunningLine2Props {
  blockData: RunningLineBlockData
}

export default function RunningLine2({blockData}: RunningLine2Props) {
  const duplicatedItems = Array.from({ length: 3 })
    .flatMap(() => blockData.items);
  return (
    <div className="banner-top bg-transparent my-[50px]">
      <div className={'marquee-block swiper-container flex items-center whitespace-nowrap'}>

        <SsrMarquee>
          {duplicatedItems.map((item, index) => (
            <div key={`${item._id}-${index}`} className={'px-2'}>
              <div className={'text-button-uppercase bg-green-50 py-3 px-8 min-w-[245px] w-fit rounded-full text-black'}>
                {item.text}
              </div>
            </div>
          ))}

        </SsrMarquee>
      </div>
    </div>

  )
}