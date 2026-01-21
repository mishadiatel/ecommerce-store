import { Link } from '@/i18n/navigation';

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.href && {
        item: `${process.env.NEXT_PUBLIC_SITE_URL}${item.href}`,
      }),
    })),
  };

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* UI */}
      <div className="link flex items-center justify-center gap-1 caption1">
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-1 whitespace-nowrap">
            {item.href ? (
              <Link href={item.href} className="caption1 text-gray-80">
                {item.name}
              </Link>
            ) : (
              <span className="text-black">
                {item.name}
              </span>
            )}

            {index < items.length - 1 && (
              <i className="breadcrumbs-arrow text-xl icon icon-chevron-right text-gray-30" />
            )}
          </span>
        ))}
      </div>
    </>
  );
}