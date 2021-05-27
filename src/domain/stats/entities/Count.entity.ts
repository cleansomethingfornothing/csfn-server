import { Entity, PrimaryColumn } from 'typeorm'

@Entity('count')
export default class Count {

  @PrimaryColumn({ type: 'decimal', precision: 6, scale: 2 })
  weight: number

  @PrimaryColumn()
  volume: number

}
