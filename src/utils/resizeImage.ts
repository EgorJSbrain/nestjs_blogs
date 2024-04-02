import sharp from 'sharp'

export const resizeImage = async (
  buffer: Buffer,
  newWidth: number,
  newHeight: number
) => await sharp(buffer).resize(newWidth, newHeight).toBuffer()