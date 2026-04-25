import AdminAside from '@/components/admin/layout/aside/AdminAside';
import { AdminAuthProvider } from '@/components/admin/authProvider/AdminAuthProvider';
import AdminHeader from '@/components/admin/layout/headere/AdminHeader';
import { SidebarProvider } from '@/components/admin/layout/sidebarContext/SidebarContext';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <AdminAuthProvider>
        <SidebarProvider>
          <div className="admin-panel-shell">
            <AdminHeader />
            <div className="admin-panel mx-auto flex w-full max-w-[1400px] gap-4 px-3 py-4 sm:px-6 sm:py-6 lg:gap-6 lg:px-8">
              <AdminAside />
              <main className="flex-grow min-w-0">
                <div className="flex flex-col gap-4 sm:gap-6">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </AdminAuthProvider>
  );
}
