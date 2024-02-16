import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm'

export class UpdateGameFkFirstPlayerProgressIdColumn1707974687397
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'games',
      new TableForeignKey({
        columnNames: ['firstPlayerProgressId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'progresses'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('games', 'firstPlayerProgressId')
  }
}
