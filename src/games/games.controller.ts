import { SkipThrottle } from '@nestjs/throttler'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  HttpCode,
  UseGuards,
  Req
} from '@nestjs/common'
import { Request } from 'express'

import { CreatePostByBlogIdDto, CreatePostDto } from '../dtos/posts/create-post.dto'
import { ResponseBody, RequestParams } from '../types/request'
import { UpdatePostDto } from '../dtos/posts/update-post.dto'
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUserId } from '../auth/current-user-id.param.decorator'
import { appMessages } from '../constants/messages'
import { JWTService } from '../jwt/jwt.service'
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard'
import { LikeDto } from '../dtos/like/like.dto'
import { IExtendedPost } from '../types/posts'
import { RoutesEnum } from '../constants/global'
import { CommentDto } from '../dtos/comments/create-comment.dto'
import { IExtendedComment } from '../types/comments'
import { GamesRepository } from './games.repository'
import { UsersRepository } from '../users/users.repository'
import { CommentsRepository } from '../comments/comments.repository'
import { GameEntity } from 'src/entities/game'

@SkipThrottle()
@Controller(RoutesEnum.pairGameQuizPairs)
export class GamesController {
  constructor(
    private usersRepository: UsersRepository,
    private gamesRepository: GamesRepository,
    private JWTService: JWTService,
  ) {}

  @Get('/my-current')
  async getAll(
    @Query() query: RequestParams,
    @Req() req: Request
  ): Promise<ResponseBody<any> | []> {
    // let currentUserId: string | null = null

    // if (req.headers.authorization) {
    //   const token = req.headers.authorization.split(' ')[1]
    //   const { userId } = this.JWTService.verifyAccessToken(token)
    //   currentUserId = userId || null
    // }

    // const posts = await this.postsRepository.getAll(query, currentUserId)

    // return posts
    return []
  }

  @Get(':id')
  async getGameById(
    @Param() params: { id: string }
  ): Promise<ResponseBody<any> | []> {
    // let currentUserId: string | null = null

    // if (req.headers.authorization) {
    //   const token = req.headers.authorization.split(' ')[1]
    //   const { userId } = this.JWTService.verifyAccessToken(token)
    //   currentUserId = userId || null
    // }

    // const posts = await this.postsRepository.getAll(query, currentUserId)

    // return posts
    return []
  }

  @Post('connection')
  @UseGuards(JWTAuthGuard)
  async connectToGame(
    @CurrentUserId() currentUserId: string,
  ): Promise<any> {
    const aciveGame = await this.gamesRepository.getActiveGameOfUser(currentUserId)

    if (aciveGame) {
      return aciveGame
    }

    const existedGame = await this.gamesRepository.getGameInPendingSecondPalyer(currentUserId)

    if (!existedGame) {
      return await this.gamesRepository.createGame(currentUserId)
    }

    return await this.gamesRepository.connectToGame(currentUserId, existedGame)
  }
}
