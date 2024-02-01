import { SkipThrottle } from '@nestjs/throttler'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards
} from '@nestjs/common'
import { Request } from 'express'

import { RoutesEnum } from '../constants/global'
import { JWTService } from '../jwt/jwt.service'
import { IExtendedComment } from '../types/comments'
import { appMessages } from '../constants/messages'
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUserId } from '../auth/current-user-id.param.decorator'
import { LikeDto } from '../dtos/like/like.dto'
import { CommentDto } from '../dtos/comments/create-comment.dto'
import { LikesRepository } from '../likes/likes.repository'
import { LikeSourceTypeEnum } from '../constants/likes'
import { CommentsRepository } from './comments.repository'
import { UsersRepository } from '../users/users.repository'

@SkipThrottle()
@Controller(RoutesEnum.comments)
export class CommentsController {
  constructor(
    private CommentsRepository: CommentsRepository,
    private JWTService: JWTService,
    private usersRepository: UsersRepository,
    private LikesRepository: LikesRepository,
  ) {}

  @Get(':commentId')
  async getById(
    @Param() params: { commentId: string },
    @Req() req: Request
  ): Promise<IExtendedComment | null> {
    const commentId = params.commentId
    let currentUserId: string | null = null

    if (!commentId) {
      throw new HttpException(
        { message: appMessages(appMessages().commentId).errors.isRequiredField, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      const { userId } = this.JWTService.verifyAccessToken(token)
      currentUserId = userId || null
    }

    const comment = await this.CommentsRepository.getById(
      commentId,
      currentUserId
    )

    if (!comment) {
      throw new HttpException(
        {
          message: appMessages(appMessages().comment).errors.notFound,
          field: ''
        },
        HttpStatus.NOT_FOUND
      )
    }

    return comment
  }

  @Put(':commentId/like-status')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeComment(
    @Param() params: { commentId: string },
    @CurrentUserId() currentUserId: string,
    @Body() data: LikeDto
  ): Promise<undefined> {
    const commentId = params.commentId

    if (!commentId) {
      throw new HttpException(
        { message: appMessages(appMessages().commentId).errors.isRequiredField, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const existedUser = await this.usersRepository.getById(currentUserId)

    if (!existedUser) {
      throw new HttpException(
        { message: appMessages(appMessages().user).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const comment = await this.CommentsRepository.getById(commentId)
    console.log("!!!!!!!comment:", comment)

    if (!comment) {
      throw new HttpException(
        {
          message: appMessages(appMessages().comment).errors.notFound,
          field: ''
        },
        HttpStatus.NOT_FOUND
      )
    }

    const like = await this.LikesRepository.likeEntity(
      data.likeStatus,
      commentId,
      LikeSourceTypeEnum.comments,
      existedUser?.id,
    )

    if(!like) {
      throw new HttpException(
        {
          message: appMessages().errors.somethingIsWrong,
          field: ''
        },
        HttpStatus.NOT_FOUND
      )
    }

    return
  }

  @Put(':commentId')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param() params: { commentId: string },
    @CurrentUserId() currentUserId: string,
    @Body() data: CommentDto
  ): Promise<null> {
    const commentId = params.commentId

    if (!commentId) {
      throw new HttpException(
        { message: appMessages(appMessages().commentId).errors.isRequiredField, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const existedComment = await this.CommentsRepository.getById(commentId)

    if (!existedComment) {
      throw new HttpException(
        { message: appMessages(appMessages().comment).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const existedUser = await this.usersRepository.getById(currentUserId)

    if (!existedUser) {
      throw new HttpException(
        { message: appMessages(appMessages().user).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    if (existedComment?.commentatorInfo.userId !== existedUser?.id) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.FORBIDDEN
      )
    }

    const updatedComment = await this.CommentsRepository.updateComment({
      id: commentId,
      content: data.content
    })

    if (!updatedComment) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.FORBIDDEN
      )
    }

    return null
  }

  @Delete(':commentId')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param() params: { commentId: string },
    @CurrentUserId() currentUserId: string,
  ): Promise<any> {
    const commentId = params.commentId

    if (!commentId) {
      throw new HttpException(
        { message: appMessages(appMessages().commentId).errors.isRequiredField, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const existedUser = await this.usersRepository.getById(currentUserId)

    if (!existedUser) {
      throw new HttpException(
        { message: appMessages(appMessages().user).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const existedComment = await this.CommentsRepository.getById(commentId)

    if (!existedComment) {
      throw new HttpException(
        { message: appMessages(appMessages().comment).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    if (existedComment?.commentatorInfo.userId !== existedUser?.id) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.FORBIDDEN
      )
    }

    return this.CommentsRepository.deleteComment(commentId)
  }
}
