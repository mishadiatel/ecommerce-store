'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { Mail, Trash2 } from 'lucide-react';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/shadcnuiComponents/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/admin/shadcnuiComponents/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import PageControl from '@/components/admin/ui/pageControl';
import { deleteSubscriber, getSubscribers } from '@/services/subscribers';
import { Subscriber } from '@/types/subscriber';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function SubscribersList() {
  const t = useTranslations('subscribersPage');
  const tCommon = useTranslations('common');
  const [items, setItems] = useState<Subscriber[]>([]);
  const [searchWord, setSearchWord] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | undefined>();
  const [totalDocuments, setTotalDocuments] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const limit = 50;

  const fetchList = () => {
    setIsLoading(true);
    const query: Record<string, string | number> = { page: currentPage, limit };
    if (searchWord.trim()) query.search = searchWord.trim();
    if (activeFilter === 'true') query.isActive = 'true';
    if (activeFilter === 'false') query.isActive = 'false';

    getSubscribers(query)
      .then((res) => {
        setItems(res?.data ?? []);
        setTotalPages(res?.totalPages);
        setTotalDocuments(res?.totalDocuments);
      })
      .catch(() => toast.error(t('toast.loadError')))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchList();
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchWord]);

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscriber(id);
      toast.success(t('toast.deleted'));
      fetchList();
    } catch {
      toast.error(t('toast.deleteError'));
    }
  };

  return (
    <>
      <div className="admin-filters">
        <div className="admin-filter-search">
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />
        </div>
        <div className="admin-filter-select">
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('statusPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="true">{t('active')}</SelectItem>
              <SelectItem value="false">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {totalDocuments !== undefined && (
          <div className="text-sm text-muted-foreground self-center">
            {t('total', { count: totalDocuments })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">…</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t('empty')}
          </div>
        ) : (
          <>
            {items.map((s) => (
              <div
                key={s._id}
                className={`admin-card p-3 flex items-center gap-3 ${!s.isActive ? 'opacity-60' : ''}`}
              >
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{s.email}</span>
                    <span className="text-xs uppercase text-muted-foreground">
                      {s.locale}
                    </span>
                    {!s.isActive && (
                      <span className="px-2 py-0.5 rounded-md text-xs bg-gray-500/15 text-gray-700 dark:text-gray-300">
                        {t('unsubscribedBadge')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.source} · {formatDate(s.createdAt)}
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={tCommon('delete')}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[calc(100%-1.5rem)] max-w-md">
                    <DialogHeader>
                      <DialogTitle>{tCommon('confirmDeleteTitle')}</DialogTitle>
                      <DialogDescription>
                        {t('deleteDescription', { email: s.email })}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <DialogClose asChild>
                        <Button variant="outline">{tCommon('cancel')}</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={() => handleDelete(s._id)}>
                          {tCommon('delete')}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
            {totalPages && totalDocuments && (
              <PageControl
                currentPage={currentPage}
                limit={limit}
                totalDocuments={totalDocuments}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                documentsLength={items.length}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
