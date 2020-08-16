import {Injectable} from '@nestjs/common'
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator'
import {getManager} from 'typeorm'
import {ClassType} from 'class-transformer/ClassTransformer'

@Injectable()
@ValidatorConstraint({name: 'isUnique', async: true})
class IsUniqueValidator implements ValidatorConstraintInterface {

    defaultMessage(validationArguments?: ValidationArguments): string {
        return `$property is already being used`
    }

    validate(value: any, {constraints, property}: ValidationArguments): Promise<boolean> {
        const [entity, column, nestedKey] = constraints

        return getManager()
            .findOne(entity, {[column || property]: nestedKey ? value[nestedKey] : value})
            .then((found) => !found)
    }

}

export function IsUnique<T>({entity, column, nestedKey}: { entity: ClassType<T>, column?: string, nestedKey?: string },
                            validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [entity, column, nestedKey],
            validator: IsUniqueValidator
        })
    }
}
