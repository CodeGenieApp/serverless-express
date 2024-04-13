enum AndOr {
  AND = 'AND',
  OR = 'OR'
}

export interface FilterFilters {
  property: string
  value: string
}

export interface Filter {
  /* default: AndOr.OR */
  operator?: AndOr
  filters: FilterFilters[]
}