import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateAnswersTableAddQuestionId1709274109802
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('answers', {
      name: 'questionId',
      type: 'uuid',
      isNullable: true
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('answers', 'questionId')
  }
}
