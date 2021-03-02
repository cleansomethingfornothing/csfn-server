import {RedisModule, RedisService} from 'nestjs-redis'
import {AuthModule} from './domain/auth/auth.module'
import {UsersModule} from './domain/users/users.module'
import {TypeOrmModule} from '@nestjs/typeorm'
import {ImagesModule} from './domain/images/images.module'
import {PasswordResetModule} from './domain/password-reset/password-reset.module'
import {ServeStaticModule} from '@nestjs/serve-static'
import {join} from 'path'
import {ScheduleModule} from '@nestjs/schedule'
import {ConfigModule} from '@nestjs/config'
import {MailerModule} from '@nestjs-modules/mailer'
import {SessionModule} from 'nestjs-session'
import {ProvidersModule} from './providers/providers.module'
import * as session from 'express-session'
import * as ConnectRedis from 'connect-redis'
import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common'
import {CleanupsModule} from './domain/cleanups/cleanups.module';
import {StatsModule} from './domain/stats/stats.module';
import {CleanupsSubscriber} from './domain/cleanups/cleanups.subscriber'
import {RootController} from './domain/root.controller'
import {AppLoggerMiddleware} from './domain/logger.middleware'

const RedisStore = ConnectRedis(session)

@Module({
    imports: [
        ConfigModule.forRoot({
            ignoreEnvFile: process.env.NODE_ENV !== 'development',
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV}`
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV !== 'development' ? {
                rejectUnauthorized: false
            } : undefined,
            entities: [
                'dist/**/*.entity{.ts,.js}'
            ],
            synchronize: process.env.NODE_ENV === 'development',
            subscribers: [CleanupsSubscriber],
            migrations: ['migration/*.js'],
            cli: {
                migrationsDir: 'migration'
            }
        }),
        RedisModule.register({
            url: process.env.REDIS_URL,
            db: parseInt(process.env.REDIS_DB, 10),
            keyPrefix: process.env.REDIS_PREFIX
        }),
        SessionModule.forRootAsync({
            imports: [ProvidersModule],
            inject: [RedisService],
            useFactory: (redisService: RedisService) => ({
                session: {
                    name: 'csfn.id',
                    secret: process.env.SESSION_SECRET,
                    rolling: true,
                    saveUninitialized: false,
                    resave: false,
                    store: new RedisStore({client: redisService.getClient()}),
                    cookie: {
                        maxAge: 30 * 24 * 60 * 60 * 1000, // One month
                        httpOnly: true
                    }
                }
            })
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'static'),
            serveRoot: '/static'
        }),
        MailerModule.forRoot({
            transport: `smtps://${process.env.SMTP_USER}:${process.env.SMTP_PASSWORD}@${process.env.SMTP_SERVER}`,
            defaults: {
                from: '"Clean Something For Nothing" <info@cleansomethingfornothing.com>'
            }
        }),
        ScheduleModule.forRoot(),
        AuthModule,
        UsersModule,
        ImagesModule,
        PasswordResetModule,
        CleanupsModule,
        StatsModule
    ],
    controllers: [RootController]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(AppLoggerMiddleware).forRoutes('*');
    }
}
