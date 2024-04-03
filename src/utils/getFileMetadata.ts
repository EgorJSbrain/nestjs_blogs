import sharp from 'sharp'

export const getFileMetadata = async (
  buffer: Buffer
): Promise<sharp.Metadata> => await sharp(buffer).metadata()
