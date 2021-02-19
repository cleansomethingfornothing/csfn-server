import {BadRequestException, Body, Controller, HttpCode, NotFoundException, Post} from '@nestjs/common'
import PasswordReset from './password-reset.entity'
import {Validation} from '../../validation/validation.decorator'
import {CHECK, CREATE, UPDATE} from '../../validation/groups'
import {UsersService} from '../users/users.service'
import {PasswordResetService} from './password-reset.service'
import {v4 as uuid} from 'uuid'
import {AuthService} from '../auth/auth.service'
import {EmailService} from '../../providers/email.service'

@Controller('password-reset')
export class PasswordResetController {

    constructor(private resetService: PasswordResetService,
                private userService: UsersService,
                private authService: AuthService,
                private mailService: EmailService) {
    }

    @Post('request')
    @Validation([CREATE])
    @HttpCode(200)
    reset(@Body()reset: PasswordReset): Promise<void> {
        return this.userService.findOneByEmail({email: reset.email})
            .catch(() => Promise.reject(new NotFoundException('email')))
            .then(() => this.resetService.add({...reset, code: uuid()}))
            .then((saved) => this.mailService.sendPasswordResetEmail(saved))
            .then(() => null)
    }

    @Post('check_code')
    @Validation([CHECK])
    @HttpCode(200)
    checkCode(@Body() reset: PasswordReset): Promise<void> {
        return this.resetService.findCode(reset.code)
            .then(() => null)
            .catch(() => Promise.reject(new NotFoundException()))
    }

    @Post('set')
    @Validation([UPDATE])
    @HttpCode(200)
    set(@Body() reset: PasswordReset): Promise<void> {
        return this.resetService.findCode(reset.code)
            .catch(() => Promise.reject(new BadRequestException('code')))
            .then((savedReset) => savedReset.email === reset.email ? Promise.resolve() : Promise.reject(new BadRequestException('email')))
            .then(() => this.userService.findOneByEmail({email: reset.email})
                .catch(() => Promise.reject(new BadRequestException('email'))))
            .then((user) => this.authService.changePassword(user, reset.newPassword))
            .then(() => this.resetService.remove(reset.email))
            .then(() => null)
            .catch((e) => Promise.reject(e))
    }
}
