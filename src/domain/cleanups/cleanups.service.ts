import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Cleanup from './cleanup.entity'
import { Repository } from 'typeorm'
import CoordsBound from '../../types/CoordsBound'
import Coords from '../../types/Coords'
import { coordsBoundsToPolygon, coordsToPoint } from '../../utils/CoordsUtils'

@Injectable()
export class CleanupsService {

  constructor(@InjectRepository(Cleanup) private cleanupsRepository: Repository<Cleanup>) {
  }

  register(cleanup: Cleanup) {
    return this.cleanupsRepository.save(cleanup)
  }

  update(saved: Cleanup,
         cleanup: Cleanup) {
    return this.cleanupsRepository.save(this.cleanupsRepository.merge(saved, cleanup))
  }

  findOne(id: number) {
    return this.cleanupsRepository.findOneOrFail({ id }, { relations: ['user', 'user.picture', 'pictures'] })
  }

  find(onlyCoords: boolean,
       origin: Coords,
       bounds: CoordsBound,
       userId: number): Promise<Cleanup[]> {
    const queryBuilder = this.cleanupsRepository.createQueryBuilder('cleanup')

    if (onlyCoords) {
      queryBuilder.select('cleanup.id, ST_AsGeoJSON(cleanup.location.coords) as "locationCoords"')
    }

    if (userId) {
      queryBuilder.andWhere('cleanup.userId = :userId', { userId })
    }

    if (bounds) {
      queryBuilder.andWhere('ST_CONTAINS(ST_GeomFromText(:bounds, 4326), cleanup.locationCoords)',
        { bounds: coordsBoundsToPolygon(bounds) })
    }

    if (origin) {
      queryBuilder
        .andWhere('ST_DistanceSphere(cleanup.locationCoords, ST_GeomFromText(:origin, 4326)) < 2500000')
        .orderBy('ST_DistanceSphere(cleanup.locationCoords, ST_GeomFromText(:origin, 4326))')
        .setParameter('origin', coordsToPoint(origin))
        .limit(5)
    }

    if (!onlyCoords) {
      queryBuilder.leftJoinAndSelect('cleanup.pictures', 'pictures')
    }

    return onlyCoords
      ? queryBuilder.getRawMany()
        .then((cleanups) =>
          cleanups.map(({ id, distance, locationCoords }) => {
            const { coordinates } = JSON.parse(locationCoords)
            return {
              id,
              distance,
              location: { coords: { lat: coordinates[0], lng: coordinates[1] } }
            }
          })
        )
      : queryBuilder.getMany()
  }

  delete(cleanup: Cleanup) {
    return this.cleanupsRepository.remove(cleanup)
      .then(() => undefined)
  }
}
