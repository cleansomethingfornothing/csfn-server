import {
    BadRequestException,
    Controller,
    Delete,
    Param,
    ParseIntPipe,
    Post,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common'
import {FilesInterceptor} from '@nestjs/platform-express'
import {ImagesService} from './images.service'
import Image from './image.entity'
import {imageFilter} from '../../utils/imageFilter'
import {Express} from 'express'

@Controller('images')
export class ImagesController {

    constructor(private imagesService: ImagesService) {
    }

    @Post()
    @UseInterceptors(FilesInterceptor('images', 10, {fileFilter: imageFilter}))
    upload(@UploadedFiles() images: Express.Multer.File[]): Promise<Image[]> {
        if (!images || !images.length) {
            return Promise.reject(new BadRequestException('Missing images'))
        }
        return this.imagesService.uploadImages(images)
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.imagesService.deleteById(id)
    }

}
