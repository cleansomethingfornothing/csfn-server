import { Transform } from 'class-transformer'

export class CountriesStats {
  country: string

  weight: number

  @Transform(({ value }) => parseInt(value, 10))
  volume: number

  @Transform(({ value }) => parseInt(value, 10))
  users: number
}
