import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Query,
    Session,
} from '@nestjs/common'
import Cleanup from './cleanup.entity'
import { Logged } from '../auth/guards/logged.guard'
import { getValidationPipe, Validation } from '../../validation/validation.decorator'
import { CREATE, UPDATE } from '../../validation/groups'
import { CleanupsService } from './cleanups.service'
import { classToPlain } from 'class-transformer'
import CleanupsQuery from '../../types/CleanupsQuery'
import { coordsBoundFromString, coordsFromString } from '../../utils/CoordsUtils'

@Controller('cleanups')
export class CleanupsController {

  constructor(private readonly cleanupsService: CleanupsService) {
  }

  @Post()
  @Logged()
  @Validation([CREATE])
  register(@Session() session: any,
           @Body() cleanup: Cleanup) {
    cleanup.user = session.user
    return this.cleanupsService.register(cleanup)
  }

  @Logged()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.cleanupsService.findOne(id)
      .then(c => classToPlain(c))
      .catch((err) => {
        return Promise.reject(new NotFoundException())
      })
  }

  @Logged()
  @Get()
  find(@Query(getValidationPipe(undefined, { skipMissingProperties: true })) { onlyCoords, userId, bounds, origin }: CleanupsQuery) {
    return this.cleanupsService.find(onlyCoords, coordsFromString(origin), coordsBoundFromString(bounds), userId)
  }

  @Logged()
  @Patch(':id')
  @Validation([UPDATE], { skipMissingProperties: true })
  update(@Session() session: any,
         @Param('id') id: number,
         @Body() cleanup: Cleanup) {
    return this.cleanupsService.findOne(id)
      .catch(() => Promise.reject(new NotFoundException()))
      .then((saved) => saved.user.id === session.user.id
        ? this.cleanupsService.update(saved, cleanup)
        : Promise.reject(new ForbiddenException()))
  }

  @Logged()
  @Delete(':id')
  delete(@Session() session: any,
         @Param('id') id: number) {
    return this.cleanupsService.findOne(id)
      .catch(() => Promise.reject(new NotFoundException()))
      .then((cleanup) => cleanup.user.id === session.user.id
        ? this.cleanupsService.delete(cleanup)
        : Promise.reject(new ForbiddenException()))
  }

}
