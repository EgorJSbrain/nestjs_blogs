import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateGameAddFirstPlayerProgressIdColumn1707974606757
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('games', {
      name: 'firstPlayerProgressId',
      type: 'uuid',
      isNullable: true
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('games', 'firstPlayerProgressId');
  }
}
