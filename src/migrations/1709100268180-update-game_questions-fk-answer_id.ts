import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm'

export class UpdateGameQuestionsFkAnswerId1709100268180
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'game_questions',
      new TableForeignKey({
        columnNames: ['answerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'answers'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('game_questions', 'answerId')
  }
}
