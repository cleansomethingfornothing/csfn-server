import {Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {
    ArrayNotEmpty,
    IsDateString,
    IsEmpty,
    IsNotEmpty,
    IsNotEmptyObject,
    IsNumber,
    MaxLength,
    ValidateNested
} from 'class-validator'
import {CREATE, UPDATE} from '../../validation/groups'
import Location from '../../types/Location'
import Image from '../images/image.entity'
import User from '../users/user.entity'
import {Type} from 'class-transformer'

@Entity('cleanups')
export default class Cleanup {

    @IsEmpty({groups: [UPDATE], message: 'The id cannot be changed'})
    @IsEmpty({groups: [CREATE], message: 'The id will be setted automatucally'})
    @PrimaryGeneratedColumn()
    id?: number

    @IsNotEmpty({groups: [CREATE]})
    @MaxLength(1024, {groups: [CREATE, UPDATE]})
    @Column({length: 1024})
    description?: string

    @Column()
    @IsNotEmpty({groups: [CREATE]})
    @IsNumber({}, {groups: [CREATE, UPDATE]})
    volume?: number

    @Column()
    @IsNotEmpty({groups: [CREATE]})
    @IsNumber({}, {groups: [CREATE, UPDATE]})
    weight?: number

    @CreateDateColumn()
    @IsNotEmpty({groups: [CREATE]})
    @IsDateString({groups: [CREATE, UPDATE]})
    date?: Date

    @Column(type => Location)
    @ValidateNested({groups: [CREATE, UPDATE]})
    @Type(() => Location)
    @IsNotEmptyObject({groups: [CREATE]})
    location: Location

    @ArrayNotEmpty({groups: [CREATE]})
    @OneToMany(() => Image, image => image.cleanup)
    pictures?: Image[]

    @IsEmpty({groups: [UPDATE], message: 'The user cannot be changed'})
    @IsEmpty({groups: [CREATE], message: 'The user will be set automatically'})
    @ManyToOne(() => User, user => user.cleanups, {onUpdate: 'CASCADE', onDelete: 'SET NULL'})
    user?: User
}
