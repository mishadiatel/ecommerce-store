'use client'

import { RunningLineBlockData } from '@/types/blocks';
import Marquee from 'react-fast-marquee';
import SsrMarquee from '@/components/ui/ssrMarquee/SsrMarquee';

interface RunningLine1Props {
  blockData: RunningLineBlockData
}

export default function RunningLine1({blockData}: RunningLine1Props) {
  const duplicatedItems = Array.from({ length: 3 })
    .flatMap(() => blockData.items);
  return (
    <div className="banner-top bg-green-50 py-2">
      <div className={'marquee-block'}>

        <SsrMarquee>
          {duplicatedItems.map((item, index) => (
            <div key={`${item._id}-${index}`} className={'flex items-center'}>
              <div className={'text-[14px] font-[600] text-black whitespace-nowrap mx-6'}>
                {item.text}
              </div>
              <div className={'line h-4 w-[2px] bg-light-green mx-6'} />
            </div>
          ))}

        </SsrMarquee>
      </div>
    </div>

  )
}