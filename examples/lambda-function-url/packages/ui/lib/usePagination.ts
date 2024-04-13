import { useEffect, useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '../../common/pagination'

export function usePagination({ items, lastEvaluatedKey, currentPageIndex, pageSize = DEFAULT_PAGE_SIZE }) {
  const [pages, setPages] = useState<any[]>([])
  const highestPageIndex = pages.length - 1
  const hasMorePages = pages?.[highestPageIndex]?.numItems >= pageSize
  const totalPagedItems = pageSize * pages.length
  // Add 1 if hasMorePages to enable next page button
  const totalPagedItemsPlusOneIfHasMorePages = hasMorePages ? totalPagedItems + 1 : totalPagedItems

  useEffect(() => {
    if (lastEvaluatedKey) {
      setPages((currentPages) => {
        if (currentPages.length <= currentPageIndex) {
          return [
            ...currentPages,
            {
              lastEvaluatedKey: lastEvaluatedKey,
              numItems: items.length,
            },
          ]
        }

        return currentPages.map((p, i) => {
          if (i === currentPageIndex) {
            return {
              lastEvaluatedKey: lastEvaluatedKey,
              numItems: items.length,
            }
          }
          return p
        })
      })
    }
  }, [lastEvaluatedKey])

  return {
    pages,
    totalPagedItemsPlusOneIfHasMorePages,
  }
}
