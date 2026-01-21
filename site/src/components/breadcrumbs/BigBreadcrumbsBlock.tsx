import Breadcrumbs from '@/components/breadcrumbs/Breadcrumbs';

interface BigBreadcrumbsProps {
  title: string;
  items: Array<{
    href?: string;
    name: string;
  }>
}

export default function BigBreadcrumbs({title, items}: BigBreadcrumbsProps) {
 return (
   <div className="breadcrumb-block style-img">
     <div className="breadcrumb-main bg-white overflow-hidden">
       <div className="container py-8 sm:py-16 relative">
         <div className="main-content w-full h-full flex flex-col items-center justify-center relative z-[1]">
           <div className="text-content">
             <h1 className="heading1 text-center mb-5 sm:mb-8">{title}</h1>
             <div className={'max-w-full overflow-x-auto'}>
               <Breadcrumbs items={items} />
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
 )
}