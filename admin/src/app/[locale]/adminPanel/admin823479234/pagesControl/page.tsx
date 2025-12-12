import { getPages } from '@/services/pages';
import PagesList from '@/components/admin/pages/pagesList/PagesList';

export default async function AdminPages() {
  const pages = await getPages();
  return (
    <div>
      <div className={'flex flex-col gap-8'}>
        <div>Pages</div>
        <PagesList pages={pages} />
      </div>
    </div>
  );
}