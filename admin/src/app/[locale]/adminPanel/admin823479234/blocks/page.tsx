import { getBlocks } from '@/services/blocks';
import BlocksList from '@/components/admin/blocks/blocksList/BlocksList';

export default async function AdminBlocks () {
  const blocks = await getBlocks();
  return (
    <div>
      <div className={'flex flex-col gap-8'}>
        <div>Blocks</div>
        <BlocksList blocks={blocks} />
      </div>
    </div>
  );
}