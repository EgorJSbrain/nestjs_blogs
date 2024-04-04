import { FileTypeEnum } from '../enums/FileTypeEnum'
import { ImageSizeEnum } from '../enums/ImageSizeEnum'

interface FileBase {
  url: string
  fileSize: number
  width: number
  height: number
  type: FileTypeEnum
  size: ImageSizeEnum | null
  userId: string
  blogId: string
  postId?: string | null
}

export interface IFile extends FileBase {
  id: string
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export interface CreateFileData extends FileBase {}

export interface Image {
  url: string
  fileSize: number
  width: number
  height: number
  size?: ImageSizeEnum,
}

export type Images = {
  wallpaper: Image | null
  main: Image[] | []
}

export interface IImageMainForPost {
  buffer: Buffer
  size: ImageSizeEnum,
  fileSize: number
  width: number
  height: number
}
