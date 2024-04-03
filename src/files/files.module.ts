import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { FilesRepository } from './files.repository'
import { FileEntity } from '../entities/files'

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  controllers: [],
  providers: [FilesRepository]
})

export class FilesModule {}
