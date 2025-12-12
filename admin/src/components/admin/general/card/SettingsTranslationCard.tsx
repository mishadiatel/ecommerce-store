import { GeneralSettingsTranslation } from '@/types/general';
import SettingsTranslationForm from '@/components/admin/general/form/SettingsTranslationForm';

interface SettingsTranslationCardProps {
  settingsTranslation: GeneralSettingsTranslation;
}

export default function SettingsTranslationCard ({settingsTranslation}: SettingsTranslationCardProps) {

  return (
    <div className={'flex flex-col gap-6 flex-grow'}>
      <span >{settingsTranslation.language}</span>
      <SettingsTranslationForm settingsTranslation={settingsTranslation} />
    </div>
  )
}