import {Entity, PrimaryColumn} from 'typeorm'

@Entity('count')
export default class Count {

    @PrimaryColumn()
    weight: number

    @PrimaryColumn()
    volume: number

}
