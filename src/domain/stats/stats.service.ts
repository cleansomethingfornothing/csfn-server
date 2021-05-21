import { Injectable, Logger } from '@nestjs/common'
import { Repository } from 'typeorm'
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
      this.statsRepository.find({ country: userCountry }),
      this.statsRepository.createQueryBuilder('stats')
        .select('SUM(weight)', 'weight')
        .addSelect('SUM(volume)', 'volume')
        .addSelect('month')
        .addSelect('year')
        .groupBy('month, year')
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
    return this.statsRepository.createQueryBuilder('countries_count')
      .select('count(distinct country)')
      .getRawOne()
  }

  getCountries() {
    return this.statsRepository.query('SELECT country, SUM(weight) as weight, SUM(volume) as volume, ' +
      '(SELECT COUNT(id) FROM cleanups WHERE "locationAddressCountrycode" = stats.country) as cleanups, (SELECT COUNT(*) FROM users WHERE users.country = stats.country) as users ' +
      'FROM stats GROUP BY country')
  }
}
