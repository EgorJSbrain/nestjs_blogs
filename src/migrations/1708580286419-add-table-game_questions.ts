import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions,
  TableForeignKeyOptions
} from 'typeorm'

export class AddTableGameQuestions1708580286419 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'game_questions',
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
            name: 'gameId',
            isNullable: true
          },
          {
            type: 'uuid',
            name: 'questionId',
            isNullable: true
          },
          {
            type: 'int',
            name: 'order',
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
            referencedTableName: 'games',
            referencedColumnNames: ['id'],
            columnNames: ['gameId']
          },
          {
            referencedTableName: 'questions',
            referencedColumnNames: ['id'],
            columnNames: ['questionId']
          }
        ] as TableForeignKeyOptions[]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('game_questions', true)
  }
}
