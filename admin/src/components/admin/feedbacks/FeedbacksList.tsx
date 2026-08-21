'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { Mail, Phone, User, Check, Trash2 } from 'lucide-react';
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
import {
  deleteFeedback,
  getFeedbacks,
  markFeedbackRead,
} from '@/services/feedback';
import { Feedback } from '@/types/feedback';

const FEEDBACK_TYPES = ['contacts'] as const;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function FeedbacksList() {
  const t = useTranslations('feedbacksPage');
  const tCommon = useTranslations('common');
  const [items, setItems] = useState<Feedback[]>([]);
  const [searchWord, setSearchWord] = useState('');
  const [type, setType] = useState<string>('all');
  const [isReadFilter, setIsReadFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | undefined>();
  const [totalDocuments, setTotalDocuments] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const limit = 25;

  const fetchList = () => {
    setIsLoading(true);
    const query: Record<string, string | number> = {
      page: currentPage,
      limit,
    };
    if (searchWord.trim()) query.search = searchWord.trim();
    if (type && type !== 'all') query.type = type;
    if (isReadFilter === 'true') query.isRead = 'true';
    if (isReadFilter === 'false') query.isRead = 'false';

    getFeedbacks(query)
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
  }, [type, isReadFilter]);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, type, isReadFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchList();
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchWord]);

  const handleToggleRead = async (item: Feedback) => {
    try {
      await markFeedbackRead(item._id, !item.isRead);
      setItems((prev) =>
        prev.map((f) =>
          f._id === item._id ? { ...f, isRead: !item.isRead } : f,
        ),
      );
    } catch {
      toast.error(t('toast.updateError'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFeedback(id);
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
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('typePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allTypes')}</SelectItem>
              {FEEDBACK_TYPES.map((typeKey) => (
                <SelectItem key={typeKey} value={typeKey}>
                  {t(`types.${typeKey}` as never)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="admin-filter-select">
          <Select value={isReadFilter} onValueChange={setIsReadFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('statusPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="false">{t('unread')}</SelectItem>
              <SelectItem value="true">{t('read')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">…</div>
        ) : items.length === 0 ? (
          <div>{t('empty')}</div>
        ) : (
          <>
            {items.map((f) => (
              <div
                key={f._id}
                className={`admin-card p-4 flex flex-col gap-2 ${!f.isRead ? 'border-2 border-amber-500/40 bg-amber-500/5' : ''}`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-xs bg-purple-500/15 text-purple-700 dark:text-purple-300 font-medium uppercase">
                      {t(`types.${f.type}` as never, {
                        fallback: f.type,
                      } as never)}
                    </span>
                    {!f.isRead && (
                      <span className="px-2 py-0.5 rounded-md text-xs bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">
                        {t('newBadge')}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(f.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleRead(f)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {f.isRead ? t('markUnread') : t('markRead')}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[calc(100%-1.5rem)] max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {tCommon('confirmDeleteTitle')}
                          </DialogTitle>
                          <DialogDescription>
                            {t('deleteDescription', {
                              name: `${f.firstName} ${f.lastName}`,
                            })}
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                          <DialogClose asChild>
                            <Button variant="outline">
                              {tCommon('cancel')}
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button onClick={() => handleDelete(f._id)}>
                              {tCommon('delete')}
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="inline-flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {f.firstName} {f.lastName}
                    </span>
                  </div>
                  <a
                    href={`tel:${f.phoneNumber}`}
                    className="inline-flex items-center gap-2 hover:underline"
                  >
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {f.phoneNumber}
                  </a>
                  <a
                    href={`mailto:${f.email}`}
                    className="inline-flex items-center gap-2 hover:underline sm:col-span-2"
                  >
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {f.email}
                  </a>
                </div>

                {f.message && (
                  <div className="mt-2 rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                    {f.message}
                  </div>
                )}
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
