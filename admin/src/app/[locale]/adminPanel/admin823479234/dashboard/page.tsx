import { getSettings, getSettingsTranslations } from '@/services/general';
import GeneralForm from '@/components/admin/general/form/GeneralForm';
import SettingsTranslationsList from '@/components/admin/general/settingsTranslationsList/SettingsTranslationsList';

export default async function AdminDashboardPage() {
  const generalSettings = await getSettings();
  const settingsTranslations = await getSettingsTranslations();
  console.log(settingsTranslations);
  return (
    <div className={'flex flex-col gap-8'}>
      <div>General settings</div>
      <GeneralForm generalSettings={generalSettings} />
      <div>Translations</div>
      <SettingsTranslationsList translations={settingsTranslations} />
    </div>
  )
}