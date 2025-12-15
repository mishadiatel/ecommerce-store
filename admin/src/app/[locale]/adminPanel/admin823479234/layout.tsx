import AdminAside from '@/components/admin/layout/aside/AdminAside';
import { AdminAuthProvider } from '@/components/admin/authProvider/AdminAuthProvider';
import AdminHeader from '@/components/admin/layout/headere/AdminHeader';

export default async function AdminLayout({
                                            children,
                                          }: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      <AdminAuthProvider>
        <div className={'admin-panel flex flex-col mx-auto w-[1300px] max-w-full gap-8'}>
          <AdminHeader />
          <div className={'flex w-full gap-8'}>
            <AdminAside />
            <div className={'flex-grow'}>
              {children}
            </div>
          </div>
        </div>

      </AdminAuthProvider>

    </>
  );
}
