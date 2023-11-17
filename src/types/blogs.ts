import { RequestParams } from './request'

export type BlogsRequestParams = RequestParams & {
  searchNameTerm?: string
}
