import { Injectable } from '@nestjs/common'
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator'
import { getManager } from 'typeorm'

@Injectable()
@ValidatorConstraint({ name: 'referenceExists', async: true })
class ReferenceExistsValidator implements ValidatorConstraintInterface {

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `$property with id '${validationArguments.value.id}' does not exist`
  }

  validate(value: any,
           validationArguments?: ValidationArguments): Promise<boolean> {
    return getManager().findOne(validationArguments.constraints[0], { id: value.id })
      .then((entity) => {
        return !!entity
      })
  }

}

export function ReferenceExists<T>(entity: T,
                                   validationOptions?: ValidationOptions) {
  return (object: any,
          propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [entity],
      validator: ReferenceExistsValidator
    })
  }
}
