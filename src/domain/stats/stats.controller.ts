import { Controller, Get, Query } from '@nestjs/common'
import { Logged } from '../auth/guards/logged.guard'
import { StatsService } from './stats.service'
import { StatsQuery } from '../../types/StatsQuery'
import { getValidationPipe } from '../../validation/validation.decorator'
import { plainToClass } from 'class-transformer'
import { CountriesStats } from '../../types/CountriesStats'
import { UserStatsQuery } from '../../types/UserStatsQuery'

@Controller('stats')
export class StatsController {

  constructor(private readonly statsService: StatsService) {
  }

  @Logged()
  @Get('total')
  getTotalStats() {
    return this.statsService.getTotalStats()
  }

  @Logged()
  @Get('months')
  getMonthStats(@Query(getValidationPipe(['month'])) { country }: StatsQuery) {
    return this.statsService.getMonthStats(country)
  }

  @Get('top_users')
  getTopUsers(@Query(getValidationPipe(['users'])) { country, sort }: StatsQuery) {
    return this.statsService.getTopUsers(country, sort)
  }

  @Get('countries_count')
  getCountriesCount() {
    return this.statsService.getCountriesCount()
  }

  @Get('countries')
  getCountries() {
    return this.statsService.getCountries()
      .then((countries) => plainToClass(CountriesStats, countries))
  }

  @Get('user')
  getUserStats(@Query(getValidationPipe()) { userId, groupBy }: UserStatsQuery) {
    return this.statsService.getUserStats(userId, groupBy)
  }
}
