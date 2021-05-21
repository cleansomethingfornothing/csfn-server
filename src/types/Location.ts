import Coords from './Coords'
import Address from './Address'
import { IsNotEmpty, IsNotEmptyObject, ValidateNested } from 'class-validator'
import { Column, Index } from 'typeorm'
import { CREATE, UPDATE } from '../validation/groups'
import { Type } from 'class-transformer'

export default class Location {

  @Index({ spatial: true })
  @Column({
    type: 'geometry', spatialFeatureType: 'point', srid: 4326, transformer: {
      to: ({ lng, lat }: Coords) => ({ type: 'Point', coordinates: [lat, lng] }),
      from: ({ coordinates }) => ({ lat: coordinates[0], lng: coordinates[1] })
    }
  })
  @ValidateNested({ groups: [CREATE, UPDATE] })
  @Type(() => Coords)
  @IsNotEmptyObject({}, { groups: [CREATE] })
  coords: Coords

  @Column(type => Address)
  @ValidateNested({ groups: [CREATE, UPDATE] })
  @Type(() => Address)
  @IsNotEmpty({ groups: [CREATE] })
  address?: Address

}
