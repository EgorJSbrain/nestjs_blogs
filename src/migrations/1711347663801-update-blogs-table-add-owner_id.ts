import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateBlogsTableAddOwnerId1711347663801
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('blogs', {
      name: 'ownerId',
      type: 'uuid',
      isNullable: true
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('blogs', 'ownerId')
  }
}
