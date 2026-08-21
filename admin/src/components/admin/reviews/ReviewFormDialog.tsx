'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/admin/shadcnuiComponents/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/shadcnuiComponents/select';
import { LANGUAGES_LIST } from '@/variables/languages';
import { FullProductWithTranslations } from '@/types/product';
import { Review } from '@/types/review';
import { createReview, updateReview } from '@/services/reviews';
import ProductSearchSelect from '@/components/admin/reviews/ProductSearchSelect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  products: FullProductWithTranslations[];
  editing?: Review | null;
}

export default function ReviewFormDialog({
  isOpen,
  onClose,
  onSaved,
  products,
  editing,
}: Props) {
  const t = useTranslations('reviewsPage');
  const tCommon = useTranslations('common');
  const isEdit = Boolean(editing);

  const [productId, setProductId] = useState<string>('');
  const [language, setLanguage] = useState<string>('ua');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setProductId(editing.productId);
      setLanguage(editing.language);
      setFirstName(editing.firstName);
      setLastName(editing.lastName);
      setRating(editing.rating);
      setComment(editing.comment);
      setIsVisible(editing.isVisible);
    } else {
      setProductId('');
      setLanguage('ua');
      setFirstName('');
      setLastName('');
      setRating(5);
      setComment('');
      setIsVisible(true);
    }
    setHoverRating(0);
  }, [isOpen, editing]);

  const displayRating = hoverRating || rating;

  const handleSave = async () => {
    if (!productId || !firstName.trim() || !lastName.trim() || !comment.trim()) {
      toast.error(t('toast.emptyFieldsError'));
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error(t('toast.badRating'));
      return;
    }
    setIsSaving(true);
    try {
      if (isEdit && editing) {
        await updateReview(editing._id, {
          productId,
          language,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          rating,
          comment: comment.trim(),
          isVisible,
        });
      } else {
        await createReview({
          productId,
          language,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          rating,
          comment: comment.trim(),
          isVisible,
        });
      }
      toast.success(isEdit ? t('toast.updated') : t('toast.created'));
      onSaved();
      onClose();
    } catch {
      toast.error(isEdit ? t('toast.updateError') : t('toast.createError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-[600px] max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('editTitle') : t('createTitle')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium">{t('product')}</label>
            <div className="mt-1">
              <ProductSearchSelect
                products={products}
                value={productId}
                onChange={setProductId}
                placeholder={t('productPlaceholder')}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{t('language')}</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES_LIST.map((l) => (
                  <SelectItem key={l._id} value={l._id}>
                    {l.text.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{t('firstName')}</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">{t('lastName')}</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{t('rating')}</label>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = n <= displayRating;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setRating(n);
                    }}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 bg-transparent cursor-pointer"
                    aria-label={`Rate ${n}`}
                  >
                    <Star
                      className={`w-7 h-7 pointer-events-none transition-colors`}
                      style={active ? {fill: "yellow", color: "yellow"} : {color: 'white'}}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-sm text-muted-foreground tabular-nums">
                {displayRating}/5
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{t('comment')}</label>
            <textarea
              className="w-full min-h-[100px] mt-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="review-is-visible"
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
            />
            <label htmlFor="review-is-visible" className="text-sm cursor-pointer">
              {t('isVisibleLabel')}
            </label>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline">{tCommon('cancel')}</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isEdit ? tCommon('saveChanges') : t('submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
