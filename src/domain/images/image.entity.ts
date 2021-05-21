import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Cleanup from '../cleanups/cleanup.entity'

@Entity()
export default class Image {

  @PrimaryGeneratedColumn()
  id?: number

  @Column()
  name: string

  @Column()
  publicUrl: string

  @ManyToOne(() => Cleanup, cleanup => cleanup.pictures, { onDelete: 'CASCADE' })
  cleanup?: Cleanup
}
