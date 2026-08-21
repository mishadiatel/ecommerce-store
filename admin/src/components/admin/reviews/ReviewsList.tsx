'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { Star, Trash2, Plus, Check, X as XIcon, Pencil } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/shadcnuiComponents/select';
import PageControl from '@/components/admin/ui/pageControl';
import { deleteReview, getReviews, updateReview } from '@/services/reviews';
import { Review } from '@/types/review';
import { getAdminProducts } from '@/services/product';
import { FullProductWithTranslations } from '@/types/product';
import { LANGUAGES_LIST } from '@/variables/languages';
import ReviewFormDialog from '@/components/admin/reviews/ReviewFormDialog';
import ProductSearchSelect from '@/components/admin/reviews/ProductSearchSelect';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ReviewsList() {
  const t = useTranslations('reviewsPage');
  const tCommon = useTranslations('common');

  const [items, setItems] = useState<Review[]>([]);
  const [products, setProducts] = useState<FullProductWithTranslations[]>([]);
  const [productFilter, setProductFilter] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | undefined>();
  const [totalDocuments, setTotalDocuments] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const limit = 25;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);

  useEffect(() => {
    getAdminProducts({ page: 1, limit: 500 })
      .then((res) => setProducts(res?.data ?? []))
      .catch(() => {});
  }, []);

  const productMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of products) {
      map[p._id] = p.translations?.[0]?.title ?? p.slug;
    }
    return map;
  }, [products]);

  const fetchList = () => {
    setIsLoading(true);
    const q: Record<string, string | number> = { page: currentPage, limit };
    if (productFilter) q.productId = productFilter;
    if (languageFilter !== 'all') q.language = languageFilter;
    if (visibilityFilter !== 'all') q.isVisible = visibilityFilter;
    getReviews(q)
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
  }, [productFilter, languageFilter, visibilityFilter]);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, productFilter, languageFilter, visibilityFilter]);

  const handleToggleVisible = async (r: Review) => {
    try {
      await updateReview(r._id, { isVisible: !r.isVisible });
      setItems((prev) =>
        prev.map((it) => (it._id === r._id ? { ...it, isVisible: !r.isVisible } : it)),
      );
    } catch {
      toast.error(t('toast.updateError'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReview(id);
      toast.success(t('toast.deleted'));
      fetchList();
    } catch {
      toast.error(t('toast.deleteError'));
    }
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (r: Review) => {
    setEditing(r);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="w-full sm:w-fit">
        <Button className="w-full sm:w-auto" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> {t('addButton')}
        </Button>
      </div>

      <div className="admin-filters">
        <div className="admin-filter-select" style={{ minWidth: 260 }}>
          <ProductSearchSelect
            products={products}
            value={productFilter}
            onChange={setProductFilter}
            placeholder={t('productFilter')}
            allowClear
          />
        </div>
        <div className="admin-filter-select">
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('languageFilter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allLanguages')}</SelectItem>
              {LANGUAGES_LIST.map((l) => (
                <SelectItem key={l._id} value={l._id}>
                  {l.text.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="admin-filter-select">
          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('visibilityFilter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allVisibility')}</SelectItem>
              <SelectItem value="true">{t('visibleOnly')}</SelectItem>
              <SelectItem value="false">{t('hiddenOnly')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">…</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t('empty')}
          </div>
        ) : (
          <>
            {items.map((r) => (
              <div
                key={r._id}
                className={`admin-card p-4 flex flex-col gap-2 ${!r.isVisible ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">
                      {r.firstName} {r.lastName}
                    </span>
                    <span className="text-xs uppercase text-muted-foreground">{r.language}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-3.5 h-3.5 `}
                          style={n <= r.rating ? {fill: "yellow", color: "yellow"} : {color: 'white'}}
                        />
                      ))}
                    </div>
                    {!r.isVisible && (
                      <span className="px-2 py-0.5 rounded-md text-xs bg-gray-500/15 text-gray-700 dark:text-gray-300">
                        {t('hiddenBadge')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                      <Pencil className="w-4 h-4 mr-1" /> {t('edit')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggleVisible(r)}>
                      {r.isVisible ? (
                        <>
                          <XIcon className="w-4 h-4 mr-1" /> {t('hide')}
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" /> {t('show')}
                        </>
                      )}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[calc(100%-1.5rem)] max-w-md">
                        <DialogHeader>
                          <DialogTitle>{tCommon('confirmDeleteTitle')}</DialogTitle>
                          <DialogDescription>
                            {t('deleteDescription', { name: `${r.firstName} ${r.lastName}` })}
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                          <DialogClose asChild>
                            <Button variant="outline">{tCommon('cancel')}</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button onClick={() => handleDelete(r._id)}>{tCommon('delete')}</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {productMap[r.productId] ?? r.productId} · {formatDate(r.createdAt)}
                </div>
                <div className="text-sm whitespace-pre-wrap">{r.comment}</div>
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

      <ReviewFormDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={fetchList}
        products={products}
        editing={editing}
      />
    </>
  );
}
