import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateGameQuestionsRemoveAnswerId1709134242948
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('game_questions', 'answerId')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('game_questions', {
      name: 'answerId',
      type: 'uuid',
      isNullable: true
    } as TableColumn)
  }
}
