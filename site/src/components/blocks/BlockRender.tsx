import { Block, NotFoundBlockData } from '@/types/blocks';
import NotFoundBlock from '@/components/blocks/notFound/NotFoundBlock';

interface BlockRenderProps {
  block: Block<object>
}

export default function BlockRender({block}: BlockRenderProps) {
  switch (block.blockType) {
    case 'not-found' :
      return (
        <NotFoundBlock blockData={block.blockData as NotFoundBlockData} />
      )
  }

  return ;
}