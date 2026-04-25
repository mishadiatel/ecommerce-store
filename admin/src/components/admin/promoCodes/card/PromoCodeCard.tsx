'use client';

import { useRef, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { DialogClose } from '@radix-ui/react-dialog';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/admin/shadcnuiComponents/dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';

import PromoCodeForm from '@/components/admin/promoCodes/forms/PromoCodeForm';
import { deleteAdminPromoCode } from '@/services/promoCode';
import { PromoCode, PromoDiscountType } from '@/types/promoCode';

interface PromoCodeCardProps {
  promoCode: PromoCode;
  updateList: () => void;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
}

export default function PromoCodeCard({
  promoCode,
  updateList,
}: PromoCodeCardProps) {
  const t = useTranslations('promoCodes');
  const tCommon = useTranslations('common');
  const [editOpen, setEditOpen] = useState(false);
  const closeDeleteRef = useRef<HTMLButtonElement>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAdminPromoCode(promoCode._id);
      toast.success(t('toast.deleted'));
      updateList();
    } catch {
      toast.error(t('toast.deleteError'));
    } finally {
      setDeleting(false);
      closeDeleteRef.current?.click();
    }
  };

  const discountLabel =
    promoCode.discountType === PromoDiscountType.PERCENT
      ? `${promoCode.discountValue}%`
      : `${promoCode.discountValue} ₴`;

  const usesLabel =
    promoCode.maxUses === null
      ? `${promoCode.currentUses} / ∞`
      : `${promoCode.currentUses} / ${promoCode.maxUses}`;

  return (
    <div className={'admin-card flex flex-col gap-2 p-4'}>
      <div className={'flex items-center justify-between flex-wrap gap-2'}>
        <div className={'flex items-center gap-3'}>
          <div className={'font-mono font-semibold text-lg uppercase'}>
            {promoCode.code}
          </div>
          <span
            className={[
              'px-2 py-1 rounded-md text-xs',
              promoCode.isActive
                ? 'bg-green-500/15 text-green-600 dark:text-green-300 ring-1 ring-green-500/30'
                : 'bg-red-500/15 text-red-600 dark:text-red-300 ring-1 ring-red-500/30',
            ].join(' ')}
          >
            {promoCode.isActive ? t('active') : t('inactive')}
          </span>
          <span
            className={
              'px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground ring-1 ring-border'
            }
          >
            {discountLabel}
          </span>
        </div>

        <div className={'flex gap-3 items-center'}>
          {promoCode.isActive ? (
            <AiFillEye className={'text-green-600'} />
          ) : (
            <AiFillEyeInvisible className={'text-red-600'} />
          )}

          <button
            type={'button'}
            className={'cursor-pointer'}
            onClick={() => setEditOpen(true)}
            aria-label={tCommon('edit')}
          >
            <FaEdit />
          </button>

          <Dialog>
            <DialogTrigger asChild>
              <button className={'cursor-pointer p-1'} aria-label={tCommon('delete')}>
                <MdDelete />
              </button>
            </DialogTrigger>
            <DialogContent className={'w-[calc(100%-1.5rem)] max-w-md'}>
              <DialogHeader>
                <DialogTitle>{tCommon('confirmDeleteTitle')}</DialogTitle>
                <DialogDescription>
                  {t('deleteDescription', { code: promoCode.code })}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className={'flex-col sm:flex-row gap-2'}>
                <DialogClose asChild>
                  <Button variant={'outline'} ref={closeDeleteRef}>
                    {tCommon('cancel')}
                  </Button>
                </DialogClose>
                <Button type={'button'} onClick={handleDelete} disabled={deleting}>
                  {deleting ? tCommon('deleting') : tCommon('delete')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className={'grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm'}>
        <div>
          <div className={'text-muted-foreground text-xs'}>{t('usesLabel')}</div>
          <div>{usesLabel}</div>
        </div>
        <div>
          <div className={'text-muted-foreground text-xs'}>
            {t('minOrderAmountLabel')}
          </div>
          <div>
            {promoCode.minOrderAmount
              ? `${promoCode.minOrderAmount} ₴`
              : '—'}
          </div>
        </div>
        <div>
          <div className={'text-muted-foreground text-xs'}>
            {t('validFromLabel')}
          </div>
          <div>{formatDate(promoCode.validFrom)}</div>
        </div>
        <div>
          <div className={'text-muted-foreground text-xs'}>
            {t('validToLabel')}
          </div>
          <div>{formatDate(promoCode.validTo)}</div>
        </div>
      </div>

      {promoCode.description && (
        <div className={'text-sm text-muted-foreground'}>
          {promoCode.description}
        </div>
      )}

      <PromoCodeForm
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={promoCode}
        onSuccess={updateList}
      />
    </div>
  );
}
