import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const apiUrl = process.env.NEXT_PUBLIC_PROJECT_API_URL!;
const { protocol, hostname } = new URL(apiUrl);

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);