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
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { MailTemplate } from '@/types/mailTemplate';
import { deleteMailTemplate } from '@/services/mailTemplate';
import MailTemplateForm from '@/components/admin/mailTemplates/forms/MailTeplateForm';

interface MailTemplateCardProps {
  mailTemplate: MailTemplate;
  updateMailTemplatesList: () => void;
}

export default function MailTemplateCard({ mailTemplate, updateMailTemplatesList }: MailTemplateCardProps) {
  const t = useTranslations('mailTemplatesPage');
  const tCommon = useTranslations('common');
  const closeRemoveModalRef = useRef<HTMLButtonElement>(null);
  const onRemoveMailTemplateClick = () => {
    deleteMailTemplate(mailTemplate._id)
      .then(data => {
        toast.success(t('toast.deleted'));
        updateMailTemplatesList();
      }).catch(error => {
      toast.error(t('toast.deleteError'));
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
              <DialogTitle>{tCommon('confirmDeleteTitle')}</DialogTitle>
              <DialogDescription>
                {t('deleteDescription', { language: mailTemplate.language, slug: mailTemplate.slug })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" ref={closeRemoveModalRef}>{tCommon('cancel')}</Button>
              </DialogClose>
              <Button type="button" onClick={onRemoveMailTemplateClick}>{tCommon('delete')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
