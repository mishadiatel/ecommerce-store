'use client'

import { FaqSmallBlockData } from '@/types/blocks';
import { useState } from 'react';
import FaqItem from '@/components/blocks/faq/FaqItem';

interface FaqSmallBlockProps {
  blockData: FaqSmallBlockData;
}

export function FaqSmallBlock({ blockData }: FaqSmallBlockProps) {
  const [openElement, setOpenElement] = useState<string | null>(null);


  return (
    <div className="faqs-block my-[64px] sm:my-[80px] lg:my-[100px]">
      <div className="container">
        {blockData.title && (
          <h2 className="heading1 text-center mb-[32px] sm:mb-[40px] lg:mb-[48px]">{blockData.title}</h2>
        )}

        <div className="flex max-md:flex-wrap justify-center gap-y-8">
          <div className="right list-question md:w-2/3">
            <div className="flex flex-col gap-3 lg:gap-6">
              {blockData.items.map((item) => (
                <FaqItem key={item._id} item={item} openElement={openElement} setOpenElement={setOpenElement} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}