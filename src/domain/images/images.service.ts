import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import Image from './image.entity'
import { Bucket, Storage } from '@google-cloud/storage'
import { Express } from 'express'
import { v4 as uuid } from 'uuid'
import { format } from 'util'
import axios from 'axios'
import * as arrayBufferToBuffer from 'arraybuffer-to-buffer'
import { Cron, CronExpression } from '@nestjs/schedule'

@Injectable()
export class ImagesService {

  private static readonly BUCKET_NAME = 'csfn-img'

  logger = new Logger(ImagesService.name)

  bucket: Bucket

  constructor(@InjectRepository(Image) private imagesRepository: Repository<Image>) {
    this.bucket = new Storage().bucket(ImagesService.BUCKET_NAME)
  }

  addFromExternal(url): Promise<Image> {
    return axios.get(url, {
      responseType: 'arraybuffer'
    }).then(response => this.upload(arrayBufferToBuffer(Buffer.from(response.data, 'binary')),
      response.headers['content-type'].split('/')[1]))
      .then((uploadedImages) => this.imagesRepository.save(uploadedImages))
  }

  uploadImages(images: Express.Multer.File[]): Promise<Image[]> {
    return Promise.all(images.map(image => this.uploadImageToStorage(image)))
      .then((uploadedImages) => this.imagesRepository.save(uploadedImages))
  }

  deleteById(id: number): Promise<void> {
    return this.imagesRepository.findOneOrFail({ id })
      .then((image: Image) => this.delete(image))
  }

  delete({ id, name }: Image): Promise<void> {
    return this.imagesRepository.delete({ id })
      .then(() => this.bucket.file(name).delete().then(() => undefined))
  }

  private uploadImageToStorage(image: Express.Multer.File): Promise<Image> {
    return this.upload(image.buffer, image.originalname.split('.').slice(-1)[0])
  }

  private upload(image: ArrayBuffer,
                 extension: string): Promise<Image> {
    const name = uuid() + '.' + extension
    const blob = this.bucket.file(name)
    const blobStream = blob.createWriteStream()

    return new Promise<Image>((resolve,
                               reject) => {

      blobStream.on('error', (err) => {
        reject(err)
      })

      blobStream.on('finish', () => {
        const publicUrl = format(`https://storage.googleapis.com/${this.bucket.name}/${blob.name}`)

        resolve({ publicUrl, name })
      })

      blobStream.end(image)
    })
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  clean() {
    this.imagesRepository.query('SELECT image.id, image.name FROM image, users' +
      ' WHERE "cleanupId" IS NULL AND image.id NOT IN (SELECT "pictureId" from users)')
      .then((images) => Promise.all(images.map((image) => this.bucket.file(image.name).delete()))
        .then(() => this.imagesRepository.delete({ id: In(images.map(({ id }) => id)) }))
        .then(() => this.logger.log(`Images cleaned (${images.length})`)))
      .catch((error) => this.logger.error(error))
  }
}
