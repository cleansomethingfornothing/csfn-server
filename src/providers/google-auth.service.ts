import {BadRequestException, Injectable} from '@nestjs/common'
import {OAuth2Client} from 'google-auth-library'

@Injectable()
export class GoogleAuthService {

    public getGoogleProfile(idToken: string, ios: boolean): Promise<SocialProfile> {
        const clientId = ios ? process.env.GOOGLE_CLIENT_ID_IOS : process.env.GOOGLE_CLIENT_ID

        return new OAuth2Client(clientId).verifyIdToken({idToken, audience: clientId})
            .then((ticket) => {
                const payload = ticket.getPayload()
                return {email: payload.email, pictureUrl: payload.picture}
            })
            .catch(() => Promise.reject(new BadRequestException('invalidToken')))
    }

}
