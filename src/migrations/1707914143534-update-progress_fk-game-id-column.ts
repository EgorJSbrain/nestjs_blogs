import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm'

export class UpdateProgressFkGameIdColumn1707914143534
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'progresses',
      new TableForeignKey({
        columnNames: ['gameId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'games'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('progresses', 'gameId')
  }
}
