import { NotFoundBlockData } from '@/types/blocks';
import Image from 'next/image';
import { cleanHtmlString, generateFileUrl } from '@/lib/utils';
import { Link } from '@/i18n/navigation';

interface NotFoundBlockProps {
  blockData: NotFoundBlockData
}

export default function NotFoundBlock({blockData}: NotFoundBlockProps) {
  return (
    <div className="page-not-found">
      <div className="container">
        <div
          className="flex items-center justify-center flex-col gap-6 sm:gap-8 relative h-[640px] sm:h-[720px] lg:h-[680px]">
          {blockData.backgroundImage && (
            <Image
              src={generateFileUrl(blockData.backgroundImage)}
              alt={'404'}
              className={'mb-4 sm:mb-0 sm:absolute sm:top-1/2 sm:left-1/2 w-[1040px] max-w-full sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2'}
              width={1040}
              height={400}
            />
          )}
          <div className={'w-[800px] max-w-full flex flex-col gap-6 sm:gap-8 items-center justify-center'}>
            {blockData.text && (
              <div
                className="text-center w-800 max-w-full relative font-semibold sm:font-bold leading-[1.2] text-black text-[22px] sm:text-[28px] lg:text-[32px]"
                dangerouslySetInnerHTML={{__html: cleanHtmlString(blockData.text)}}
              ></div>
            )}
            {blockData.buttonText && (
              <Link href={'/'} className={'button-main relative'}>{blockData.buttonText}</Link>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}