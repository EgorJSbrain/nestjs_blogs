import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { RequestParams, ResponseBody } from '../types/request';
import { UpdatePostDto } from '../dtos/posts/update-post.dto';
import { LENGTH_OF_NEWEST_LIKES_FOR_POST, LikeSourceTypeEnum } from '../constants/likes'
import { LikeStatusEnum } from '../constants/likes';
import { formatLikes } from '../utils/formatLikes';
import { ILike } from '../types/likes';
import { ICreatePostType, ICreatedPost, IPost } from '../types/posts';
import { SortDirectionsEnum } from '../constants/global';
import { LikesSqlRepository } from '../likes/likes.repository.sql';

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

      let query = `
        SELECT p.*, b."name" AS "blogName"
          FROM public.posts p
            LEFT JOIN public.blogs b
              ON p."blogId" = b.id
          ORDER BY "${sortBy}" ${sortDirection.toLocaleUpperCase()}
          LIMIT $1 OFFSET $2
      `

      let queryForCount = `
        SELECT count(*) AS count
          FROM public.posts
      `

      let queryParams: any[] = [ pageSizeNumber, skip ]
      let queryCountParams: any[] = []

      if (blogId) {
        query = `
          SELECT p.*, b."name" AS "blogName"
            FROM public.posts p
              LEFT JOIN public.blogs b
                ON p."blogId" = b.id
            WHERE "blogId" = $1
            ORDER BY "${sortBy}" ${sortDirection.toLocaleUpperCase()}
            LIMIT $2 OFFSET $3
        `

        queryParams = [ blogId, pageSizeNumber, skip ]
        queryCountParams = [ blogId ]

        queryForCount = `
          SELECT count(*) AS count
            FROM public.posts
            WHERE "blogId" = $1
        `
      }

      const posts = await this.dataSource.query(query, queryParams)

      const countResult = await this.dataSource.query(queryForCount, queryCountParams)

      const count = countResult[0] ? Number(countResult[0].count) : 0
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const postsWithInfoAboutLikes = await Promise.all(
        posts.map(async (post) => {
          const likesCounts = await this.likeSqlRepository.getLikesCountsBySourceId(
            LikeSourceTypeEnum.posts,
            post.id
          )

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
              newestLikes: formatLikes(newestLikes)
            }
          }
        })
      )

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: postsWithInfoAboutLikes
      }
    } catch {
      return []
    }
  }

  async getById(id: string, userId?: string): Promise<IPost | null> {
    let myLike: ILike | null = null

    const query = `
      SELECT p.*, b."name" AS "blogName"
        FROM public.posts p
          LEFT JOIN public.blogs b
            ON p."blogId" = b.id
        WHERE p.id = $1
    `
    const posts = await this.dataSource.query<IPost[]>(query, [id])

    const post = posts[0]

    if (!post) {
      return null
    }

    const likesCounts = await this.likeSqlRepository.getLikesCountsBySourceId(
      LikeSourceTypeEnum.posts,
      post.id
    )

    const newestLikes = await this.likeSqlRepository.getSegmentOfLikesByParams(
      LikeSourceTypeEnum.posts,
      post.id,
      LENGTH_OF_NEWEST_LIKES_FOR_POST
    )

    if (userId) {
      myLike = await this.likeSqlRepository.getLikeBySourceIdAndAuthorId({
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
        myStatus: myLike?.status ?? LikeStatusEnum.none,
        newestLikes: formatLikes(newestLikes)
      }
    }
    // const post = await this.postsModel.findOne({ id }, { _id: 0, __v: 0 })

    // if (!post) {
    //   return null
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

  async createPost(data: ICreatePostType): Promise<ICreatedPost | null> {
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
