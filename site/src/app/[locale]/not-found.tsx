
import { getLocale } from 'next-intl/server';
import { getPageBlocks } from '@/services/blocks';
import BlockRender from '@/components/blocks/BlockRender';



export default async function NotFound() {
  const locale = await getLocale();
  const pageBlocks = await getPageBlocks('not-found', locale)

  return (
   <>
     {pageBlocks && pageBlocks.length > 0 && pageBlocks.map(pageBlock => (
       <BlockRender block={pageBlock} key={pageBlock._id} />
     ))}
   </>
  )

}