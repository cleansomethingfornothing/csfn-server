import {IsDefined, Matches} from 'class-validator'
import {IsCountryCode} from '../validation/validators/is-country-code'

export class StatsQuery {

    @IsDefined({groups: ['month', 'users'], message: 'missing country in query params'})
    @IsCountryCode({groups: ['month', 'users']})
    country: string

    @IsDefined({groups: ['users'], message: 'missing sort in query params'})
    @Matches(/(totalWeight|totalVolume)/, {groups: ['users'], message: 'sort can only be totalWeight or totalVolume'})
    sort: 'totalWeight' | 'totalVolume'

}
