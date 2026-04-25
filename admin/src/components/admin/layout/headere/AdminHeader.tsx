'use client';

import { LogOut, Menu, UserCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import ThemeToggle from '@/components/admin/themeProvider/ThemeToggle';
import LanguageSwitcher from '@/components/admin/layout/languageSwitcher/LanguageSwitcher';
import { useSidebar } from '@/components/admin/layout/sidebarContext/SidebarContext';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const t = useTranslations('header');
  const tCommon = useTranslations('common');
  const { toggle } = useSidebar();

  return (
    <header
      className={[
        'sticky top-0 z-30 w-full',
        'flex items-center gap-2 sm:gap-4 h-14 sm:h-16 px-3 sm:px-5',
        'border-b border-border',
        'bg-card/80 backdrop-blur-md',
      ].join(' ')}
    >
      {/* Mobile burger */}
      <button
        type="button"
        onClick={toggle}
        aria-label={tCommon('openMenu')}
        className={[
          'lg:hidden grid h-9 w-9 place-items-center rounded-md',
          'border border-border bg-secondary/60 text-foreground',
          'hover:bg-sidebar-accent/60 transition-colors',
        ].join(' ')}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Brand */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div
          className={[
            'grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-lg',
            'bg-gradient-to-br from-primary to-accent',
            'text-primary-foreground font-bold shadow-sm text-xs sm:text-sm',
          ].join(' ')}
          aria-hidden
        >
          EC
        </div>
        <div className="hidden sm:flex flex-col leading-tight min-w-0">
          <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground truncate">
            {t('brandTag')}
          </span>
          <span className="text-sm font-semibold truncate">{t('brandTitle')}</span>
        </div>
      </div>

      {/* Right-side controls */}
      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          <div className={'hidden sm:block'}>
              <LanguageSwitcher />
          </div>

        <ThemeToggle />

        {user && (
          <div
            className={[
              'hidden md:flex items-center gap-2 rounded-full',
              'border border-border bg-secondary/60 px-3 py-1.5',
            ].join(' ')}
          >
            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground truncate max-w-[180px]">
              {user.email}
            </span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="gap-2 px-2 sm:px-3"
          aria-label={t('logout')}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t('logout')}</span>
        </Button>
      </div>
    </header>
  );
}
