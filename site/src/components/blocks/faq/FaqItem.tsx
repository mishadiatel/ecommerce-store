import { Dispatch, SetStateAction } from 'react';
import { FaqItem } from '@/types/blocks';

interface FaqItemProps {
  item: FaqItem
  openElement: string | null;
  setOpenElement:  Dispatch<SetStateAction<string | null>>
}

export default function FaqItem({item, openElement, setOpenElement}: FaqItemProps) {
  return (
    <div
      className={`question-item px-5 py-5 sm:px-6 lg:px-8 lg:py-6 rounded-[16px] overflow-hidden border-2 border-extra-light-gray cursor-pointer ${openElement === item._id ? 'open' : ''}`}
      onClick={() => {
        if(openElement === item._id) {
          setOpenElement(null)
        }else {
          setOpenElement(item._id)
        }
      }}
    >
      <div className="heading flex items-center justify-between gap-6">
        {item.title && (
          <h3 className="question-item__title text-lg sm:text-[22px] text-gray-90">{item.title}</h3>
        )}
        <div className="question-item__icon">
          <i className="icon icon-plus question-item__open"></i>
          <i className="icon icon-minus question-item__closed"></i>
        </div>
      </div>
      {item.text && (
        <div className="content text-gray-90">{item.text}</div>
      )}
    </div>
  )
}