import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateUsersBanReason1711431783689 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', {
      name: 'banReason',
      type: 'character varying',
      isNullable: true
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'banReason')
  }
}
