import {Module} from '@nestjs/common'
import {PasswordResetService} from './password-reset.service'
import {PasswordResetController} from './password-reset.controller'
import {UsersModule} from '../users/users.module'
import {TypeOrmModule} from '@nestjs/typeorm'
import PasswordReset from './password-reset.entity'
import {AuthModule} from '../auth/auth.module'
import {EmailService} from '../../providers/email.service'

@Module({
    imports: [UsersModule, AuthModule, TypeOrmModule.forFeature([PasswordReset])],
    providers: [PasswordResetService, EmailService],
    controllers: [PasswordResetController]
})
export class PasswordResetModule {
}
