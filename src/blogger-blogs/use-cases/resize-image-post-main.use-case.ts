import { Injectable } from '@nestjs/common'

import { ImageSizeEnum } from '../../enums/ImageSizeEnum'
import { resizeImage } from '../../utils/resizeImage'
import { getFileMetadata } from '../../utils/getFileMetadata';
import { IImageMainForPost } from '../../types/files';

const fileWithMetadataFactory = async(size: ImageSizeEnum, buffer: Buffer) => {
  const { width, height, size: fileSize } = await getFileMetadata(buffer)

  return {
    size,
    buffer,
    width: width ?? 0,
    height: height ?? 0,
    fileSize: fileSize ?? 0
  }
}

@Injectable()
export class ResizeImagePostMainUseCase {
  constructor() {}

  async execute(buffer: Buffer): Promise<IImageMainForPost[] | null> {
    const { width, height, size } = await getFileMetadata(buffer)
    const resizedImages: IImageMainForPost[] = [await fileWithMetadataFactory(ImageSizeEnum.original, buffer)]

    const middleImage = await resizeImage(buffer, 300, 180)

    if (middleImage) {
      resizedImages.push(await fileWithMetadataFactory(ImageSizeEnum.middle, middleImage))
    }

    const smallImage = await resizeImage(buffer, 149, 96)

    if (smallImage) {
      resizedImages.push(await fileWithMetadataFactory(ImageSizeEnum.small, smallImage))
    }

    return resizedImages
  }
}
