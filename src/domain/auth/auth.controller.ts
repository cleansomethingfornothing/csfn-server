import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    Post,
    Req,
    Res,
    SerializeOptions,
    Session,
    UnauthorizedException
} from '@nestjs/common'
import User from '../users/user.entity'
import { AuthService } from './auth.service'
import { Validation } from '../../validation/validation.decorator'
import { CREATE, UPDATE_EMAIL, UPDATE_PASSWORD } from '../../validation/groups'
import { Basic } from './guards/basic.guard'
import { Logged } from './guards/logged.guard'
import { Request, Response } from 'express'

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {
  }

  @Post('register')
  @Validation([CREATE])
  register(@Session() session: any,
           @Headers('country') country: string,
           @Body() user: User): Promise<User> {
    user.country = country

    return this.authService.register(user)
      .then((u) => {
        session.user = { id: u.id }
        return u
      })
  }

  @Post('login')
  @Basic()
  @HttpCode(200)
  login(@Session() session: any,
        @Req() req) {
    session.user = { id: req.user.id }
    return req.user
  }

  @Post('login_facebook')
  facebookLogin(@Req() req: Request,
                @Session() session,
                @Headers('country') country: string,
                @Body() { token }: { token: string }) {
    return this.loginSocial(session, token, this.authService.loginWithFacebook(token, country))
  }

  @Post('login_google')
  googleLogin(@Session() session,
              @Headers('ios') ios: string,
              @Headers('country') country: string,
              @Body() { token }: { token: string }) {
    return this.loginSocial(session, token, this.authService.loginWithGoogle(token, ios === 'true', country))
  }

  private loginSocial(session,
                      token,
                      promise: Promise<[User, boolean]>): Promise<User> {
    if (!token) {
      return Promise.reject(new UnauthorizedException('missingToken'))
    }
    return promise
      .then(([user, isNew]) => {
        session.user = { id: user.id }
        return { ...user, password: undefined, facebookId: undefined, pictureId: undefined, isNew }
      })
  }

  @Get('user')
  @Logged()
  getCurrentUser(@Session() session) {
    return this.authService.getCurrentUser(session.user.id)
      .then((user) => user || Promise.reject(new UnauthorizedException()))
  }

  @Post('change_email')
  @Basic()
  @HttpCode(200)
  @Validation([UPDATE_EMAIL])
  changeEmail(@Req() req,
              @Body() { email }: User) {
    return this.authService.changeEmail(req.user, email)
  }

  @Post('change_password')
  @Basic()
  @HttpCode(200)
  @Validation([UPDATE_PASSWORD])
  @SerializeOptions({ groups: [UPDATE_PASSWORD] })
  changePassword(@Req() req,
                 @Body() { password }: User) {
    return this.authService.changePassword(req.user, password)
  }

  @Post('logout')
  @Logged()
  logout(@Session() session: any,
         @Res() res: Response) {
    session.destroy(() =>
      res.clearCookie('csfn.id', { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
        .status(200)
        .end())
  }

  @Post('delete_account')
  @Basic()
  @HttpCode(200)
  delete(@Session() session: any,
         @Req() req,
         @Res() res: Response) {
    this.authService.deleteAccount(req.user.id)
      .then(() => this.logout(session, res))
  }

}
