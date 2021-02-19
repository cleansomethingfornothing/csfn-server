import {BadRequestException, HttpService, Injectable, InternalServerErrorException, Logger} from '@nestjs/common'
import axios, {AxiosError} from 'axios'

@Injectable()
export class FacebookService {

    logger = new Logger(FacebookService.name)

    url = 'https://graph.facebook.com/v8.0/me?fields=picture.type(large),email,name&access_token='

    constructor(private http: HttpService) {
    }

    getFacebookProfile(accessToken: string): Promise<SocialProfile> {
        return axios.get(this.url + accessToken)
            .then(({data}) => ({
                facebookId: data.id,
                name: data.name,
                email: data.email,
                pictureUrl: data.picture.data.url
            }))
            .catch((error: AxiosError) => {
                try {
                    if (error.response.data.error.type === 'OAuthException') {
                        return Promise.reject(new BadRequestException('invalidToken'))
                    }
                } catch (e) {
                    //
                }
                this.logger.error(error)
                return Promise.reject(new InternalServerErrorException())
            })
    }
}
