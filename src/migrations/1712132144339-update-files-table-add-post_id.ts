import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateFilesTableAddPostId1712132144339
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('files', {
      name: 'postId',
      type: 'uuid',
      isNullable: true
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('files', 'postId')
  }
}
