import { Injectable, Logger } from '@nestjs/common'
import { MoreThan, Repository } from 'typeorm'
import Stats from './entities/Stats.entity'
import Count from './entities/Count.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { UsersService } from '../users/users.service'

@Injectable()
export class StatsService {

  logger = new Logger(StatsService.name)

  constructor(@InjectRepository(Stats) private readonly statsRepository: Repository<Stats>,
              @InjectRepository(Count) private readonly countRepository: Repository<Count>,
              private readonly usersService: UsersService) {
  }

  onModuleInit() {
    this.countRepository.query('SELECT * from count')
      .then((totalStats) => totalStats.length
        || this.countRepository.save({ weight: 0, volume: 0 }))
  }

  getTotalStats() {
    return this.countRepository.findOne()
  }

  getMonthStats(userCountry: string) {
    return Promise.all([
      this.statsRepository.find({
        where: [
          { country: userCountry, volume: MoreThan(0) },
          { country: userCountry, weight: MoreThan(0) }
        ]
      }),
      this.statsRepository.createQueryBuilder('stats')
        .select('SUM(weight)', 'weight')
        .addSelect('SUM(volume)', 'volume')
        .addSelect('month')
        .addSelect('year')
        .groupBy('month, year')
        .where('weight > 0')
        .where('volume > 0')
        .getRawMany()])
      .then(([country, world]) => ({ country, world }))
  }

  getTopUsers(country: string,
              sort: 'totalWeight' | 'totalVolume') {
    return this.usersService.findTopUsers(country, sort)
  }

  getUserStats(userId: number,
               orderBy: 'day' | 'month') {
    return this.usersService.findUserStats(userId, orderBy)
  }

  getCountriesCount() {
    return this.statsRepository.query('SELECT COUNT(*) FROM (SELECT country ' +
      'FROM stats GROUP BY country ' +
      'HAVING SUM(weight) > 0 OR SUM(volume) > 0 ' +
      'OR (SELECT COUNT(id) FROM cleanups WHERE "locationAddressCountrycode" = stats.country) > 0 ' +
      'OR (SELECT COUNT(*) FROM users WHERE users.country = stats.country) > 0) as sub').then(([count]) => count)
  }

  getCountries() {
    return this.statsRepository.query('SELECT country, SUM(weight) as weight, SUM(volume) as volume, ' +
      '(SELECT COUNT(id) FROM cleanups WHERE "locationAddressCountrycode" = stats.country) as cleanups, (SELECT COUNT(*) FROM users WHERE users.country = stats.country) as users ' +
      'FROM stats GROUP BY country')
  }
}
