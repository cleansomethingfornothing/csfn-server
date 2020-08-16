import {Controller, Get} from '@nestjs/common'

@Controller('/')
export class RootController {

    @Get()
    root() {
        return {
            name: 'CSFN Server',
            version: process.env.npm_package_version
        }
    }

}
