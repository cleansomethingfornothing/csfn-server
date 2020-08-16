import {Module} from '@nestjs/common';
import {CleanupsController} from './cleanups.controller';
import {CleanupsService} from './cleanups.service';
import {TypeOrmModule} from '@nestjs/typeorm'
import Cleanup from './cleanup.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Cleanup])],
    controllers: [CleanupsController],
    providers: [CleanupsService]
})
export class CleanupsModule {
}
