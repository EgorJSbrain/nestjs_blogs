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
}

export interface IFile extends FileBase {
  id: string
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export interface CreateFileData extends FileBase {}

export type Image = {
  url: string
  fileSize: number
  width: number
  height: number
}

export type Images = {
  wallpaper: Image | null
  main: Image[] | []
}
