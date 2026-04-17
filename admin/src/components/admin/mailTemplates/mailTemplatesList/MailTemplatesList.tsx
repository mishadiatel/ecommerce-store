'use client';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/admin/shadcnuiComponents/dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import { toast } from 'react-toastify';
import { MailTemplate } from '@/types/mailTemplate';
import { getMailTemplate } from '@/services/mailTemplate';
import MailTemplateCard from '@/components/admin/mailTemplates/card/MailTemplateCard';
import MailTemplateForm from '@/components/admin/mailTemplates/forms/MailTeplateForm';
import PageControl from '@/components/admin/ui/pageControl';


export default function MailTemplatesList() {
  const t = useTranslations('mailTemplatesPage');
  const isFirstRender = useRef(true);
  const [templatesState, setTemplatesState] = useState<MailTemplate[] | undefined>([]);
  const [searchWord, setSearchWord] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [totalDocuments, setTotalDocuments] = useState<number | undefined>(undefined);
  const [limit, setLimit] = useState<number>(10);

  const updateEmailTemplatesList = () => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const query: Record<string, string | number> = {
      page: currentPage,
      limit: limit,
    };
    if (searchWord.trim()) {
      query.search = searchWord.trim();
    }
    getMailTemplate(query).then((templatesResult) => {
      setTemplatesState(templatesResult?.data);
      setTotalPages(templatesResult?.totalPages);
      setTotalDocuments(templatesResult?.totalDocuments);
    }).catch((err) => {
      toast.error(t('toast.loadError'));
    });
  };

  useEffect(() => {
    updateEmailTemplatesList();
  }, [currentPage]);

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
            <Button>{t('addButton')}</Button>
          </DialogTrigger>
          <DialogContent className={'max-w-[1000px] sm:max-w-[1000px] max-h-screen overflow-y-auto'}>
            {/*<AddPageForm updatePagesList={updatePagesList} />*/}
            <MailTemplateForm onSuccess={updateEmailTemplatesList} />
          </DialogContent>
        </Dialog>
      </div>

      <Input type={'text'}
             placeholder={t('searchPlaceholder')}
             className={'w-[200px] flex-shrink max-w-full max-[500px]:w-full'}
             value={searchWord}
             onChange={e => setSearchWord(e.target.value)}
      />

      <div className={'flex flex-col gap-5'}>
        {templatesState && templatesState.length > 0 ? (
          <>
            {templatesState.map((emailTemplate) => (
              <MailTemplateCard mailTemplate={emailTemplate} key={emailTemplate._id}
                                updateMailTemplatesList={updateEmailTemplatesList} />
            ))}
            {totalPages && totalDocuments && (
              <PageControl currentPage={currentPage} limit={limit} totalDocuments={totalDocuments}
                           setCurrentPage={setCurrentPage} totalPages={totalPages}
                           documentsLength={templatesState.length} />
            )}
          </>
        ) : (
          <div>{t('notFound')}</div>
        )}
      </div>
    </>
  );
}
