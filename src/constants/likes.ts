export const LENGTH_OF_NEWEST_LIKES_FOR_POST = 3

export enum LikeStatusEnum {
  none = 'None',
  like = 'Like',
  dislike = 'Dislike'
}

export enum LikeSourceTypeEnum {
  posts = "posts_likes",
  comments = "comments_likes",
}
