import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions,
  TableForeignKeyOptions
} from 'typeorm'

export class AddTablePosts1712553702710 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'posts',
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
            name: 'blogId',
            isNullable: true
          },
          {
            name: 'title',
            type: 'character varying',
            isNullable: true
          },
          {
            name: 'content',
            type: 'character varying',
            isNullable: true
          },
          {
            name: 'shortDescription',
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
            referencedTableName: 'blogs',
            referencedColumnNames: ['id'],
            columnNames: ['blogId']
          }
        ] as TableForeignKeyOptions[]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('posts', true)
  }
}
