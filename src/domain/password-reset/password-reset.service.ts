import {Injectable, Logger} from '@nestjs/common'
import PasswordReset from './password-reset.entity'
import {InjectRepository} from '@nestjs/typeorm'
import {LessThan, Repository} from 'typeorm'
import {Interval} from '@nestjs/schedule'
import moment = require('moment')

@Injectable()
export class PasswordResetService {

    logger = new Logger(PasswordResetService.name)

    constructor(@InjectRepository(PasswordReset) private resetRepository: Repository<PasswordReset>) {
    }

    add(reset: PasswordReset): Promise<PasswordReset> {
        return this.resetRepository.save(reset)
    }

    findCode(code: string) {
        return this.resetRepository.findOneOrFail({code})
    }

    find({email, code}: PasswordReset) {
        return this.resetRepository.findOneOrFail({email, code})
    }

    remove(email: string) {
        return this.resetRepository.delete({email})
    }

    @Interval(moment.duration(1, 'minute').asMilliseconds())
    clean() {
        this.resetRepository.delete({created: LessThan(moment().subtract(1, 'hour').toDate())})
            .catch(this.logger.error)
    }
}
