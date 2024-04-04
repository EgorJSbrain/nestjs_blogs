import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { IFile } from '../types/files'
import { ImageSizeEnum } from '../enums/ImageSizeEnum'
import { FileTypeEnum } from '../enums/FileTypeEnum'
import { BlogEntity } from './blog'

@Entity({
  name: 'files'
})

export class FileEntity extends BaseEntity implements IFile {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column()
  blogId: string

  @Column({ type: 'uuid', nullable: true })
  postId?: string | null

  @Column()
  url: string

  @Column({ type: 'enum', enum: ImageSizeEnum })
  size: ImageSizeEnum | null

  @Column({ type: 'enum', enum: FileTypeEnum })
  type: FileTypeEnum

  @Column()
  fileSize: number

  @Column()
  width: number

  @Column()
  height: number

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    name: 'createdAt',
  })
  createdAt: Date

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'updatedAt',
  })
  updatedAt: Date | null;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'deletedAt',
  })
  deletedAt: Date | null;

  @OneToOne(() => BlogEntity)
  @JoinColumn({
    name: 'blogId'
  })
  blog: BlogEntity
}
