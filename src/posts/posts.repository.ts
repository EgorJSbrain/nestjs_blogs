import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { RequestParams, ResponseBody } from '../types/request';
import { UpdatePostDto } from '../dtos/posts/update-post.dto';
import { LENGTH_OF_NEWEST_LIKES_FOR_POST, LikeSourceTypeEnum } from '../constants/likes'
import { LikeStatusEnum } from '../constants/likes';
import { formatLikes } from '../utils/formatLikes';
import { IExtendedLike } from '../types/likes';
import { ICreatePostType, IPost, IExtendedPost } from '../types/posts';
import { SortDirections, SortDirectionsEnum, SortType } from '../constants/global';
import { LikesSqlRepository } from '../likes/likes.repository.sql';
import { PostEntity } from '../entities/post';
import { BlogEntity } from '../entities/blog';

const writeSql = async (sql: string) => {
  const fs = require('fs/promises')
  try {
    await fs.writeFile('sql.txt', sql)
  } catch (err) {
    console.log(err)
  }
}

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private likeSqlRepository: LikesSqlRepository,

    @InjectRepository(PostEntity)
    private readonly postsRepo: Repository<PostEntity>
  ) {}

  async getAll(
    params: RequestParams,
    userId: string | null,
    blogId?: string
  ): Promise<ResponseBody<IExtendedPost> | []> {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirections.desc,
        pageNumber = 1,
        pageSize = 10
      } = params

      let whereFilter = ''
      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber

      if (blogId) {
        whereFilter = 'post.blogId = :blogId'
      }

      const query = this.postsRepo.createQueryBuilder('post')

      const searchObject = query
        .where(whereFilter, {
          blogId: blogId ? blogId : undefined
        })
        .leftJoinAndSelect('post.blog', 'blog')
        .select([
          'post.id',
          'post.title',
          'post.shortDescription',
          'post.content',
          'post.createdAt',
          'post.blogId',
        ])
        .addOrderBy(
          `post.${sortBy}`,
          sortDirection?.toLocaleUpperCase() as SortType
        )
        .skip(skip)
        .take(pageSizeNumber)

      const postsResponse = await searchObject.getMany()

      const posts = postsResponse.map((post) => ({
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        createdAt: post.createdAt,
        blogId: post.blogId,
        blogName: post.blog.name
      }))

      const count = await searchObject.getCount()
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const postsWithInfoAboutLikes = await Promise.all(
        posts.map(async (post) => {
          // const likesCounts = await this.likeSqlRepository.getLikesCountsBySourceId(
          //   LikeSourceTypeEnum.posts,
          //   post.id
          // )

          // const newestLikes = await this.likeSqlRepository.getSegmentOfLikesByParams(
          //   LikeSourceTypeEnum.posts,
          //   post.id,
          //   LENGTH_OF_NEWEST_LIKES_FOR_POST
          // )

          // let likesUserInfo

          // if (userId) {
          //   likesUserInfo =
          //     await this.likeSqlRepository.getLikeBySourceIdAndAuthorId({
          //       sourceType: LikeSourceTypeEnum.posts,
          //       sourceId: post.id,
          //       authorId: userId
          //     })
          // }

          return {
            ...post,
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: LikeStatusEnum.none,
              newestLikes: []
            }
          }
          // return {
          //   ...post,
          //   extendedLikesInfo: {
          //     likesCount: likesCounts?.likesCount ?? 0,
          //     dislikesCount: likesCounts?.dislikesCount ?? 0,
          //     myStatus: likesUserInfo ? likesUserInfo.status : LikeStatusEnum.none,
          //     newestLikes: formatLikes(newestLikes)
          //   }
          // }
        })
      )
      console.log("------postsWithInfoAboutLikes:", postsWithInfoAboutLikes)

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: postsWithInfoAboutLikes
        // items: []
      }
    } catch {
      return []
    }
  }

  async getById(id: string, userId?: string): Promise<IExtendedPost | null> {
    const query = this.postsRepo.createQueryBuilder('post')

    const post = await query
      .select([
        'post.id',
        'post.blogId',
        'post.title',
        'post.shortDescription',
        'post.content',
        'post.createdAt'
      ])
      .leftJoinAndSelect('post.blog', 'blog')
      .where('post.id = :id', { id })
      .getOne()

    if (!post) {
      return null
    }

    return {
      id: post.id,
      blogId: post.blogId,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      createdAt: post.createdAt,
      blogName: post.blog.name
    }
  }

  async getByIdWithLikes(
    id: string,
    userId?: string
  ): Promise<IExtendedPost | null> {
    // let myLike: IExtendedLike | null = null

    const query = this.postsRepo.createQueryBuilder('post')

    const post = await query
      .select([
        'post.id',
        'post.blogId',
        'post.title',
        'post.shortDescription',
        'post.content',
        'post.createdAt'
      ])
      .leftJoinAndSelect('post.blog', 'blog')
      .where('post.id = :id', { id })
      .getOne()

    if (!post) {
      return null
    }

    // const likesCounts = await this.likeSqlRepository.getLikesCountsBySourceId(
    //   LikeSourceTypeEnum.posts,
    //   post.id
    // )

    // const newestLikes = await this.likeSqlRepository.getSegmentOfLikesByParams(
    //   LikeSourceTypeEnum.posts,
    //   post.id,
    //   LENGTH_OF_NEWEST_LIKES_FOR_POST
    // )

    // if (userId) {
    //   myLike = await this.likeSqlRepository.getLikeBySourceIdAndAuthorId({
    //     sourceType: LikeSourceTypeEnum.posts,
    //     sourceId: post.id,
    //     authorId: userId
    //   })
    // }

    return {
      id: post.id,
      blogId: post.blogId,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      createdAt: post.createdAt,
      blogName: post.blog.name,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.none,
        newestLikes: []
        // likesCount: likesCounts?.likesCount ?? 0,
        // dislikesCount: likesCounts?.dislikesCount ?? 0,
        // myStatus: myLike?.status ?? LikeStatusEnum.none,
        // newestLikes: formatLikes(newestLikes)
      }
    }
  }

  async createPost(data: ICreatePostType): Promise<IExtendedPost | null> {
    try {
      const query = this.postsRepo.createQueryBuilder('post')

      const newPost = await query
        .insert()
        .values({
          blogId: data.blogId,
          title: data.title,
          shortDescription: data.shortDescription,
          content: data.content
        })
        .execute()

      const post = await this.getById(newPost.raw[0].id)

      if (!post) {
        return null
      }

      return post
    } catch {
      return null
    }
  }

  async updatePost(id: string, data: UpdatePostDto): Promise<boolean> {
    const updatedBlog = await this.postsRepo
      .createQueryBuilder('post')
      .update()
      .set({
        title: data.title,
        content: data.content,
        shortDescription: data.shortDescription
      })
      .where('id = :id', {
        id
      })
      .execute()

    if (!updatedBlog.affected) {
      return false
    }

    return true
  }

  async deletePost(id: string) {
    try {
      const post = await this.postsRepo
        .createQueryBuilder('post')
        .delete()
        .where('id = :id', { id })
        .execute()

      return !!post.affected
    } catch (e) {
      return false
    }
  }
}
