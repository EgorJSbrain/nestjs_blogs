import { FileTypeEnum } from '../enums/FileTypeEnum'
import { ImageSizeEnum } from '../enums/ImageSizeEnum'
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions,
  TableForeignKeyOptions
} from 'typeorm'

export class AddTableFiles1712122105063 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'files',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'blogId',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'url',
            type: 'character varying',
            isNullable: true
          },
          {
            name: 'type',
            type: 'enum',
            enum: Object.values(FileTypeEnum),
            isNullable: true
          },
          {
            name: 'size',
            type: 'enum',
            enum: Object.values(ImageSizeEnum),
            isNullable: true
          },
          {
            name: 'fileSize',
            type: 'int',
            isNullable: true
          },
          {
            name: 'width',
            type: 'int',
          },
          {
            name: 'height',
            type: 'int',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: true
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true
          }
        ] as TableColumnOptions[],
        foreignKeys: [
          {
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['userId']
          },
          {
            referencedTableName: 'blogs',
            referencedColumnNames: ['id'],
            columnNames: ['blogId']
          }
        ] as TableForeignKeyOptions[]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('files', true)
  }
}
