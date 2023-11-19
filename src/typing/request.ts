export enum SortDirections {
  asc = 'asc',
  desc = 'desc'
}

export type RequestParams = {
  sortBy?: string
  sortDirection?: SortDirections
  pageNumber?: string
  pageSize?: string
}

export type ResponseBody<T> = {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: T[]
}
