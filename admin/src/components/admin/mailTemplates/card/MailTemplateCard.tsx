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
    <div className={'admin-card flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4'}>
      <div className={'min-w-0 flex-1'}>
        <div className={'flex items-center gap-2'}>
          <span className={'font-medium truncate'}>{mailTemplate.slug}</span>
          <span className={'rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border uppercase flex-shrink-0'}>
            {mailTemplate.language}
          </span>
        </div>
        <div className={'text-xs text-muted-foreground truncate mt-1'}>
          {mailTemplate.subject}
        </div>
      </div>

      <div className={'flex gap-4 sm:gap-5 justify-end sm:justify-start sm:ml-auto'}>
        <Dialog>
          <DialogTrigger>
            <div className={'cursor-pointer p-1'} aria-label={tCommon('edit')}>
              <FaEdit />
            </div>
          </DialogTrigger>
          <DialogContent className={'w-[calc(100%-1.5rem)] max-w-[1000px] sm:max-w-[1000px] max-h-screen overflow-y-auto'}>
            {/*<EditPageForm page={page} updatePageList={updatePagesList} />*/}
            <MailTemplateForm mailTemplate={mailTemplate} onSuccess={updateMailTemplatesList} />
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
                {t('deleteDescription', { language: mailTemplate.language, slug: mailTemplate.slug })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className={'flex-col sm:flex-row gap-2'}>
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
