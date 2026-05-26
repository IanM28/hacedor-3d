export interface UploadResult {
  url: string
  publicId: string
}

export function extractUploadResult(file: Express.Multer.File): UploadResult {
  const cloudinaryFile = file as Express.Multer.File & {
    path: string
    filename: string
  }
  return {
    url: cloudinaryFile.path,
    publicId: cloudinaryFile.filename,
  }
}
