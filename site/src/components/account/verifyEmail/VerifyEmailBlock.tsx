'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { resendActivation } from '@/services/auth';
import { toast } from 'react-toastify';
import axios from 'axios';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailBlock() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') ?? '';
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const handleResend = async () => {
    if (secondsLeft > 0 || isSending) return;
    if (!email) {
      toast.error(t('Account.verifyEmail.missingEmailError'));
      return;
    }
    setIsSending(true);
    try {
      await resendActivation({ email });
      toast.success(t('Account.verifyEmail.resentSuccess'));
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      let message = t('Account.verifyEmail.resentError');
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string | string[] } | undefined;
        const msg = data?.message;
        if (Array.isArray(msg)) message = msg.join(', ');
        else if (typeof msg === 'string') message = msg;
      }
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const isCooldown = secondsLeft > 0;

  return (
    <div className="my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
      <div className="container">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">
          <div className="w-full bg-extra-light-gray rounded-2xl p-6 sm:p-10 text-center">
            <div className="heading2 mb-4">
              {t('Account.verifyEmail.title')}
            </div>
            <p className="text-base text-gray-90">
              {t.rich('Account.verifyEmail.message', {
                email: () => (
                  <span className="font-semibold text-black">
                    {email || t('Account.verifyEmail.yourEmailFallback')}
                  </span>
                ),
              })}
            </p>
          </div>

          <div className="text-sm sm:text-base text-gray-90 text-center flex flex-wrap items-center justify-center gap-2">
            <span>{t('Account.verifyEmail.didntReceiveQuestion')}</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={isCooldown || isSending}
              className="font-bold uppercase text-sm text-primary-green hover:underline disabled:opacity-60 disabled:cursor-not-allowed disabled:no-underline"
            >
              {isSending
                ? t('Account.verifyEmail.sendingText')
                : t('Account.verifyEmail.resendButton')}
            </button>
            {isCooldown && (
              <span>
                {t('Account.verifyEmail.inSeconds', { seconds: secondsLeft })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
