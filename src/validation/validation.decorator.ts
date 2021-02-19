import {BadRequestException, UsePipes, ValidationPipe, ValidationPipeOptions} from '@nestjs/common'

export const Validation: (groups: string[], options?: ValidationPipeOptions) => MethodDecorator
    = (groups, options) => UsePipes(getValidationPipe(groups, options))

export const getValidationPipe = (groups?: string[], options?: ValidationPipeOptions) => new ValidationPipe({
    ...options,
    transform: true,
    forbidUnknownValues: true,
    exceptionFactory: (errors) => new BadRequestException(errors),
    validationError: {
        target: false,
        value: false
    },
    transformOptions: {
        groups,
        ...(options && options.transformOptions)
    },
    groups
})
