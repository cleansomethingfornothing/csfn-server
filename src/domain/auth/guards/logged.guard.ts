import { CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException, UseGuards } from '@nestjs/common'
import { Request } from 'express'

interface LoggedGuardOptions {
  self: boolean
}

class LoggedGuard implements CanActivate {

  self: boolean

  constructor(opts?: LoggedGuardOptions) {
    this.self = opts?.self
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest() as Request

    if (!(req.session as any).user) {
      throw new UnauthorizedException()
    }

    if (this.self && (req.session as any).user.id !== Number(req.params.id)) {
      throw new ForbiddenException()
    }

    return true
  }

}

export const Logged = (options?: LoggedGuardOptions) => UseGuards(new LoggedGuard(options))
