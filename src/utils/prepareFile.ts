import { FileEntity } from '../entities/files'

export const prepareFile = (file: FileEntity) => ({
  url: file.url,
  width: file.width,
  height: file.height,
  fileSize: file.fileSize,
})
