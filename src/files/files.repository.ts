import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { FileEntity } from '../entities/files'
import { CreateFileData } from '../types/files'

@Injectable()
export class FilesRepository {
  constructor(
    @InjectRepository(FileEntity)
    private readonly filesRepo: Repository<FileEntity>
  ) {}
  async createFile(data: CreateFileData) {
    const { url, userId, blogId, width, height, type, size, fileSize } = data

    const newFile = this.filesRepo.create()

    newFile.url = url
    newFile.userId = userId
    newFile.blogId = blogId
    newFile.width = width
    newFile.height = height
    newFile.type = type
    newFile.size = size
    newFile.fileSize = fileSize

    return newFile.save()
  }
}
