import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm'

export class UpdateAnswersTableFkQuestionId1709274181254
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'answers',
      new TableForeignKey({
        columnNames: ['questionId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'game_questions'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('answers', 'questionId')
  }
}
