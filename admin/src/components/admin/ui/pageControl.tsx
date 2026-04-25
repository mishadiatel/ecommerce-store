import { StatePagination } from '@/components/admin/ui/statePagination';

interface PageControlProps {
  currentPage: number;
  limit: number;
  totalDocuments: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  documentsLength: number;
}

export default function PageControl({currentPage, setCurrentPage, totalPages, totalDocuments, documentsLength, limit}: PageControlProps) {
  return (
    <div className={'flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'}>
      <span className={'text-sm text-muted-foreground text-center sm:text-left'}>
        {documentsLength > 1 ? `${((currentPage - 1) * limit) + 1}-${((currentPage - 1) * limit) + documentsLength}` : ((currentPage - 1) * limit) + 1}
        &nbsp;/&nbsp;{totalDocuments}
      </span>
      <div className={'w-full sm:w-fit flex justify-center sm:justify-start'}>
        <StatePagination page={currentPage} totalPages={totalPages} setPage={setCurrentPage} />
      </div>
    </div>
  )
}
