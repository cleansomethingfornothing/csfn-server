import {Module} from '@nestjs/common'
import {AuthController} from './auth.controller'
import {AuthService} from './auth.service'
import {UsersModule} from '../users/users.module'
import {PassportModule} from '@nestjs/passport'
import {BasicAuthStrategy} from './strategies/basic.strategy'
import {ProvidersModule} from '../../providers/providers.module'
import {ImagesModule} from '../images/images.module'

@Module({
    imports: [
        PassportModule,
        UsersModule,
        ProvidersModule,
        ImagesModule
    ],
    controllers: [AuthController],
    providers: [AuthService, BasicAuthStrategy],
    exports: [AuthService]
})
export class AuthModule {
}
