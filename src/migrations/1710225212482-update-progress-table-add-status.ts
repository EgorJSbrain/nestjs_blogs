import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'
import { ProgressStatusEnum } from '../enums/ProgressStatusEnum'

export class UpdateProgressTableAddStatus1710225212482
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('progresses', {
      type: 'enum',
      name: 'status',
      enum: Object.values(ProgressStatusEnum),
      isNullable: true
    } as TableColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('progresses', 'status')
  }
}
