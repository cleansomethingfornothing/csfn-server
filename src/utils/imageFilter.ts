import { BadRequestException } from '@nestjs/common'

const errorMessage = 'Only JPG and PNG images are allowed'

export const imageFilter = (req,
                            file,
                            cb) => {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
    req.fileValidationError = errorMessage
    return cb(new BadRequestException(errorMessage), false)
  }
  cb(null, true)
}
