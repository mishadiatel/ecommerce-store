'use client'
import Link from 'next/link';
import { usePathname } from '@/i18n/navigation';

export default function AdminAside() {
  const pathname = usePathname();
  const pathnameSegments = pathname.split('/').filter(Boolean);
  const lastPathnameSegment = pathnameSegments[pathnameSegments.length - 1]
  return (
    <aside className={'flex flex-col flex-[0_0_200px]'}>
      <Link href="/adminPanel/admin823479234/dashboard" className={`w-full p-4 rounded-md ${lastPathnameSegment === 'dashboard' ? 'bg-gray-100' : ''}`}>General</Link>
      <Link href="/adminPanel/admin823479234/pagesControl" className={`w-full p-4 rounded-md ${lastPathnameSegment === 'pagesControl' ? 'bg-gray-100 ' : ''}`}>Pages</Link>
      <Link href="/adminPanel/admin823479234/blocks" className={`w-full p-4 rounded-md ${lastPathnameSegment === 'blocks' ? 'bg-gray-100 ' : ''}`}>Blocks</Link>
    </aside>
  )
}