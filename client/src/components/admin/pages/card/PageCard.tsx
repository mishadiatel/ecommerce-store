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
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import EditPageForm from '@/components/admin/pages/forms/EditPage';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { useRef } from 'react';
import { deletePage } from '@/services/pages';
import { toast } from 'react-toastify';

interface PageCardProps {
  page: Page;
  updatePagesList: () => void;
}

export default function PageCard({page, updatePagesList}: PageCardProps) {
  const closeRemoveModalRef = useRef<HTMLButtonElement>(null);
  const onRemovePageClick = () => {
    deletePage(page._id)
      .then(data => {
        toast.success('successfully removed');
        updatePagesList();
      }).catch(error => {
        toast.error('problem with removing, try again letter');
    }).finally(() => {
      closeRemoveModalRef.current?.click();
    })
  }
  return (
    <div className={'flex justify-between'}>
      <div> {page.slug}</div>
      <div> {page.language}</div>
      <div>{page.title}</div>
      <div>{page.index ? 'index' : 'noindex'}, {page.follow ? 'follow' : 'nofollow'}</div>
      <div className={'flex gap-5'}>
        <Dialog>
          <DialogTrigger>
            <div className={'cursor-pointer'}>
              <FaEdit />
            </div>
          </DialogTrigger>
          <DialogContent>
            <EditPageForm page={page} updatePageList={updatePagesList} />
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
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                You will delete page with page {page.language} {page.slug} {page.title}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" ref={closeRemoveModalRef}>Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={onRemovePageClick}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}