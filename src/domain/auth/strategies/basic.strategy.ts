import {Injectable} from '@nestjs/common'
import {PassportStrategy} from '@nestjs/passport'
import {AuthService} from '../auth.service'
import User from '../../users/user.entity'
import {BasicStrategy} from 'passport-http'

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(BasicStrategy, 'basic') {
    constructor(private authService: AuthService) {
        super()
    }

    validate(email: string, password: string): Promise<User> {
        return this.authService.validateLogin(email, password)
    }

}
