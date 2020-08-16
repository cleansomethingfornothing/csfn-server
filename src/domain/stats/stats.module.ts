import {Module} from '@nestjs/common';
import {StatsService} from './stats.service';
import {StatsController} from './stats.controller';
import {TypeOrmModule} from '@nestjs/typeorm'
import Count from './entities/Count.entity'
import Stats from './entities/Stats.entity'
import {CleanupsSubscriber} from '../cleanups/cleanups.subscriber'
import {UsersModule} from '../users/users.module'

@Module({
    imports: [TypeOrmModule.forFeature([Stats, Count]), UsersModule],
    providers: [StatsService, CleanupsSubscriber],
    controllers: [StatsController]
})
export class StatsModule {
}
