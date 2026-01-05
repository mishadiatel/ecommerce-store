'use client';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/admin/shadcnuiComponents/dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import { toast } from 'react-toastify';
import { Block } from '@/types/blocks';
import { getBlocks } from '@/services/blocks';
import BlockCard from '@/components/admin/blocks/card/BlockCard';
import AddBlockForm from '@/components/admin/blocks/forms/AddBlock';
import PageControl from '@/components/admin/ui/pageControl';

export default function BlocksList() {
  const isFirstRender = useRef(true);
  const [blocksState, setBlocksState] = useState<Block<object>[] | undefined>([]);
  const [searchWord, setSearchWord] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [totalDocuments, setTotalDocuments] = useState<number | undefined>(undefined);
  const [limit, setLimit] = useState<number>(10);


  const updateBlocksList = () => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const query: Record<string, string | number> = {
      page: currentPage,
      limit: limit,
    };
    if (searchWord.trim()) {
      query.search = searchWord.trim();
    }

    getBlocks(query).then((blocksResult) => {
      setBlocksState(blocksResult?.data);
      setTotalPages(blocksResult?.totalPages);
      setTotalDocuments(blocksResult?.totalDocuments);

    }).catch((err) => {
      toast.error('error loading pages.');
    });
  };
  useEffect(() => {
    updateBlocksList();
  }, [currentPage]);
  useEffect(() => {
    const handler = setTimeout(() => {
      updateBlocksList();
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchWord]);
  return (
    <>
      <div className={'w-fit'}>
        <Dialog>
          <DialogTrigger className={'w-fit'} asChild>
            <Button>Add block</Button>
          </DialogTrigger>
          <DialogContent className={'max-w-[1000px] sm:max-w-[1000px] max-h-screen overflow-y-auto'}>
            {/*<AddPageForm updatePagesList={updatePagesList} />*/}
            <AddBlockForm onSuccess={updateBlocksList} />
          </DialogContent>
        </Dialog>
      </div>

      <Input type={'text'}
             placeholder={'Search...'}
             className={'w-[200px] flex-shrink max-w-full max-[500px]:w-full'}
             value={searchWord}
             onChange={e => setSearchWord(e.target.value)}
      />

      <div className={'flex flex-col gap-5'}>
        {blocksState && blocksState.length > 0 ? (
          <>
            {blocksState.map((block) => (
              <BlockCard block={block} updateBlocksList={updateBlocksList} key={block._id} />
            ))}
            {totalPages && totalDocuments && (
              <PageControl currentPage={currentPage} limit={limit} totalDocuments={totalDocuments}
                           setCurrentPage={setCurrentPage} totalPages={totalPages}
                           documentsLength={blocksState.length} />
            )}

          </>

        ) : (
          <div>not found pages</div>
        )}
      </div>
    </>
  );
}