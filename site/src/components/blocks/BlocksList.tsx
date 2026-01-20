import { Block } from '@/types/blocks';
import BlockRender from '@/components/blocks/BlockRender';

interface BlocksListProps {
  blocks: Block<object>[]
}

export default function BlocksList({blocks}: BlocksListProps) {
  return (
    <>
      {blocks && blocks.length > 0 && blocks.map((block) => (
        <BlockRender key={block._id} block={block} />
      ))}
    </>
  )
}