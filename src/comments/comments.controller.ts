import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { Comment, CommentDocument } from './comments.schema';
import { CreateCommentDto } from 'src/dtos/comments/create-comment.dto';
import { RequestParams } from 'src/types/request';
import { ResponseBody } from 'src/types/request';

@Controller('comments')
export class CommentsController {
  constructor(private commentsRepository: CommentsRepository) {}

  @Get()
  async getAll(@Query() query: RequestParams):Promise<ResponseBody<CommentDocument> | []> {
    const comments = await this.commentsRepository.getAll(query)

    return comments
  }

  @Get(':id')
  async getById(@Param()  params: { id: string }): Promise<Comment | null> {
    const comment = await this.commentsRepository.getCommentById(params.id)

    return comment
  }

  @Post()
  async creatcomment(@Body() data: CreateCommentDto): Promise<any> {
    return this.commentsRepository.createComment(data)
  }

  @Delete(':id')
  async deletecomment(@Param()  params: { id: string }): Promise<any> {
    return this.commentsRepository.deleteComment(params.id)
  }
}
