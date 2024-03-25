import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm'

export class UpdateBlogsTableFkOwnerId1711347807696
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'blogs',
      new TableForeignKey({
        columnNames: ['ownerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('blogs', 'ownerId')
  }
}
