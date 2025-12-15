'use client'

import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { Button } from '@/components/admin/shadcnuiComponents/button';

export default function AdminHeader() {

  const {user, logout} = useAuth();
  return (
    <div className={'h-12 flex items-center w-full'}>
      <div className={'flex ml-auto gap-4 items-center'}>
        {user && <span>{user.email}</span>}
        <Button onClick={logout}>Logout</Button></div>
    </div>
  )
}