import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { Comment, CommentDocument } from './comments.schema';
import { CreateCommentDto } from '../dtos/comments/create-comment.dto';
import { RequestParams, ResponseBody } from '../types/request';
import { RoutesEnum } from '../constants/global';

@Controller(RoutesEnum.comments)
export class CommentsController {
  constructor(private commentsRepository: CommentsRepository) {}

  @Get(':id')
  async getById(@Param()  params: { id: string }): Promise<Comment | null> {
    const comment = await this.commentsRepository.getCommentById(params.id)

    return comment
  }

  @Put(':commentId/like-status')
  async likeComment(@Param()  params: { id: string }): Promise<Comment | null> {
    // const comment = await this.commentsRepository.getCommentById(params.id)

    return null
  }

  @Put(':commentId')
  async updateComment(@Param()  params: { id: string }): Promise<Comment | null> {
    // const comment = await this.commentsRepository.getCommentById(params.id)

    return null
  }

  @Delete(':id')
  async deleteComment(@Param()  params: { id: string }): Promise<any> {
    return this.commentsRepository.deleteComment(params.id)
  }
}
