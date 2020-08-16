import {IsNotEmpty, IsString, MaxLength} from 'class-validator'
import {CREATE, UPDATE} from '../validation/groups'
import {Column} from 'typeorm'
import {IsCountryCode} from '../validation/validators/is-country-code'

export default class Address {

    @Column()
    @IsNotEmpty({groups: [CREATE]})
    @IsString({groups: [CREATE, UPDATE]})
    city: string

    @Column()
    @IsNotEmpty({groups: [CREATE]})
    @IsString({groups: [CREATE, UPDATE]})
    state: string

    @Column()
    @IsNotEmpty({groups: [CREATE]})
    @IsString({groups: [CREATE, UPDATE]})
    country: string

    @Column()
    @IsCountryCode()
    @MaxLength(2, {groups: [CREATE, UPDATE]})
    @IsNotEmpty({groups: [CREATE]})
    @IsString({groups: [CREATE, UPDATE]})
    countryCode: string

}
