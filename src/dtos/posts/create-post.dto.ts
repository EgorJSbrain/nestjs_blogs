export interface CreatePostDto {
  readonly title: string
  readonly content: string
  readonly shortDescription: string
  readonly blogId?: string
  readonly blogName?: string
}
