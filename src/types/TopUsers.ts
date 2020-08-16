import User from '../domain/users/user.entity'

export default class TopUsers {
    world: User[]

    [country: string]: User[]
}
