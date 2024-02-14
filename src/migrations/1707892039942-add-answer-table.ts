import { AnswerStatusEnum } from '../constants/answer'
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions,
  TableForeignKeyOptions
} from 'typeorm'

export class AddAnswerTable1707892039942 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'answers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'answerStatus',
            type: 'enum',
            enum: Object.keys(AnswerStatusEnum),
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'progressId',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'questionId',
            type: 'uuid',
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
            isNullable: true
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true
          }
        ] as TableColumnOptions[],
        foreignKeys: [
          {
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['userId']
          },
          {
            referencedTableName: 'progresses',
            referencedColumnNames: ['id'],
            columnNames: ['progressId']
          },
          {
            referencedTableName: 'questions',
            referencedColumnNames: ['id'],
            columnNames: ['questionId']
          },
        ] as TableForeignKeyOptions[]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('answers', true)
  }
}
