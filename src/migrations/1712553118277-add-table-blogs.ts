import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions,
  TableForeignKeyOptions
} from 'typeorm'

export class AddTableBlogs1712553118277 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'blogs',
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
            name: 'ownerId',
            isNullable: true
          },
          {
            name: 'name',
            type: 'character varying',
            isNullable: true
          },
          {
            name: 'description',
            type: 'character varying',
            isNullable: true
          },
          {
            name: 'websiteUrl',
            type: 'character varying',
            isNullable: true
          },
          {
            name: 'isMembership',
            type: 'boolean',
            isNullable: false,
            default: false
          },
          {
            name: 'isBanned',
            type: 'boolean',
            isNullable: false,
            default: false
          },
          {
            name: 'banDate',
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
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['ownerId']
          }
        ] as TableForeignKeyOptions[]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('blogs', true)
  }
}
