'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/admin/shadcnuiComponents/dialog';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { Eye, EyeOff } from 'lucide-react';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { PopularQuery } from '@/types/popularQuery';
import { deletePopularQuery } from '@/services/popularQuery';
import PopularQueryForm from '@/components/admin/popularQueries/PopularQueryForm';

interface Props {
  item: PopularQuery;
  updateList: () => void;
}

export default function PopularQueryCard({ item, updateList }: Props) {
  const t = useTranslations('popularQueriesPage');
  const tCommon = useTranslations('common');
  const closeRef = useRef<HTMLButtonElement>(null);

  const onRemoveClick = () => {
    deletePopularQuery(item._id)
      .then(() => {
        toast.success(t('toast.deleted'));
        updateList();
      })
      .catch(() => {
        toast.error(t('toast.deleteError'));
      })
      .finally(() => {
        closeRef.current?.click();
      });
  };

  return (
    <div className="admin-card flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{item.queryText}</span>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border uppercase flex-shrink-0">
            {item.language}
          </span>
          {item.visible ? (
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30">
              <Eye className="w-3 h-3" /> {t('visibleBadge')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs bg-gray-500/15 text-gray-700 dark:text-gray-300 ring-1 ring-gray-500/30">
              <EyeOff className="w-3 h-3" /> {t('hiddenBadge')}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-4 sm:gap-5 justify-end sm:justify-start sm:ml-auto">
        <Dialog>
          <DialogTrigger>
            <div className="cursor-pointer p-1" aria-label={tCommon('edit')}>
              <FaEdit />
            </div>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-1.5rem)] max-w-[600px] sm:max-w-[600px] max-h-screen overflow-y-auto">
            <PopularQueryForm item={item} onSuccess={updateList} />
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger>
            <div className="cursor-pointer p-1" aria-label={tCommon('delete')}>
              <MdDelete />
            </div>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-1.5rem)] max-w-md max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{tCommon('confirmDeleteTitle')}</DialogTitle>
              <DialogDescription>
                {t('deleteDescription', {
                  queryText: item.queryText,
                  language: item.language,
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <DialogClose asChild>
                <Button variant="outline" ref={closeRef}>
                  {tCommon('cancel')}
                </Button>
              </DialogClose>
              <Button type="button" onClick={onRemoveClick}>
                {tCommon('delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
