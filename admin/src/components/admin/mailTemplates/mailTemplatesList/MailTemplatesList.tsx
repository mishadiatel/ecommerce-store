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
import { MailTemplate } from '@/types/mailTemplate';
import { getMailTemplate } from '@/services/mailTemplate';
import MailTemplateCard from '@/components/admin/mailTemplates/card/MailTemplateCard';
import MailTemplateForm from '@/components/admin/mailTemplates/forms/MailTeplateForm';



export default function MailTemplatesList () {
  const isFirstRender = useRef(true);
  const [templatesState, setTemplatesState] = useState<MailTemplate[] | undefined>([]);
  const [searchWord, setSearchWord] = useState('');

  const updateEmailTemplatesList = () => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    getMailTemplate(searchWord ? {search: searchWord.toString()} : {}).then((templatesResult) => {
      setTemplatesState(templatesResult);
    }).catch((err) => {
      toast.error('error loading email templates.');
    })
  }

  useEffect(() => {
    updateEmailTemplatesList()
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateEmailTemplatesList();
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchWord]);
  return (
    <>
      <div className={'w-fit'}>
        <Dialog>
          <DialogTrigger className={'w-fit'} asChild>
            <Button>Add email template</Button>
          </DialogTrigger>
          <DialogContent className={'max-w-[1000px] sm:max-w-[1000px] max-h-screen overflow-y-auto'}>
            {/*<AddPageForm updatePagesList={updatePagesList} />*/}
            <MailTemplateForm onSuccess={updateEmailTemplatesList} />
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
        {templatesState && templatesState.length > 0 ? templatesState.map((emailTemplate) => (
          <MailTemplateCard mailTemplate={emailTemplate} key={emailTemplate._id} updateMailTemplatesList={updateEmailTemplatesList} />
        )) : (
          <div>not found mail templates</div>
        )}
      </div>
    </>
  )
}