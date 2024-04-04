export const checkIsAllowedImgFileFormat = (format: string) => {
  const allowedExtensions = ['jpg', 'jpeg', 'png']

  return allowedExtensions.includes(format)
}
