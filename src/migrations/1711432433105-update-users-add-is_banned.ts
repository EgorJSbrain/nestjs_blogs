import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateUsersAddIsBanned1711432433105 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', {
      name: 'isBanned',
      type: 'boolean',
      default: false
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'isBanned')
  }
}
