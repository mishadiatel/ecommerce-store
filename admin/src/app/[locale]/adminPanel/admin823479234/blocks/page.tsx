'use client'
import BlocksList from '@/components/admin/blocks/blocksList/BlocksList';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';

export default function AdminBlocks () {
  const { isAuthenticated } = useAuth();
  const router = useRouter()

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <div className={'flex flex-col gap-8'}>
        <div>Blocks</div>
        <BlocksList />
      </div>
    </div>
  );
}