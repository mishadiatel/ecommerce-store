import AdminAside from '@/components/admin/layout/aside/AdminAside';
import { AdminAuthProvider } from '@/components/admin/authProvider/AdminAuthProvider';
import AdminHeader from '@/components/admin/layout/headere/AdminHeader';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <AdminAuthProvider>
        <div className="admin-panel-shell">
          <AdminHeader />
          <div className="admin-panel mx-auto flex w-full max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <AdminAside />
            <main className="flex-grow min-w-0">
              <div className="flex flex-col gap-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </AdminAuthProvider>
  );
}
