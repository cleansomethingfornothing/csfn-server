import {Injectable} from '@nestjs/common'
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator'
import * as countriesQuery from 'countries-code'

@Injectable()
@ValidatorConstraint({name: 'isCountryCode'})
class IsCountryCodeValidator implements ValidatorConstraintInterface {

    defaultMessage(validationArguments?: ValidationArguments): string {
        return `$property is not a valid country code`
    }

    validate(value: any): Promise<boolean> {
        return typeof value === 'string' && countriesQuery.getAllAlphaTwoCodes().includes(value.toUpperCase())
    }

}

export function IsCountryCode<T>(validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsCountryCodeValidator
        })
    }
}
