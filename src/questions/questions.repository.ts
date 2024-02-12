import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { RequestParams, ResponseBody } from '../types/request';
import { UpdatePostDto } from '../dtos/posts/update-post.dto';
import { ICreatePostType, IExtendedPost } from '../types/posts';
import { SortDirections, SortType } from '../constants/global';
import { appMessages } from '../constants/messages';
import { QuestionEntity } from '../entities/question';
import { IQuestion } from '../types/questions';
import { CreateQuestionDto } from 'src/dtos/questions/create-question.dto';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,

    @InjectRepository(QuestionEntity)
    private readonly questionsRepo: Repository<QuestionEntity>
  ) {}

  async getAll(
    params: RequestParams,
  ): Promise<ResponseBody<IQuestion> | []> {
    try {

      return []
    } catch {
      return []
    }
  }

  async getById(id: string, userId?: string): Promise<IExtendedPost | null> {
    // const query = this.postsRepo.createQueryBuilder('post')

    // const post = await query
    //   .select([
    //     'post.id',
    //     'post.blogId',
    //     'post.title',
    //     'post.shortDescription',
    //     'post.content',
    //     'post.createdAt'
    //   ])
    //   .leftJoinAndSelect('post.blog', 'blog')
    //   .where('post.id = :id', { id })
    //   .getOne()

    // if (!post) {
    //   return null
    // }

    return null
  }

  async createQuestion(data: CreateQuestionDto): Promise<IQuestion | null> {
    try {
      console.log("data:", data)
      // const query = this.postsRepo.createQueryBuilder('post')

      // const newPost = await query
      //   .insert()
      //   .values({
      //     blogId: data.blogId,
      //     title: data.title,
      //     shortDescription: data.shortDescription,
      //     content: data.content
      //   })
      //   .execute()

      // const post = await this.getById(newPost.raw[0].id)

      // if (!post) {
      //   return null
      // }

      return null
    } catch {
      return null
    }
  }

  async updateQuestion(id: string, data: UpdatePostDto): Promise<boolean> {
    // const updatedBlog = await this.postsRepo
    //   .createQueryBuilder('post')
    //   .update()
    //   .set({
    //     title: data.title,
    //     content: data.content,
    //     shortDescription: data.shortDescription
    //   })
    //   .where('id = :id', {
    //     id
    //   })
    //   .execute()

    // if (!updatedBlog.affected) {
    //   return false
    // }

    return true
  }

  async deleteQuestion(id: string) {
    try {
      // const post = await this.postsRepo
      //   .createQueryBuilder('post')
      //   .delete()
      //   .where('id = :id', { id })
      //   .execute()

      // return !!post.affected
    } catch (e) {
      throw new Error(appMessages().errors.somethingIsWrong)
    }
  }
}
