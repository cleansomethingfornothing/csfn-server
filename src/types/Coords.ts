import { IsNotEmpty, IsNumber } from 'class-validator'
import { CREATE, UPDATE } from '../validation/groups'

export default class Coords {

  @IsNotEmpty({ groups: [CREATE] })
  @IsNumber({}, { groups: [CREATE, UPDATE] })
  lat: number

  @IsNotEmpty({ groups: [CREATE] })
  @IsNumber({}, { groups: [CREATE, UPDATE] })
  lng: number

}
