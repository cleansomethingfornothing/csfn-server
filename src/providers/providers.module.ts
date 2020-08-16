import {HttpModule, Module} from '@nestjs/common'
import {EmailService} from './email.service'
import {FacebookService} from './facebook.service'
import {GoogleAuthService} from './google-auth.service';

@Module({
    imports: [HttpModule],
    providers: [EmailService, FacebookService, GoogleAuthService],
    exports: [EmailService, FacebookService, GoogleAuthService]
})
export class ProvidersModule {
}
