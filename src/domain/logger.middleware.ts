import {Injectable, Logger, NestMiddleware,} from '@nestjs/common'
import {NextFunction, Request, Response} from 'express'

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
    private

    use(request: Request, response: Response, next: NextFunction): void {
        let oldWrite = response.write, oldEnd = response.end;

        let logger = new Logger('HTTP');
        logger.log(request.method + ' - ' + request.originalUrl + ' - ' + JSON.stringify(request.body))

        const chunks = []

        response.write = function (chunk, cb?) {
            chunks.push(new Buffer(chunk));

            return oldWrite.apply(response, arguments);
        };


        response.end = function (chunk) {
            if (chunk)
                chunks.push(new Buffer(chunk));

            let body = Buffer.concat(chunks).toString('utf8');
            logger.log(request.method + ' - ' + request.originalUrl + ' - ' + JSON.stringify(body))

            oldEnd.apply(response, arguments);
        };

        next();
    }
}
