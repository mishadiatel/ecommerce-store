'use client';
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
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { useRef } from 'react';
import { toast } from 'react-toastify';
import { MailTemplate } from '@/types/mailTemplate';
import { deleteMailTemplate } from '@/services/mailTemplate';
import MailTemplateForm from '@/components/admin/mailTemplates/forms/MailTeplateForm';

interface MailTemplateCardProps {
  mailTemplate: MailTemplate;
  updateMailTemplatesList: () => void;
}

export default function MailTemplateCard({ mailTemplate, updateMailTemplatesList }: MailTemplateCardProps) {
  const closeRemoveModalRef = useRef<HTMLButtonElement>(null);
  const onRemoveMailTemplateClick = () => {
    deleteMailTemplate(mailTemplate._id)
      .then(data => {
        toast.success('successfully removed');
        updateMailTemplatesList();
      }).catch(error => {
      toast.error('problem with removing, try again letter');
    }).finally(() => {
      closeRemoveModalRef.current?.click();
    });
  };
  return (
    <div className={'flex justify-between'}>
      <div> {mailTemplate.slug}</div>
      <div> {mailTemplate.language}</div>
      <div>{mailTemplate.subject}</div>

      <div className={'flex gap-5'}>
        <Dialog>
          <DialogTrigger>
            <div className={'cursor-pointer'}>
              <FaEdit />
            </div>
          </DialogTrigger>
          <DialogContent className={'max-w-[1000px] sm:max-w-[1000px] max-h-screen overflow-y-auto'}>
            {/*<EditPageForm page={page} updatePageList={updatePagesList} />*/}
            <MailTemplateForm mailTemplate={mailTemplate} onSuccess={updateMailTemplatesList} />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger>
            <div className={'cursor-pointer'}>
              <MdDelete />
            </div>
          </DialogTrigger>
          <DialogContent className={'max-h-screen overflow-y-auto'}>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                You will delete mail template {mailTemplate.language} {mailTemplate.slug}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" ref={closeRemoveModalRef}>Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={onRemoveMailTemplateClick}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}