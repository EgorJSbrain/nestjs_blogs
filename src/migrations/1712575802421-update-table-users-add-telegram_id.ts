import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateTableUsersAddTelegramId1712575802421
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', {
      name: 'telegramId',
      type: 'character varying',
      isNullable: true
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'telegramId')
  }
}
