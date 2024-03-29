import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateBlogsAddIsBanned1711703090560 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('blogs', {
      name: 'isBanned',
      type: 'boolean',
      default: false
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('blogs', 'isBanned')
  }
}
