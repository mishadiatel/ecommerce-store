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
  BarChart3,
  Users,
  Search,
  Contact,
  Inbox,
  X,
  type LucideIcon,
} from 'lucide-react';
import { usePathname } from '@/i18n/navigation';
import { useSidebar } from '@/components/admin/layout/sidebarContext/SidebarContext';
import LanguageSwitcher from "@/components/admin/layout/languageSwitcher/LanguageSwitcher";

interface NavItem {
  key:
    | 'dashboard'
    | 'stats'
    | 'pagesControl'
    | 'blocks'
    | 'mailTemplates'
    | 'category'
    | 'product'
    | 'orders'
    | 'users'
    | 'popularQueries'
    | 'contacts'
    | 'feedbacks'
    | 'promoCodes';
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', href: '/adminPanel/admin823479234/dashboard', icon: LayoutDashboard },
  { key: 'stats', href: '/adminPanel/admin823479234/stats', icon: BarChart3 },
  { key: 'orders', href: '/adminPanel/admin823479234/orders', icon: ClipboardList },
  { key: 'users', href: '/adminPanel/admin823479234/users', icon: Users },
  { key: 'product', href: '/adminPanel/admin823479234/product', icon: ShoppingBag },
  { key: 'category', href: '/adminPanel/admin823479234/category', icon: FolderTree },
  { key: 'promoCodes', href: '/adminPanel/admin823479234/promoCodes', icon: Ticket },
  { key: 'popularQueries', href: '/adminPanel/admin823479234/popularQueries', icon: Search },
  { key: 'feedbacks', href: '/adminPanel/admin823479234/feedbacks', icon: Inbox },
  { key: 'contacts', href: '/adminPanel/admin823479234/contacts', icon: Contact },
  { key: 'pagesControl', href: '/adminPanel/admin823479234/pagesControl', icon: FileText },
  { key: 'blocks', href: '/adminPanel/admin823479234/blocks', icon: Layers },
  { key: 'mailTemplates', href: '/adminPanel/admin823479234/mailTemplates', icon: Mail },
];

export default function AdminAside() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const { isOpen, close } = useSidebar();

  const navContent = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
        // Матчимо не тільки останній сегмент, а весь шлях —
        // щоб на /users/:id підсвітлювався пункт "users".
        const isActive = segments.includes(key);
        return (
          <Link
            key={key}
            href={href}
            onClick={close}
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
  );

  return (
    <>
      {/* Desktop sidebar (≥ lg) */}
      <aside
        className={[
          'hidden lg:flex flex-col flex-[0_0_240px] self-start sticky top-[80px]',
          'rounded-xl border border-border bg-sidebar text-sidebar-foreground',
          'p-3 shadow-sm',
        ].join(' ')}
      >
        {navContent}
      </aside>

      {/* Mobile overlay */}
      <div
        className={[
          'lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        aria-hidden={!isOpen}
        onClick={close}
      />

      {/* Mobile drawer (< lg) */}
      <aside
        className={[
          'lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px] max-w-[85vw]',
          'flex flex-col bg-sidebar text-sidebar-foreground',
          'border-r border-border shadow-xl',
          'transform transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-border p-3">
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {tCommon('navigation')}
          </span>
          <button
            type="button"
            onClick={close}
            aria-label={tCommon('close')}
            className="grid h-8 w-8 place-items-center rounded-md hover:bg-sidebar-accent/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
            {navContent}
            <div className={'py-4 sm:hidden'}>
                <LanguageSwitcher />
            </div>
        </div>

      </aside>
    </>
  );
}
