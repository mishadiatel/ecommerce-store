'use client';
import { useTranslations } from 'next-intl';
import LoginForm from '@/components/admin/login/form/LoginForm';
import LanguageSwitcher from '@/components/admin/layout/languageSwitcher/LanguageSwitcher';
import ThemeToggle from '@/components/admin/themeProvider/ThemeToggle';

export default function Login() {
  const t = useTranslations('login');

  return (
    <div className="admin-panel-shell min-h-screen flex items-center justify-center p-4">
      {/* Top-right controls for locale + theme also accessible from login */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="admin-card p-5 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
              EC
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {t('title')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t('subtitle')}
              </p>
            </div>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
