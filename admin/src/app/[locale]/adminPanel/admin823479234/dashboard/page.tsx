import { getSettings } from '@/services/general';
import GeneralForm from '@/components/admin/general/form/GeneralForm';

export default async function AdminDashboardPage() {
  const generalSettings = await getSettings();
  return (
    <div className={'flex flex-col gap-8'}>
      <div>General settings</div>
      <GeneralForm generalSettings={generalSettings} />
    </div>
  )
}