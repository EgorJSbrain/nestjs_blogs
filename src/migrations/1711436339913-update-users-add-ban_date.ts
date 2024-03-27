import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateUsersAddBanDate1711436339913 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', {
      name: 'banDate',
      type: 'timestamp',
      isNullable: true
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'banDate')
  }
}
