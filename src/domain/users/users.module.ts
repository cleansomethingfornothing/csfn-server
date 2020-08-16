import {Module} from '@nestjs/common'
import {UsersService} from './users.service'
import {TypeOrmModule} from '@nestjs/typeorm'
import {UsersController} from './users.controller'
import User from './user.entity'
import {ImagesModule} from '../images/images.module'

@Module({
    imports: [TypeOrmModule.forFeature([User]), ImagesModule],
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UsersController]
})
export class UsersModule {
}
