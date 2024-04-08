import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions
} from 'typeorm'

export class AddTableUsers1712552776555 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'login',
            type: 'character varying',
            isNullable: true
          },
          {
            name: 'email',
            type: 'character varying',
            isNullable: true
          },
          {
            name: 'banReason',
            type: 'character varying',
            isNullable: true
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
            name: 'confirmationCode',
            type: 'character varying',
            isNullable: true
          },
          {
            name: 'expirationDate',
            type: 'character varying',
            isNullable: true
          },
          {
            name: 'passwordHash',
            type: 'character varying',
            isNullable: true
          },
          {
            name: 'passwordSalt',
            type: 'character varying',
            isNullable: true
          },
          {
            name: 'isConfirmed',
            type: 'boolean',
            isNullable: false,
            default: false
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
        ] as TableColumnOptions[]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users', true)
  }
}
