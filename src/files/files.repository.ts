import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Equal, Not, Repository } from 'typeorm'

import { FileEntity } from '../entities/files'
import { CreateFileData } from '../types/files'
import { FileTypeEnum } from 'src/enums/FileTypeEnum'
import { writeSql } from 'src/utils/sqlWriteFile'

@Injectable()
export class FilesRepository {
  constructor(
    @InjectRepository(FileEntity)
    private readonly filesRepo: Repository<FileEntity>
  ) {}
  async createFile(data: CreateFileData, manager: EntityManager) {
    const { url, userId, blogId, width, height, type, size, fileSize, postId } =
      data

    const newFile = this.filesRepo.create()

    newFile.url = url
    newFile.userId = userId
    newFile.blogId = blogId
    newFile.width = width
    newFile.height = height
    newFile.type = type
    newFile.size = size
    newFile.fileSize = fileSize

    if (postId) {
      newFile.postId = postId
    }

    return manager.save(newFile)
  }

  async getWallpaperByBlogId(blogId: string): Promise<FileEntity | null> {
    const wallpaper = await this.filesRepo
      .createQueryBuilder('file')
      .select('file.*')
      .where('file.blogId = :blogId AND file.type = :type', {
        blogId,
        type: FileTypeEnum.wallpaper
      })
      .getRawOne()

    if (!wallpaper) {
      return null
    }

    return wallpaper
  }

  async getMainByBlogId(blogId: string): Promise<FileEntity[] | []> {
    const main = await this.filesRepo
      .createQueryBuilder('file')
      .select('file.*')
      .where('file.blogId = :blogId AND file.type = :type', {
        blogId,
        type: FileTypeEnum.main
      })
      .getRawMany()

    if (!main.length) {
      return []
    }

    return main
  }

  async getMainByBlogIdWithManager(
    blogId: string,
    manager: EntityManager
  ): Promise<FileEntity[] | []> {
    const main = await manager.find(FileEntity, {
      where: {
        blogId,
        type: Equal(FileTypeEnum.main)
      }
    })

    if (!main.length) {
      return []
    }

    return main
  }
}
