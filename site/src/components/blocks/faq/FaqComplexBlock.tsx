'use client'
import { FaqComplexBlockData } from '@/types/blocks';
import { useState } from 'react';
import FaqItem from '@/components/blocks/faq/FaqItem';

interface FaqComplexBlockProps {
  blockData: FaqComplexBlockData;
}

export default function FaqComplexBlock({ blockData }: FaqComplexBlockProps) {
  const [openElement, setOpenElement] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(blockData.items[0]._id);

  return (
    <div className="faqs-block my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
      <div className="container">
        <div className="flex max-lg:flex-col justify-between gap-y-8">
          <div className="left w-full lg:w-[32%]">
            <div className="menu-tab flex flex-col gap-6 bg-extra-light-gray rounded-2xl p-5">
              {blockData.items.map((item) => (
                <h2
                  key={`${item._id}-${item.title}`}
                  className={`tab-item inline-block w-fit heading4 has-line-before text-gray-90 hover:text-black duration-300 ${activeCategory === item._id ? 'active' : ''}`}
                  onClick={() => {
                    if(activeCategory !== item._id) {
                      setActiveCategory(item._id);
                    }
                  }}
                >{item.title}
                </h2>
              ))}
            </div>
          </div>
          <div className="right list-question w-full lg:w-2/3">
            {blockData.items.map((item) => (
              <div key={item._id} className={`tab-question flex flex-col gap-5 ${activeCategory === item._id ? 'active' : ''}`}>
                {item.items.map((categoryFaq) => (
                  <FaqItem key={categoryFaq._id} item={categoryFaq} openElement={openElement} setOpenElement={setOpenElement} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}