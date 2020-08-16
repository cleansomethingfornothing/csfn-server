import {BadRequestException, HttpService, Injectable, InternalServerErrorException} from '@nestjs/common'
import axios, {AxiosError} from 'axios'

@Injectable()
export class FacebookService {

    url = 'https://graph.facebook.com/v8.0/me?fields=picture.type(large),email&access_token='

    constructor(private http: HttpService) {
    }

    getFacebookProfile(accessToken: string): Promise<SocialProfile> {
        return axios.get(this.url + accessToken)
            .then(({data}) => ({id: data.id, email: data.email, pictureUrl: data.picture.data.url}))
            .catch((error: AxiosError) => {
                try {
                    if (error.response.data.error.type === 'OAuthException') {
                        return Promise.reject(new BadRequestException('invalidToken'))
                    }
                } catch (e) {
                    //
                }
                console.error(error)
                return Promise.reject(new InternalServerErrorException())
            })
    }
}
