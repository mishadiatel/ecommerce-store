'use client';
import { Page } from '@/types/pages';
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/admin/shadcnuiComponents/dialog';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import EditPageForm from '@/components/admin/pages/forms/EditPage';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { deletePage } from '@/services/pages';
import { toast } from 'react-toastify';
import { Block } from '@/types/blocks';
import { getPublicBlocks } from '@/services/blocks';
import BlockCard from '@/components/admin/blocks/card/BlockCard';

interface PageCardProps {
  page: Page;
  updatePagesList: () => void;
}

export default function PageCard({ page, updatePagesList }: PageCardProps) {
  const t = useTranslations('pagesControlPage');
  const tCommon = useTranslations('common');
  const [pageBlocks, setPageBlocks] = useState<Block<object>[] | undefined>([]);
  useEffect(() => {
    const fetchPageBlocks = async () => {
      const blocks = await getPublicBlocks(page.slug, { lang: page.language });
      setPageBlocks(blocks);
    };
    fetchPageBlocks();
  }, []);
  const closeRemoveModalRef = useRef<HTMLButtonElement>(null);
  const onRemovePageClick = () => {
    deletePage(page._id)
      .then(data => {
        toast.success(t('toast.deleted'));
        updatePagesList();
      }).catch(error => {
      toast.error(t('toast.deleteError'));
    }).finally(() => {
      closeRemoveModalRef.current?.click();
    });
  };
  return (
    <div className={'admin-card flex flex-col gap-3 p-3 sm:p-4'}>
      <div className={'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'}>
        <div className={'min-w-0 flex-1'}>
          <div className={'font-medium truncate'}>{page.title}</div>
          <div className={'text-xs text-muted-foreground truncate'}>/{page.slug}</div>
        </div>
        <div className={'flex flex-wrap gap-2 text-xs'}>
          <span className={'rounded-md bg-muted px-2 py-1 text-muted-foreground ring-1 ring-border uppercase'}>
            {page.language}
          </span>
          <span className={'rounded-md bg-muted px-2 py-1 text-muted-foreground ring-1 ring-border'}>
            {page.index ? 'index' : 'noindex'}, {page.follow ? 'follow' : 'nofollow'}
          </span>
        </div>
      </div>
      <div className={'flex flex-wrap items-center gap-3 sm:gap-5'}>
        <Dialog>
          <DialogTrigger className={'w-full sm:w-fit'} asChild>
            <Button className={'w-full sm:w-auto'} variant={'outline'} size={'sm'}>{t('blocksList')}</Button>
          </DialogTrigger>
          <DialogContent className={'w-[calc(100%-1.5rem)] max-w-[1000px] sm:max-w-[1000px] max-h-screen overflow-y-auto'}>
            <DialogHeader>
              <DialogTitle>{t('blocksListTitle')}</DialogTitle>
            </DialogHeader>
            <div className={'flex flex-col gap-3'}>
              {pageBlocks && pageBlocks.length > 0 ? pageBlocks.map((block) => (
                  <BlockCard block={block} updateBlocksList={updatePagesList} key={block._id} />
                ))
                :
                <div>{t('blocksNotFound')}</div>
              }
            </div>
          </DialogContent>
        </Dialog>
        <div className={'flex gap-4 sm:gap-5 sm:ml-auto'}>
          <Dialog>
            <DialogTrigger>
              <div className={'cursor-pointer p-1'} aria-label={tCommon('edit')}>
                <FaEdit />
              </div>
            </DialogTrigger>
            <DialogContent className={'w-[calc(100%-1.5rem)] max-h-screen overflow-y-auto'}>
              <EditPageForm page={page} updatePageList={updatePagesList} />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger>
              <div className={'cursor-pointer p-1'} aria-label={tCommon('delete')}>
                <MdDelete />
              </div>
            </DialogTrigger>
            <DialogContent className={'w-[calc(100%-1.5rem)] max-w-md max-h-screen overflow-y-auto'}>
              <DialogHeader>
                <DialogTitle>{tCommon('confirmDeleteTitle')}</DialogTitle>
                <DialogDescription>
                  {t('deleteDescription', { language: page.language, slug: page.slug, title: page.title })}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className={'flex-col sm:flex-row gap-2'}>
                <DialogClose asChild>
                  <Button variant="outline" ref={closeRemoveModalRef}>{tCommon('cancel')}</Button>
                </DialogClose>
                <Button type="button" onClick={onRemovePageClick}>{tCommon('delete')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
