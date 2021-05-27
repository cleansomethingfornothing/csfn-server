import { Column, Entity, PrimaryColumn, Unique } from 'typeorm'

@Entity('stats')
@Unique('uq_month_stats', ['month', 'year', 'country'])
export default class Stats {

  @PrimaryColumn()
  month: number

  @PrimaryColumn()
  year: number

  @PrimaryColumn()
  country: string

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  weight: number

  @Column()
  volume: number

}
