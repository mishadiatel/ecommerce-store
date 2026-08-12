'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import { Checkbox } from '@/components/admin/shadcnuiComponents/checkbox';
import PageControl from '@/components/admin/ui/pageControl';
import { getAdminUsers } from '@/services/adminUsers';
import type { AdminUserListItem } from '@/types/adminUser';

export default function UsersList() {
  const t = useTranslations('users');
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [searchWord, setSearchWord] = useState('');
  const [onlyAbandonedCart, setOnlyAbandonedCart] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | undefined>();
  const [totalDocuments, setTotalDocuments] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const limit = 25;

  const fetchUsers = () => {
    setIsLoading(true);
    getAdminUsers({
      page: currentPage,
      limit,
      search: searchWord.trim() || undefined,
      hasAbandonedCart: onlyAbandonedCart ? true : undefined,
    })
      .then((res) => {
        setUsers(res?.data ?? []);
        setTotalPages(res?.totalPages);
        setTotalDocuments(res?.totalDocuments);
      })
      .catch(() => toast.error(t('loadError')))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [onlyAbandonedCart]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, onlyAbandonedCart]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers();
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchWord]);

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
        <div className="flex items-center gap-2">
          <Checkbox
            id="onlyAbandonedCart"
            checked={onlyAbandonedCart}
            onCheckedChange={(v) => setOnlyAbandonedCart(v === true)}
          />
          <label htmlFor="onlyAbandonedCart" className="text-sm cursor-pointer">
            {t('onlyAbandonedCart')}
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">…</div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t('empty')}
          </div>
        ) : (
          <>
            {users.map((u) => (
              <Link
                key={u._id}
                href={`/adminPanel/admin823479234/users/${u._id}`}
                className={[
                  'rounded-xl border p-4 flex flex-col md:flex-row md:items-center gap-3',
                  'transition-colors hover:bg-accent/50',
                  u.hasAbandonedCart
                    ? 'border-amber-500/50 bg-amber-500/5'
                    : 'border-border bg-card',
                ].join(' ')}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold truncate">
                      {u.firstName || u.lastName
                        ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
                        : t('noName')}
                    </span>
                    {u.role === 'admin' && (
                      <span className="px-2 py-0.5 rounded-md text-xs bg-purple-500/15 text-purple-700 dark:text-purple-300 font-medium">
                        admin
                      </span>
                    )}
                    {!u.isActivated && (
                      <span className="px-2 py-0.5 rounded-md text-xs bg-gray-500/15 text-gray-700 dark:text-gray-300 font-medium">
                        {t('notActivated')}
                      </span>
                    )}
                    {u.hasAbandonedCart && (
                      <span className="px-2 py-0.5 rounded-md text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium inline-flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        {t('abandonedCartBadge', {
                          count: u.cartItemsCount,
                        })}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {u.email}
                    {u.phoneNumber ? ` · ${u.phoneNumber}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {t('ordersCount')}
                    </div>
                    <div className="font-semibold tabular-nums">
                      {u.ordersCount}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {t('totalSpent')}
                    </div>
                    <div className="font-semibold tabular-nums">
                      {u.totalSpent} ₴
                    </div>
                  </div>
                  {u.hasAbandonedCart && (
                    <ShoppingCart className="w-5 h-5 text-amber-600" />
                  )}
                </div>
              </Link>
            ))}
            {totalPages && totalDocuments && (
              <PageControl
                currentPage={currentPage}
                limit={limit}
                totalDocuments={totalDocuments}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                documentsLength={users.length}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
