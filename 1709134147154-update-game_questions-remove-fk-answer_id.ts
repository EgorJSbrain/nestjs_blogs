import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm'

export class UpdateGameQuestionsRemoveFkAnswerId1709134147154
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'game_questions',
      new TableForeignKey({
        columnNames: ['answerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'answers'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'answers',
      new TableForeignKey({
        columnNames: ['answerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'answers'
      })
    )
  }
}
