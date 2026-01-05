'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem, PaginationLink, PaginationNext,
  PaginationPrevious,
} from '@/components/admin/shadcnuiComponents/pagination';

type Props = {
  page: number
  totalPages: number
  setPage: (page: number) => void
}

export function StatePagination({ page, totalPages, setPage }: Props) {
  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1}
            onClick={(e) => {
              e.preventDefault()
              goTo(page - 1)
            }}
            size={'default'}
          />
        </PaginationItem>

        {[...Array(totalPages)].map((_, i) => {
          const p = i + 1
          return (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={p === page}
                onClick={(e) => {
                  e.preventDefault()
                  goTo(p)
                }}
                size={'default'}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page === totalPages}
            onClick={(e) => {
              e.preventDefault()
              goTo(page + 1)
            }}
            size={'default'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}