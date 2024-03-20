import { SortDirectionsEnum, SortType } from '../constants/global'

export const prepareParamsForTopStatistic = (
  sortParams: string[]
): Record<string, SortType> =>
  sortParams?.reduce((acc, item) => {
    const splitedItem = item.split(' ')

    return {
      ...acc,
      [splitedItem[0]]: splitedItem[1].toLocaleUpperCase() as SortDirectionsEnum
    }
  }, {})
