import { MigrationInterface, QueryRunner, Table, TableColumnOptions, TableForeignKeyOptions } from 'typeorm'

export class AddTableUsersBlogs1712574813498
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_blog_mapping',
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
            name: 'userId',
            isNullable: true
          },
          {
            type: 'uuid',
            name: 'blogId',
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
    await queryRunner.dropTable('user_blog_mapping', true)
  }
}
