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
  return (
    <div className={'flex justify-between'}>
      <div> {block.blockType}</div>
      <div> {block.languages.join(',')}</div>
      <div>{block.pages.join(',')}</div>
      <div>{block.order}</div>
      <div>{block.isTop ? 'top' : block.isBottom ? 'bottom' : 'default'}</div>
      <div>{block.visible ? <AiFillEye /> : <AiFillEyeInvisible />}</div>
      <div className={'flex gap-5'}>
        <Dialog>
          <DialogTrigger>
            <div className={'cursor-pointer'}>
              <FaEdit />
            </div>
          </DialogTrigger>
          <DialogContent className={'max-w-[1000px] sm:max-w-[1000px] max-h-screen overflow-y-auto'}>
            <BlockForm onSuccess={updateBlocksList} initialData={block} />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger>
            <div className={'cursor-pointer'}>
              <MdDelete />
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{tCommon('confirmDeleteTitle')}</DialogTitle>
              <DialogDescription>
                {t('deleteDescription', { type: block.blockType, pages: block.pages.join(',') })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" ref={closeRemoveModalRef}>{tCommon('cancel')}</Button>
              </DialogClose>
              <Button type="button" onClick={onRemoveBlockClick}>{tCommon('delete')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
