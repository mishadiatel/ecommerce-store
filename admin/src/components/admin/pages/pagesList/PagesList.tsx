'use client'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/admin/shadcnuiComponents/dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import PageCard from '@/components/admin/pages/card/PageCard';
import { Page } from '@/types/pages';
import AddPageForm from '@/components/admin/pages/forms/AddPage';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import { getPages } from '@/services/pages';
import { toast } from 'react-toastify';



export default function PagesList () {
  const isFirstRender = useRef(true);
  const [pagesState, setPagesState] = useState<Page[] | undefined>([]);
  const [searchWord, setSearchWord] = useState('');

  const updatePagesList = () => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    getPages(searchWord ? {search: searchWord.toString()} : {}).then((pagesResult) => {
      setPagesState(pagesResult);
    }).catch((err) => {
      toast.error('error loading pages.');
    })
  }

  useEffect(() => {
    updatePagesList();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      updatePagesList();
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchWord]);
  return (
    <>
      <div className={'w-fit'}>
        <Dialog>
          <DialogTrigger className={'w-fit'} asChild>
            <Button>Add page</Button>
          </DialogTrigger>
          <DialogContent className={'max-h-screen overflow-y-auto'}>
            <AddPageForm updatePagesList={updatePagesList} />
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
        {pagesState && pagesState.length > 0 ? pagesState.map((page) => (
          <PageCard page={page} key={page._id} updatePagesList={updatePagesList} />
        )) : (
          <div>not found pages</div>
        )}
      </div>
    </>
  )
}