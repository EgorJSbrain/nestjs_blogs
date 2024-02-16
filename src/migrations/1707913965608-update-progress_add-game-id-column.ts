import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateProgressAddGameIdColumn1707913965608
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('progresses', {
      name: 'gameId',
      type: 'uuid',
      isNullable: true
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('progresses', 'gameId');
  }
}
