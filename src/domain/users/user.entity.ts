import {Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm'
import {IsEmail, IsEmpty, IsNotEmpty, MinLength} from 'class-validator'
import {IsUnique} from '../../validation/validators/is-unique-validator'
import {CREATE, UPDATE, UPDATE_EMAIL, UPDATE_PASSWORD} from '../../validation/groups'
import Image from '../images/image.entity'
import {ReferenceExists} from '../../validation/validators/reference-exists-validator'
import Cleanup from '../cleanups/cleanup.entity'
import {Exclude} from 'class-transformer'

@Entity('users')
export default class User {

    @PrimaryGeneratedColumn()
    id?: number

    @Exclude({toPlainOnly: true})
    @Column({nullable: true})
    facebookId?: string

    @Exclude({toPlainOnly: true})
    @Column({nullable: true})
    googleId?: string

    @IsEmpty({groups: [UPDATE_EMAIL, UPDATE_PASSWORD], message: 'picture must be setted updating the user'})
    @IsNotEmpty({groups: [UPDATE]})
    @IsUnique({entity: User, column: 'pictureId', nestedKey: 'id'}, {groups: [UPDATE]})
    @ReferenceExists(Image, {groups: [UPDATE]})
    @OneToOne(type => Image, {onDelete: 'SET NULL'})
    @JoinColumn()
    picture: Image

    @Exclude({toPlainOnly: true})
    @Column({nullable: true})
    pictureId?: number

    @IsUnique({entity: User}, {groups: [CREATE, UPDATE]})
    @IsNotEmpty({groups: [CREATE]})
    @IsEmpty({groups: [UPDATE_EMAIL, UPDATE_PASSWORD], message: 'username must be updated with a PATCH to /user/{id}'})
    @Column({unique: true})
    username: string

    @IsUnique({entity: User}, {groups: [CREATE, UPDATE_EMAIL]})
    @IsNotEmpty({groups: [CREATE, UPDATE_EMAIL]})
    @IsEmail({}, {groups: [CREATE, UPDATE_EMAIL]})
    @IsEmpty({groups: [UPDATE, UPDATE_PASSWORD], message: 'email must be updated with a POST to /auth/change_email'})
    @Column({unique: true})
    email: string

    @Exclude({toPlainOnly: true})
    @IsNotEmpty({groups: [CREATE, UPDATE_PASSWORD]})
    @MinLength(4, {groups: [CREATE, UPDATE_PASSWORD]})
    @IsEmpty({groups: [UPDATE, UPDATE_EMAIL], message: 'password must be updated with a POST /auth/change_password'})
    @Column()
    password?: string

    @CreateDateColumn()
    creation?: Date

    @Column({default: ''})
    country: string

    @OneToMany(() => Cleanup, cleanup => cleanup.user)
    cleanups?: Cleanup[]

    @Column({default: 0})
    totalCleanups?: number

    @Column({default: 0})
    totalWeight?: number

    @Column({default: 0})
    totalVolume?: number

    @Column({nullable: true})
    firstCleanup?: Date

}
