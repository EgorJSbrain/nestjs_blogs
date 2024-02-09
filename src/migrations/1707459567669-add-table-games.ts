import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions
} from 'typeorm'
import { GameStatusEnum } from '../enums/GameStatusEnum'

export class AddTableGames1707459567669 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'games',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid'
          },
          {
            type: 'enum',
            name: 'status',
            enum: Object.values(GameStatusEnum),
            isNullable: true
          },
          {
            name: 'pairCreatedDate',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'finishGameDate',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'startGameFate',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true
          }
        ] as TableColumnOptions[]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('games', true)
  }
}
