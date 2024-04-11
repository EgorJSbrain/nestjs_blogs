import { SubscriptionStatusEnum } from '../enums/SubscriptionStatusEnum'

export interface IUsersBlogs {
  id: string
  userId: string
  blogId: string
  status: SubscriptionStatusEnum | null
}
