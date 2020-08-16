import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common'
import {ImagesService} from './images.service'
import {ImagesController} from './images.controller'
import {TypeOrmModule} from '@nestjs/typeorm'
import Image from './image.entity'
import * as cors from 'cors'

@Module({
    imports: [TypeOrmModule.forFeature([Image])],
    providers: [ImagesService],
    controllers: [ImagesController],
    exports: [ImagesService]
})
export class ImagesModule implements NestModule {

    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(cors()).forRoutes(ImagesController)
    }

}
