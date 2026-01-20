import { Block, NotFoundBlockData, RunningLineBlockData } from '@/types/blocks';
import NotFoundBlock from '@/components/blocks/notFound/NotFoundBlock';
import RunningLine1 from '@/components/blocks/runningLine1/RunningLine1';
import RunningLine2 from '@/components/blocks/runningLine2/RunningLine2';

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
  }

  return ;
}