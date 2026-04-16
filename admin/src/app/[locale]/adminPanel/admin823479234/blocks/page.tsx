'use client'
import BlocksList from '@/components/admin/blocks/blocksList/BlocksList';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import PageHeader from '@/components/admin/ui/pageHeader';

export default function AdminBlocks() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>Access Denied</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Blocks"
        subtitle="Reusable content blocks that can be placed across your site pages."
      />
      <BlocksList />
    </div>
  );
}
