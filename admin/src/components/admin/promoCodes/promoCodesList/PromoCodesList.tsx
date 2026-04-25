'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';

import { Input } from '@/components/admin/shadcnuiComponents/input';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/shadcnuiComponents/select';
import PageControl from '@/components/admin/ui/pageControl';

import { getAdminPromoCodes } from '@/services/promoCode';
import { PromoCode } from '@/types/promoCode';
import PromoCodeCard from '@/components/admin/promoCodes/card/PromoCodeCard';
import PromoCodeForm from '@/components/admin/promoCodes/forms/PromoCodeForm';

export default function PromoCodesList() {
  const t = useTranslations('promoCodes');
  const isFirstRender = useRef(true);
  const [list, setList] = useState<PromoCode[] | undefined>([]);
  const [searchWord, setSearchWord] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [totalDocuments, setTotalDocuments] = useState<number | undefined>(undefined);
  const [limit] = useState<number>(25);
  const [status, setStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [createOpen, setCreateOpen] = useState(false);

  const updateList = () => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const query: Record<string, string | number> = {
      page: currentPage,
      limit,
      sortOrder,
    };
    if (searchWord.trim()) query.search = searchWord.trim();
    if (status !== 'all') query.status = status;

    getAdminPromoCodes(query)
      .then((res) => {
        setList(res?.data);
        setTotalPages(res?.totalPages);
        setTotalDocuments(res?.totalDocuments);
      })
      .catch(() => {
        toast.error(t('loadError'));
      });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [status, sortOrder]);

  useEffect(() => {
    updateList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, status, sortOrder]);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateList();
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchWord]);

  return (
    <>
      <div className={'flex gap-4 items-center flex-wrap'}>
        <Input
          type={'text'}
          placeholder={t('searchPlaceholder')}
          className={'w-[280px] flex-shrink max-w-full max-[500px]:w-full'}
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
        />

        <Select value={status} onValueChange={(v) => setStatus(v)}>
          <SelectTrigger className={'w-[180px]'}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={'all'}>{t('allStatuses')}</SelectItem>
            <SelectItem value={'active'}>{t('active')}</SelectItem>
            <SelectItem value={'inactive'}>{t('inactive')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v)}>
          <SelectTrigger className={'w-[180px]'}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={'desc'}>{t('sortNewest')}</SelectItem>
            <SelectItem value={'asc'}>{t('sortOldest')}</SelectItem>
          </SelectContent>
        </Select>

        <div className={'ml-auto'}>
          <Button onClick={() => setCreateOpen(true)}>
            + {t('createButton')}
          </Button>
        </div>
      </div>

      <div className={'flex flex-col gap-5'}>
        {list && list.length > 0 ? (
          <>
            {list.map((promoCode) => (
              <PromoCodeCard
                key={promoCode._id}
                promoCode={promoCode}
                updateList={updateList}
              />
            ))}
            {totalPages && totalDocuments && (
              <PageControl
                currentPage={currentPage}
                limit={limit}
                totalDocuments={totalDocuments}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                documentsLength={list.length}
              />
            )}
          </>
        ) : (
          <div>{t('empty')}</div>
        )}
      </div>

      <PromoCodeForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={updateList}
      />
    </>
  );
}
