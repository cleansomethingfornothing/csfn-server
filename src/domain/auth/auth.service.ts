import {Injectable, UnauthorizedException} from '@nestjs/common'
import User from '../users/user.entity'
import {CryptoUtils} from '../../utils/CryptoUtils'
import {UsersService} from '../users/users.service'
import {FacebookService} from '../../providers/facebook.service'
import {ImagesService} from '../images/images.service'
import {v4 as uuidv4} from 'uuid'
import {GoogleAuthService} from '../../providers/google-auth.service'

@Injectable()
export class AuthService {

    constructor(private userService: UsersService,
                private facebook: FacebookService,
                private google: GoogleAuthService,
                private imagesService: ImagesService) {
    }

    register(user: User): Promise<User> {
        return CryptoUtils.hashPassword(user.password)
            .then((hashedPassword: string) => {
                user.password = hashedPassword
                return this.userService.register(user)
            })
    }

    validateLogin(email: string, password: string): Promise<User> {
        return this.userService.findOneByEmail({email})
            .catch(() => Promise.reject(new UnauthorizedException('invalidEmail')))
            .then((user) => CryptoUtils.comparePasswordWithHash(password, user.password)
                .then(() => user)
                .catch(() => Promise.reject(new UnauthorizedException('invalidPassword'))))
    }

    loginWithFacebook(token: string, country: string): Promise<[User, boolean]> {
        return this.facebook.getFacebookProfile(token)
            .then((profile) => this.loginWithSocialNetwork(profile, country))
    }

    loginWithGoogle(token: string, ios: boolean, country: string): Promise<[User, boolean]> {
        return this.google.getGoogleProfile(token, ios)
            .then((profile) => this.loginWithSocialNetwork(profile, country))
    }

    loginWithSocialNetwork(profile: SocialProfile, country: string): Promise<[User, boolean]> {
        return this.userService.findOneByEmail({
                email: profile.email,
                facebookId: profile.facebookId,
                googleId: profile.googleId
            })
            .then((user) => this.userService
                .update(user.id, profile.googleId
                    ? {...user, googleId: profile.googleId}
                    : {...user, facebookId: profile.facebookId}))
            .then((user) => [user, false])
            .catch(() => this.imagesService.addFromExternal(profile.pictureUrl)
                .then((picture) => {
                    const generateUsername = (username, i = 1) => this.userService.checkUsername(username)
                        .then(exists => !exists ? username : generateUsername(username + i))

                    return generateUsername(profile.name.toLowerCase().replace(/\s/g, '_'))
                        .then((username) => CryptoUtils.hashPassword(uuidv4())
                            .then((password) => this.userService.register({
                                username,
                                facebookId: profile.facebookId,
                                googleId: profile.googleId,
                                email: profile.email,
                                picture,
                                password: password,
                                country
                            })))
                        .then((user) => [user, true])
                }))
    }

    getCurrentUser(id: number): Promise<User> {
        return this.userService.findOne(id)
    }

    changeEmail(user: User, email: string): Promise<User> {
        return this.userService.update(user.id, {...user, email})
    }

    changePassword(user: User, password: string): Promise<User> {
        return CryptoUtils.hashPassword(password)
            .then((hashedPassword: string) => this.userService.update(user.id, {...user, password: hashedPassword}))
    }

    deleteAccount(id: number): Promise<void> {
        return this.userService.deleteUser(id)
    }
}
