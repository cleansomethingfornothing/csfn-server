import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import User from './user.entity'
import {FindManyOptions, MoreThan, Repository} from 'typeorm'
import {ImagesService} from '../images/images.service'
import {classToPlain} from 'class-transformer'

@Injectable()
export class UsersService {

    constructor(@InjectRepository(User) private userRepository: Repository<User>,
                private imagesService: ImagesService) {
    }

    register(user: User): Promise<User> {
        return this.userRepository.save(user)
    }

    update(id: number, update: User): Promise<User> {
        return this.findOne(id)
            .then((user) => this.removePreviousPictureIfChanged(id, user, update)
                .then(() => this.userRepository.save(this.userRepository.merge(user, update)))
                .then(() => this.findOne(id)))
    }

    findOne(id: number): Promise<User> {
        return this.userRepository.createQueryBuilder('user')
            .select(['user', '(SELECT MIN(date) FROM cleanups WHERE "userId" = "user"."id") as "user_firstCleanup"'])
            .leftJoinAndSelect("user.picture", "picture")
            .where('user.id = :id', {id})
            .getOne()
    }

    findOneByEmail({email, facebookId, googleId}: { email: string, facebookId?: string, googleId?: string }): Promise<User> {
        return this.userRepository.findOneOrFail({where: [{email}, {facebookId}, {googleId}], relations: ['picture']})
    }

    findTopUsers(userCountry: string, sortBy: 'totalWeight' | 'totalVolume'): Promise<any> {
        const conditions: FindManyOptions<User> = {
            select: ['id', 'country', 'username', 'totalWeight', 'totalVolume'],
            relations: ['picture'],
            order: {[sortBy]: 'DESC'},
            take: 10
        }
        return Promise.all([
            this.userRepository.find({...conditions, where: {totalVolume: MoreThan(0)}}),
            this.userRepository.find({...conditions, where: {totalVolume: MoreThan(0), country: userCountry}})
        ]).then(([world, country]) => ({world: classToPlain(world), country: classToPlain(country)}))
    }

    findUserStats(userId: number, groupBy: 'day' | 'month') {
        if (groupBy === 'day') {
            return this.userRepository.query('SELECT to_char(date, \'YYYY-MM-DD\') as date, SUM(volume) as volume' +
                ' from cleanups' +
                ' WHERE "userId" = $1' +
                ' GROUP BY 1' +
                ' ORDER BY 1 ASC' +
                ' LIMIT 12', [userId])
        } else {
            return this.userRepository.query('SELECT to_char(date, \'YYYY-MM\') as date, SUM(volume) as volume ' +
                ' FROM cleanups' +
                ' WHERE "userId" = $1' +
                ' GROUP BY 1' +
                ' ORDER BY 1 ASC' +
                ' LIMIT 12', [userId])
        }
    }

    checkUsername(username: string): Promise<boolean> {
        return this.userRepository.findOneOrFail({username})
            .then(() => true)
            .catch(() => false)
    }

    removePreviousPictureIfChanged(id: number, current: User, update: User) {
        return update.picture && current.picture && update.picture.id !== current.picture.id
            ? this.imagesService.delete(current.picture)
            : Promise.resolve()
    }

    deleteUser(id: number): Promise<void> {
        return this.findOne(id)
            .then((user) => user.picture
                ? this.imagesService.delete(user.picture)
                : Promise.resolve())
            .then(() => this.userRepository.delete({id}))
            .then(() => undefined)
    }
}
