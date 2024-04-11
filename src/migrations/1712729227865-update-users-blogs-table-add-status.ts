import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'
import { SubscriptionStatusEnum } from '../enums/SubscriptionStatusEnum'

export class UpdateUsersBlogsTableAddStatus1712729227865
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users_blogs', {
      name: 'status',
      type: 'enum',
      enum: Object.keys(SubscriptionStatusEnum),
      isNullable: true
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users_blogs', 'status')
  }
}
