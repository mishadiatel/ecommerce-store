'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Mail,
  FolderTree,
  ShoppingBag,
  ClipboardList,
  Ticket,
  type LucideIcon,
} from 'lucide-react';
import { usePathname } from '@/i18n/navigation';

interface NavItem {
  key:
    | 'dashboard'
    | 'pagesControl'
    | 'blocks'
    | 'mailTemplates'
    | 'category'
    | 'product'
    | 'orders'
    | 'promoCodes';
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', href: '/adminPanel/admin823479234/dashboard', icon: LayoutDashboard },
  { key: 'pagesControl', href: '/adminPanel/admin823479234/pagesControl', icon: FileText },
  { key: 'blocks', href: '/adminPanel/admin823479234/blocks', icon: Layers },
  { key: 'mailTemplates', href: '/adminPanel/admin823479234/mailTemplates', icon: Mail },
  { key: 'category', href: '/adminPanel/admin823479234/category', icon: FolderTree },
  { key: 'product', href: '/adminPanel/admin823479234/product', icon: ShoppingBag },
  { key: 'orders', href: '/adminPanel/admin823479234/orders', icon: ClipboardList },
  { key: 'promoCodes', href: '/adminPanel/admin823479234/promoCodes', icon: Ticket },
];

export default function AdminAside() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  return (
    <aside
      className={[
        'flex flex-col flex-[0_0_240px] self-start sticky top-[80px]',
        'rounded-xl border border-border bg-sidebar text-sidebar-foreground',
        'p-3 shadow-sm',
      ].join(' ')}
    >
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
          const isActive = lastSegment === key;
          return (
            <Link
              key={key}
              href={href}
              className={[
                'group flex items-center gap-3 rounded-lg px-3 py-2.5',
                'text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              ].join(' ')}
            >
              <span
                className={[
                  'grid h-8 w-8 place-items-center rounded-md',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'bg-sidebar-accent/40 text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate">{t(key)}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
