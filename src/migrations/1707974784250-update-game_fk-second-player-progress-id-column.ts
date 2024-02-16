import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm'

export class UpdateGameFkSecondPlayerProgressIdColumn1707974784250
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'games',
      new TableForeignKey({
        columnNames: ['secondPlayerProgressId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'progresses'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('games', 'secondPlayerProgressId')
  }
}
