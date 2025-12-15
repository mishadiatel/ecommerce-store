'use client'
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

export default function BlocksList () {
  const isFirstRender = useRef(true);
  const [blocksState, setBlocksState] = useState<Block<object>[] | undefined>([]);
  const [searchWord, setSearchWord] = useState('');



  const updateBlocksList = () => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    getBlocks(searchWord ? {search: searchWord.toString()} : {}).then((pagesResult) => {
      setBlocksState(pagesResult);
    }).catch((err) => {
      toast.error('error loading pages.');
    })
  }
  useEffect(() => {
    updateBlocksList();
  }, []);
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
        {blocksState && blocksState.length > 0 ? blocksState.map((block) => (
          <BlockCard block={block} updateBlocksList={updateBlocksList} key={block._id} />
        )) : (
          <div>not found pages</div>
        )}
      </div>
    </>
  )
}