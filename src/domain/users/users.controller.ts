import {Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Patch, Session} from '@nestjs/common'
import User from './user.entity'
import {Validation} from '../../validation/validation.decorator'
import {UPDATE} from '../../validation/groups'
import {UsersService} from './users.service'
import {Logged} from '../auth/guards/logged.guard'

@Controller('user')
export class UsersController {

    constructor(private userService: UsersService) {
    }

    @Logged({self: true})
    @Patch(':id')
    @Validation([UPDATE], {skipMissingProperties: true})
    update(@Param('id', ParseIntPipe) id: number, @Body() user: User): Promise<User> {
        return this.userService.update(id, {...user, id: undefined})
            .then(updatedUser => updatedUser || Promise.reject(new NotFoundException(`There is no user with id '${id}'`)))
    }

    @Logged()
    @Get(':id')
    findOne(@Session() session, @Param('id', ParseIntPipe) id: number): Promise<User> {
        return this.userService.findOne(id)
            .then(user => user || Promise.reject(new NotFoundException(`There is no user with id '${id}'`)))
    }
}
