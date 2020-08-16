import {EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent} from 'typeorm'
import Cleanup from './cleanup.entity'

@EventSubscriber()
export class CleanupsSubscriber implements EntitySubscriberInterface<Cleanup> {

    listenTo(): Function {
        return Cleanup
    }

    afterInsert({manager, entity}: InsertEvent<Cleanup>): Promise<any> | void {

        return Promise.all([
            manager.query(`
      INSERT INTO stats (month, year, country, weight, volume) 
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (month, year, country) DO UPDATE SET weight = stats.weight + $4, volume = stats.volume + $5;`,
                [entity.date.getMonth(), entity.date.getFullYear(), entity.location.address.countryCode, entity.weight, entity.volume]),
            manager.query('UPDATE count SET weight = weight + $1, volume = volume + $2;',
                [entity.weight, entity.volume]),
            manager.query('UPDATE users SET "totalWeight" = "totalWeight" + $1, "totalVolume" = "totalVolume" + $2, "totalCleanups" = "totalCleanups" + 1 WHERE id = $3;',
                [entity.weight, entity.volume, entity.user.id])
        ])
    }

    afterUpdate({manager, entity, databaseEntity}: UpdateEvent<Cleanup>): Promise<any> | void {
        return Promise.all([
            manager.query(`
      UPDATE stats SET 
          weight = weight + $1,
          volume = volume + $2
          WHERE month = $3 AND year = $4 AND country = $5;`,
                [entity.weight - databaseEntity.weight, entity.volume - databaseEntity.volume, databaseEntity.date.getMonth(),
                    databaseEntity.date.getFullYear(), databaseEntity.location.address.countryCode]),
            manager.query(`
      UPDATE count SET 
          weight = weight + $1,
          volume = volume + $2;`,
                [entity.weight - databaseEntity.weight, entity.volume - databaseEntity.volume]),
            manager.query(`
      UPDATE users SET
          "totalWeight" = "totalWeight" + $1,
          "totalVolume" = "totalVolume" + $2
          WHERE id = $3;`,
                [entity.weight - databaseEntity.weight, entity.volume - databaseEntity.volume, entity.user.id])
        ])
    }

    beforeRemove({manager, entity}: RemoveEvent<Cleanup>): Promise<any> | void {
        return Promise.all([
            manager.query(`
      UPDATE stats SET 
          weight = weight - $1,
          volume = volume - $2
          WHERE month = $3 AND year = $4 AND country = $5;`,
                [entity.weight, entity.volume, entity.date.getMonth(), entity.date.getFullYear(), entity.location.address.countryCode]),
            manager.query('UPDATE count SET weight = weight - $1, volume = volume - $2;',
                [entity.weight, entity.volume]),
            manager.query(`
      UPDATE users SET
          "totalWeight" = "totalWeight" - $1,
          "totalVolume" = "totalVolume" - $2,
          "totalCleanups" = "totalCleanups" - 1
          WHERE id = $3;`,
                [entity.weight, entity.volume, entity.user.id])
        ])
    }

}
