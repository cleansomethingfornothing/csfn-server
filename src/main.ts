import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { ClassSerializerInterceptor } from '@nestjs/common'

function bootstrap() {
  NestFactory.create(AppModule)
    .then((app) => {
      if (process.env.CORS) {
        app.enableCors({ origin: process.env.CORS.split(','), credentials: true })
      }
      app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
      const port = process.env.PORT || 3000

      // tslint:disable-next-line:no-console
      app.listen(port).then(() => console.log('Listening on ' + port))
    })
}

bootstrap()
