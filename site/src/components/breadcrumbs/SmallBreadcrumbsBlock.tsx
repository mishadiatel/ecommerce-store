import Breadcrumbs from '@/components/breadcrumbs/Breadcrumbs';

interface BigBreadcrumbsProps {
  items: Array<{
    href?: string;
    name: string;
  }>
}

export default function SmallBreadcrumbsBlock({items}: BigBreadcrumbsProps) {
  return (
    <div className="breadcrumb-product">
      <div className="main bg-transparent mb-8 sm:mb-10 lg:mb-8 mt-2 sm:mt-4 lg:mt-8">
        <div className="container flex items-center justify-between flex-wrap gap-3 js--breadcrumbs-container">
          <div className={'w-fit max-w-full overflow-x-auto'}>
            <Breadcrumbs items={items} />
          </div>
        </div>
      </div>
    </div>
  )
}