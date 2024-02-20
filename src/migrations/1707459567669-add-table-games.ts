import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions,
  TableForeignKeyOptions
} from 'typeorm'
import { GameStatusEnum } from '../enums/gameStatusEnum'

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
            type: 'uuid',
            name: 'firstPlayerProgressId',
            isNullable: true,
          },
          {
            type: 'uuid',
            name: 'secondPlayerProgressId',
            isNullable: true,
          },
          {
            type: 'enum',
            name: 'status',
            enum: Object.values(GameStatusEnum),
            isNullable: true
          },
          {
            name: 'finishGameDate',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'startGameDate',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: true
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
        ] as TableColumnOptions[],
        foreignKeys: [
          {
            referencedTableName: 'progresses',
            referencedColumnNames: ['id'],
            columnNames: ['firstPlayerProgressId'],
          },
          {
            referencedTableName: 'progresses',
            referencedColumnNames: ['id'],
            columnNames: ['secondPlayerProgressId'],
          },
        ] as TableForeignKeyOptions[],
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('games', true)
  }
}
