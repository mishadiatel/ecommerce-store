'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/admin/shadcnuiComponents/dialog';
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { Block } from '@/types/blocks';
import { deleteBlock } from '@/services/blocks';
import BlockForm from '@/components/admin/blocks/forms/AddBlock';

interface BlockCardProps {
  block: Block<object>;
  updateBlocksList: () => void;
}

export default function BlockCard({block, updateBlocksList}: BlockCardProps) {
  const t = useTranslations('blocksPage');
  const tCommon = useTranslations('common');
  const closeRemoveModalRef = useRef<HTMLButtonElement>(null);
  const onRemoveBlockClick = () => {
    deleteBlock(block._id)
      .then(data => {
        toast.success(t('toast.deleted'));
        updateBlocksList();
      }).catch(error => {
      toast.error(t('toast.deleteError'));
    }).finally(() => {
      closeRemoveModalRef.current?.click();
    })
  }
  const positionLabel = block.isTop ? 'top' : block.isBottom ? 'bottom' : 'default';

  return (
    <div className={'admin-card flex flex-col gap-3 p-3 sm:p-4'}>
      <div className={'flex items-start sm:items-center justify-between gap-3'}>
        <div className={'min-w-0 flex-1'}>
          <div className={'font-medium truncate'}>{block.blockType}</div>
          <div className={'text-xs text-muted-foreground truncate'}>
            {block.pages.join(', ')}
          </div>
        </div>
        <div className={'flex items-center gap-3 flex-shrink-0'}>
          {block.visible ? (
            <AiFillEye className={'text-green-600'} />
          ) : (
            <AiFillEyeInvisible className={'text-red-600'} />
          )}
          <div className={'flex gap-4 sm:gap-5'}>
            <Dialog>
              <DialogTrigger>
                <div className={'cursor-pointer p-1'} aria-label={tCommon('edit')}>
                  <FaEdit />
                </div>
              </DialogTrigger>
              <DialogContent className={'w-[calc(100%-1.5rem)] max-w-[1000px] sm:max-w-[1000px] max-h-screen overflow-y-auto'}>
                <BlockForm onSuccess={updateBlocksList} initialData={block} />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger>
                <div className={'cursor-pointer p-1'} aria-label={tCommon('delete')}>
                  <MdDelete />
                </div>
              </DialogTrigger>
              <DialogContent className={'w-[calc(100%-1.5rem)] max-w-md'}>
                <DialogHeader>
                  <DialogTitle>{tCommon('confirmDeleteTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('deleteDescription', { type: block.blockType, pages: block.pages.join(',') })}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className={'flex-col sm:flex-row gap-2'}>
                  <DialogClose asChild>
                    <Button variant="outline" ref={closeRemoveModalRef}>{tCommon('cancel')}</Button>
                  </DialogClose>
                  <Button type="button" onClick={onRemoveBlockClick}>{tCommon('delete')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <div className={'flex flex-wrap gap-2 text-xs'}>
        <span className={'rounded-md bg-muted px-2 py-1 text-muted-foreground ring-1 ring-border'}>
          #{block.order}
        </span>
        <span className={'rounded-md bg-muted px-2 py-1 text-muted-foreground ring-1 ring-border uppercase'}>
          {block.languages.join(', ')}
        </span>
        <span className={'rounded-md bg-muted px-2 py-1 text-muted-foreground ring-1 ring-border'}>
          {positionLabel}
        </span>
      </div>
    </div>
  )
}
