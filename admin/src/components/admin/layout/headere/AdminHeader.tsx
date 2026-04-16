'use client';

import { LogOut, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import ThemeToggle from '@/components/admin/themeProvider/ThemeToggle';

export default function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header
      className={[
        'sticky top-0 z-30 w-full',
        'flex items-center gap-4 h-16 px-5',
        'border-b border-border',
        'bg-card/80 backdrop-blur-md',
      ].join(' ')}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div
          className={[
            'grid h-9 w-9 place-items-center rounded-lg',
            'bg-gradient-to-br from-primary to-accent',
            'text-primary-foreground font-bold shadow-sm',
          ].join(' ')}
          aria-hidden
        >
          EC
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            ecommerce
          </span>
          <span className="text-sm font-semibold">Admin panel</span>
        </div>
      </div>

      {/* Right-side controls */}
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />

        {user && (
          <div
            className={[
              'hidden sm:flex items-center gap-2 rounded-full',
              'border border-border bg-secondary/60 px-3 py-1.5',
            ].join(' ')}
          >
            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground truncate max-w-[180px]">
              {user.email}
            </span>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
