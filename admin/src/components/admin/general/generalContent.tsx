'use client'

import GeneralForm from '@/components/admin/general/form/GeneralForm';
import SettingsTranslationsList from '@/components/admin/general/settingsTranslationsList/SettingsTranslationsList';
import { useEffect, useState } from 'react';
import { GeneralSettings, GeneralSettingsTranslation } from '@/types/general';
import { getSettings, getSettingsTranslations } from '@/services/general';

export default function GeneralContent() {
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
          <div>General settings</div>
          <GeneralForm generalSettings={generalSettings} />
          <div>Translations</div>
          <SettingsTranslationsList translations={generalSettingsTranslation} />
        </>
      )}

    </>
  )
}