import { SortDirectionsEnum } from '../constants/global'

export type RequestParams = {
  sortBy?: string
  sortDirection?: SortDirectionsEnum
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
