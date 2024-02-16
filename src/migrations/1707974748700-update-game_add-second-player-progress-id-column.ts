import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateGameAddSecondPlayerProgressIdColumn1707974748700
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('games', {
      name: 'secondPlayerProgressId',
      type: 'uuid',
      isNullable: true
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('games', 'secondPlayerProgressId')
  }
}
