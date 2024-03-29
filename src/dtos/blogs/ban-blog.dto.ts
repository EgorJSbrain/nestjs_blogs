import { IsDefined } from 'class-validator'

export class BanBlogSADto {
  @IsDefined()
  isBanned: boolean
}
