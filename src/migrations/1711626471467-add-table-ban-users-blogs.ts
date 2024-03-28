import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions,
  TableForeignKeyOptions
} from 'typeorm'

export class AddTableBanUsersBlogs1711626471467 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ban_users_blogs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'blogId',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'isBanned',
            type: 'boolean',
            default: false
          },
          {
            name: 'banReason',
            type: 'character varying',
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
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['userId']
          },
          {
            referencedTableName: 'blogs',
            referencedColumnNames: ['id'],
            columnNames: ['blogId']
          }
        ] as TableForeignKeyOptions[]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ban_users_blogs', true)
  }
}
