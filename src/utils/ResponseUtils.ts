import { Request } from 'express'
import User from '../domain/users/user.entity'

export function locationHeader(req: Request,
                               path: string,
                               id: number): string {
  return `${req.protocol}://${req.header('host')}/${path}/${id}`
}

export function userResponse(user: User): User {
  return { ...user, password: undefined }
}
