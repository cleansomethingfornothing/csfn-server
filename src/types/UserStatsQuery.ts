import { IsDefined, IsIn, IsNumberString } from 'class-validator'

export class UserStatsQuery {

  @IsDefined({ message: 'missing userId in query params' })
  @IsNumberString()
  userId: number

  @IsDefined({ message: 'missing groupBy in query params' })
  @IsIn(['day', 'month'])
  groupBy: 'day' | 'month'

}
