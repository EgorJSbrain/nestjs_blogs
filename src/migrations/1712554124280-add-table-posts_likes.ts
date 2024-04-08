import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions,
  TableForeignKeyOptions
} from 'typeorm'

import { LikeStatusEnum } from '../constants/likes'

export class AddTablePostsLikes1712554124280 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'posts_likes',
        columns: [
          {
            name: 'deviceId',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid'
          },
          {
            type: 'uuid',
            name: 'sourceId',
            isNullable: true
          },
          {
            type: 'uuid',
            name: 'authorId',
            isNullable: true
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.keys(LikeStatusEnum),
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
            referencedTableName: 'posts',
            referencedColumnNames: ['id'],
            columnNames: ['sourceId']
          },
          {
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['authorId']
          }
        ] as TableForeignKeyOptions[]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('posts_likes', true)
  }
}
