import { IsBooleanString, IsNumberString, Matches } from 'class-validator'

export default class CleanupsQuery {

  @IsBooleanString()
  onlyCoords: boolean

  @IsNumberString()
  userId: number

  @Matches(/((^|,)[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)){2}$/, { message: 'bound must be in the form \'lat_sw,lng_sw,lat_ne,lng_ne\'' })
  bounds: string

  @Matches(/((^|,)[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?))/, { message: 'origin must be in the format \'lat,lng\'' })
  origin: string
}
