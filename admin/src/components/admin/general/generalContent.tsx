'use client'

import GeneralForm from '@/components/admin/general/form/GeneralForm';
import SettingsTranslationsList from '@/components/admin/general/settingsTranslationsList/SettingsTranslationsList';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { GeneralSettings, GeneralSettingsTranslation } from '@/types/general';
import { getSettings, getSettingsTranslations } from '@/services/general';

export default function GeneralContent() {
  const t = useTranslations('general');
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | undefined>(undefined);
  const [generalSettingsTranslation, setGeneralSettingsTranslation] = useState<GeneralSettingsTranslation[] | undefined>(undefined);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettings();
        setGeneralSettings(settings);
        const settingsTranslations = await getSettingsTranslations();
        setGeneralSettingsTranslation(settingsTranslations)
      }catch(err) {
        console.error(err);
      }
    }
    fetchSettings()
  }, [])
  return (
    <>
      {generalSettings && generalSettingsTranslation && (
        <>
          <div>{t('sectionSettings')}</div>
          <GeneralForm generalSettings={generalSettings} />
          <div>{t('sectionTranslations')}</div>
          <SettingsTranslationsList translations={generalSettingsTranslation} />
        </>
      )}

    </>
  )
}
