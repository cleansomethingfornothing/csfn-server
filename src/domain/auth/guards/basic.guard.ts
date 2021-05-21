import { Injectable, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
class BasicGuard extends AuthGuard('basic') {
}

export const Basic = () => UseGuards(BasicGuard)
