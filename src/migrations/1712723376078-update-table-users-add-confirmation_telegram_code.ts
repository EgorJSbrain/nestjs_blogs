import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateTableUsersAddConfirmationTelegramCode1712723376078
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', {
      name: 'confirmationTelegramCode',
      type: 'character varying',
      isNullable: true
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'confirmationTelegramCode')
  }
}
