'use client';

import { GeneralSettingsTranslation } from '@/types/general';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import SettingsTranslationCard from '@/components/admin/general/card/SettingsTranslationCard';
import { Dialog, DialogContent, DialogTrigger } from '@/components/admin/shadcnuiComponents/dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import SettingsTranslationForm from '@/components/admin/general/form/SettingsTranslationForm';
import { getSettingsTranslations } from '@/services/general';
import { toast } from 'react-toastify';

interface SettingsTranslationsListProps {
  translations?: GeneralSettingsTranslation[];
}

export default function SettingsTranslationsList({ translations }: SettingsTranslationsListProps) {
  const t = useTranslations('general');
  const [translationsState, setTranslationsState] = useState<GeneralSettingsTranslation[]>(translations || []);

  const updateTranslationsList = () => {
    getSettingsTranslations().then((settingsTranslations) => {
      setTranslationsState(settingsTranslations!);
    }).catch((err) => {
      toast.error(t('toast.loadError'));
    })
  }

  return (
    <div className={'flex flex-col gap-8'}>
      <div className={'w-fit'}>
        <Dialog>
          <DialogTrigger className={'w-fit'} asChild>
            <Button>{t('addTranslation')}</Button>
          </DialogTrigger>
          <DialogContent className={'max-w-[1000px] sm:max-w-[1000px] max-h-screen overflow-y-auto'}>
            <SettingsTranslationForm onSuccess={updateTranslationsList} />
          </DialogContent>
        </Dialog>
      </div>
      <div className={'flex flex-col sm:flex-row gap-6'}>
        {translationsState && translationsState.length > 0 ? translationsState.map(translationItem => (
          <SettingsTranslationCard key={translationItem._id} settingsTranslation={translationItem} />
        )) : <div>{t('notFoundTranslations')}</div>}
      </div>
    </div>
  );
}
