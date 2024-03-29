import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateBlogsAddBanDate1711703145973 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('blogs', {
      name: 'banDate',
      type: 'timestamp',
      isNullable: true
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('blogs', 'banDate')
  }
}
