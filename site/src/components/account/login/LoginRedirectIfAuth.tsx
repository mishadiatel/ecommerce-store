'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from '@/i18n/navigation';

export default function LoginRedirectIfAuth() {
  const router = useRouter();
  const isAuth = useAuthStore(s => s.isAuth);
  const isLoading = useAuthStore(s => s.isLoading);

  useEffect(() => {
    if (!isLoading && isAuth) {
      router.replace('/account/profile');
    }
  }, [isAuth, isLoading, router]);

  return null;
}
