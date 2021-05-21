import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'
import { IsEmail, IsString } from 'class-validator'
import { CHECK, CREATE, UPDATE } from '../../validation/groups'

@Entity()
export default class PasswordReset {

  @PrimaryColumn()
  @IsEmail({}, { groups: [CREATE, UPDATE] })
  email: string

  @Column()
  @IsString({ groups: [UPDATE, CHECK] })
  code: string

  @IsString({ groups: [UPDATE] })
  newPassword: string

  @CreateDateColumn()
  created: Date

}
