import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useState } from 'react';

const Marquee = dynamic(() => import('react-fast-marquee'), { ssr: false });

export default function SsrMarquee ({ children }: {children: ReactNode}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isClient) {
    return <Marquee pauseOnHover speed={50}>{children}</Marquee>;
  }

  return (
    <div className={'flex items-center flex-nowrap whitespace-nowrap overflow-hidden'}>
      {children}
    </div>
  );
};