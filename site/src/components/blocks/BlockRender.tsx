import {
  Block,
  FaqComplexBlockData,
  FaqSmallBlockData, InstaBlockData,
  NotFoundBlockData,
  RunningLineBlockData,
  StickyCardBlockData,
} from '@/types/blocks';
import NotFoundBlock from '@/components/blocks/notFound/NotFoundBlock';
import RunningLine1 from '@/components/blocks/runningLine1/RunningLine1';
import RunningLine2 from '@/components/blocks/runningLine2/RunningLine2';
import StickeCardsBlock from '@/components/blocks/stickyCards/StickyCards';
import { FaqSmallBlock } from '@/components/blocks/faq/FaqSmallBlock';
import FaqComplexBlock from '@/components/blocks/faq/FaqComplexBlock';
import InstaBlock from '@/components/blocks/instaBlock/InstaBlock';

interface BlockRenderProps {
  block: Block<object>
}

export default function BlockRender({block}: BlockRenderProps) {
  switch (block.blockType) {
    case 'not-found' :
      return (
        <NotFoundBlock blockData={block.blockData as NotFoundBlockData} />
      )

    case 'running-line-1' :
      return (
        <RunningLine1 blockData={block.blockData as RunningLineBlockData} />
      )
    case 'running-line-2' :
      return (
        <RunningLine2 blockData={block.blockData as RunningLineBlockData} />
      )

    case 'sticky-cards' :
      return (
        <StickeCardsBlock blockData={block.blockData as StickyCardBlockData} />
      )
    case 'faq-small' :
      return (
        <FaqSmallBlock blockData={block.blockData as FaqSmallBlockData} />
      )

    case 'faq-complex' :
      return (
        <FaqComplexBlock blockData={block.blockData as FaqComplexBlockData} />
      )

    case 'insta-block' :
      return (
        <InstaBlock blockData={block.blockData as InstaBlockData} />
      )
  }

  return ;
}