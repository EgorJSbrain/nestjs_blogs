import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Post, PostDocument } from './posts.schema';
import { RequestParams, ResponseBody } from '../types/request';
import { UpdatePostDto } from '../dtos/posts/update-post.dto';
import { LikesRepository } from '../likes/likes.repository';
import { LENGTH_OF_NEWEST_LIKES_FOR_POST, LikeSourceTypeEnum } from '../constants/likes'
import { LikeStatusEnum } from '../constants/likes';
import { formatLikes } from '../utils/formatLikes';
import { ILike } from '../types/likes';
import { ICreatePostType, IPost } from '../types/posts';
import { SortDirectionsEnum } from '../constants/global';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { LikesSqlRepository } from 'src/likes/likes.repository.sql';

@Injectable()
export class PostsSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private likeSqlRepository: LikesSqlRepository
  ) {}

  async getAll(
    params: RequestParams,
    userId: string | null,
    blogId?: string
  ): Promise<ResponseBody<IPost> | []> {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirectionsEnum.desc,
        pageNumber = 1,
        pageSize = 10
      } = params

      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber

      const query = `
        SELECT p.*, b."name" AS "blogName"
          FROM public.posts p
            LEFT JOIN public.blogs b
              ON p."blogId" = b.id
          WHERE "blogId" = $1
          ORDER BY "${sortBy}" ${sortDirection.toLocaleUpperCase()}
          LIMIT $2 OFFSET $3
      `
      const posts = await this.dataSource.query(query, [
        blogId,
        pageSizeNumber,
        skip
      ])

      // const postsWithLikes = posts.map((post) => ({
      //   ...post,
      //   extendedLikesInfo: {
      //     dislikesCount: 0,
      //     likesCount: 0,
      //     myStatus: 'None',
      //     newestLikes: []
      //   }
      // }))

      const queryForCount = `
        SELECT count(*) AS count
          FROM public.posts
          WHERE "blogId" = $1
      `

      const countResult = await this.dataSource.query(queryForCount, [
        blogId,
      ])

      const count = countResult[0] ? Number(countResult[0].count) : 0
      const pagesCount = Math.ceil(count / pageSizeNumber)

      // let filter: FilterQuery<PostDocument> = {}
      // const sort: Record<string, SortOrder> = {}

      // if (blogId) {
      //   filter = { blogId }
      // }

      // if (sortBy && sortDirection) {
      //   sort[sortBy] = sortDirection === SortDirectionsEnum.asc ? 1 : -1
      // }

      // const pageSizeNumber = Number(pageSize)
      // const pageNumberNum = Number(pageNumber)
      // const skip = (pageNumberNum - 1) * pageSizeNumber
      // const count = await this.postsModel.countDocuments(filter)
      // const pagesCount = Math.ceil(count / pageSizeNumber)

      // const posts = await this.postsModel
      //   .find(filter, { _id: 0, __v: 0 })
      //   .skip(skip)
      //   .limit(pageSizeNumber)
      //   .sort(sort)
      //   .lean()

      const postsWithInfoAboutLikes = await Promise.all(
        posts.map(async (post) => {
          const likesCounts = await this.likeSqlRepository.getLikesCountsBySourceId(
            LikeSourceTypeEnum.posts,
            post.id
          )

          // TODO implemetn functionality for count newest likes
          const newestLikes = await this.likeSqlRepository.getSegmentOfLikesByParams(
            LikeSourceTypeEnum.posts,
            post.id,
            LENGTH_OF_NEWEST_LIKES_FOR_POST
          )

          let likesUserInfo

          if (userId) {
            likesUserInfo =
              await this.likeSqlRepository.getLikeBySourceIdAndAuthorId({
                sourceType: LikeSourceTypeEnum.posts,
                sourceId: post.id,
                authorId: userId
              })
          }

          return {
            ...post,
            extendedLikesInfo: {
              likesCount: likesCounts?.likesCount ?? 0,
              dislikesCount: likesCounts?.dislikesCount ?? 0,
              myStatus: likesUserInfo ? likesUserInfo.status : LikeStatusEnum.none,
              newestLikes: []
              // newestLikes: formatLikes(newestLikes)
            }
          }
        })
      )

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        // items: postsWithLikes
        items: postsWithInfoAboutLikes
      }
    } catch {
      return []
    }
  }

  async getById(id: string, blogId?: string, userId?: string): Promise<IPost | null> {
    const query = `
      SELECT p.*, b."name" AS "blogName"
      FROM public.posts p
        LEFT JOIN public.blogs b
          ON p."blogId" = b.id
      WHERE p.id = $1
    `
    const posts = await this.dataSource.query<IPost[]>(query, [id])

    if (!posts[0]) {
      return null
    }

    return posts[0]
    // const post = await this.postsModel.findOne({ id }, { _id: 0, __v: 0 })
    // let myLike: ILike | null = null

    // if (!post) {
    //   return null
    // }

    // const likesCounts = await this.likeRepository.getLikesCountsBySourceId(post.id)
    // const newestLikes = await this.likeRepository.getSegmentOfLikesByParams(post.id, LENGTH_OF_NEWEST_LIKES_FOR_POST)

    // if (userId) {
    //   myLike = await this.likeRepository.getLikeBySourceIdAndAuthorId({
    //     sourceId: post.id,
    //     authorId: userId
    //   })
    // }

    //   return {
    //     id: post.id,
    //     title: post.title,
    //     shortDescription: post.shortDescription,
    //     content: post.content,
    //     blogId: post.blogId,
    //     blogName: post.blogName,
    //     createdAt: post.createdAt,
    //     extendedLikesInfo: {
    //       likesCount: likesCounts?.likesCount ?? 0,
    //       dislikesCount: likesCounts?.dislikesCount ?? 0,
    //       myStatus: myLike?.status ?? LikeStatusEnum.none,
    //       newestLikes: formatLikes(newestLikes)
    //     }
    //   }
  }

  async createPost(data: ICreatePostType): Promise<IPost | null> {
    const query = `
      INSERT INTO public.posts(
        "blogId", title, "shortDescription", content
      )
        VALUES ($1, $2, $3, $4)
        RETURNING id, "blogId", title, "shortDescription", content, "createdAt"
    `

    const posts = await this.dataSource.query(query, [
      data.blogId,
      data.title,
      data.shortDescription,
      data.content
    ])

    return posts[0]
  }

  async updatePost(id: string, data: UpdatePostDto): Promise<any> {
    const post = await this.getById(id)

    if (!post) {
      return false
    }

    const title = data.title ?? post.title
    const content = data.content ?? post.content
    const shortDescription = data.shortDescription ?? post.shortDescription

    const query = `
      UPDATE public.posts
        SET "title"=$2, "content"=$3, "shortDescription"=$4
        WHERE id = $1;
    `

    await this.dataSource.query<IPost[]>(query, [
      id,
      title,
      content,
      shortDescription
    ])

    return true
  }

  deletePost(id: string) {
    const query = `
      DELETE FROM public.posts
      WHERE id = $1
    `
    return this.dataSource.query(query, [id])
  }
}
