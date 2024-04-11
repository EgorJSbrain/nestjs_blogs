import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { RequestParams, ResponseBody } from '../types/request';
import { UpdatePostDto } from '../dtos/posts/update-post.dto';
import {
  LENGTH_OF_NEWEST_LIKES_FOR_POST,
  LikeSourceTypeEnum,
  LikeStatusEnum
} from '../constants/likes'
import { ICreatePostType, IExtendedPost } from '../types/posts';
import { SortDirections, SortType } from '../constants/global';
import { LikesRepository } from '../likes/likes.repository';
import { PostEntity } from '../entities/post';
import { BlogEntity } from '../entities/blog';
import { PostLikeEntity } from '../entities/post-like';
import { formatLikes } from '../utils/formatLikes';
import { appMessages } from '../constants/messages';
import { FileEntity } from 'src/entities/files';
import { prepareFile } from 'src/utils/prepareFile';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly likeRepository: LikesRepository,

    @InjectRepository(PostEntity)
    private readonly postsRepo: Repository<PostEntity>,

    @InjectRepository(PostLikeEntity)
    private readonly postLikesRepo: Repository<PostLikeEntity>
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

      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber
      let filter = ''

      if (blogId) {
        filter = 'post.blogId = :blogId'
      }

      const query = this.dataSource
        .createQueryBuilder()
        .select('post.*')
        .where(filter, {
          blogId: blogId ? blogId : undefined
        })
        .addSelect((subQuery) => {
          return subQuery
            .select('blog.name', 'blogname')
            .from(BlogEntity, 'blog')
            .where('post.blogId = blog.id')
        }, 'blogname')
        .from(PostEntity, 'post')
        .addSelect((subQuery) => {
          return subQuery
            .select('count(*)', 'likesCount')
            .from(PostLikeEntity, 'l')
            .where("l.sourceId = post.id AND l.status = 'Like'", {
              userId: userId
            })
        }, 'likesCount')
        .addSelect((subQuery) => {
          return subQuery
            .select('count(*)', 'dislikesCount')
            .from(PostLikeEntity, 'l')
            .where("l.sourceId = post.id AND l.status = 'Dislike'", {
              userId: userId
            })
        }, 'dislikesCount')
        .addSelect((subQuery) => {
          return subQuery
            .select('l.status', 'myStatus')
            .from(PostLikeEntity, 'l')
            .where('l.sourceId = post.id AND l.authorId = :userId', {
              userId: userId
            })
        }, 'myStatus')
        .addSelect((subQuery) => {
          return subQuery
            .select('json_agg(files)', 'main')
            .from(FileEntity, 'files')
            .where("files.postId = post.id AND files.type = 'main'")
        }, 'main')
        .addOrderBy(
          sortBy === 'blogName' ? 'blogname' : `post.${sortBy}`,
          sortDirection?.toLocaleUpperCase() as SortType
        )
        .skip(skip)
        .take(pageSizeNumber)

      const postsResponse = await query.getRawMany()

      const posts = postsResponse.map((post) => ({
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        createdAt: post.createdAt,
        blogId: post.blogId,
        blogName: post.blogname,
        extendedLikesInfo: {
          likesCount: Number(post.likesCount ?? 0),
          dislikesCount: Number(post.dislikesCount ?? 0),
          myStatus: post.myStatus ? post.myStatus : LikeStatusEnum.none
        },
        images: {
          main: post.main ? post.main.map(main => prepareFile(main)) : []
        }
      }))

      const count = await query.getCount()
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const likeQuery = this.postLikesRepo.createQueryBuilder(
        LikeSourceTypeEnum.posts
      )

      const postsWithInfoAboutLikes = await Promise.all(
        posts.map(async (post) => {
          const newestLikes =
            await this.likeRepository.getSegmentOfLikesByParams(
              PostLikeEntity,
              post.id,
              LENGTH_OF_NEWEST_LIKES_FOR_POST,
              likeQuery
            )

          return {
            ...post,
            extendedLikesInfo: {
              ...post.extendedLikesInfo,
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

  async getById(id: string): Promise<IExtendedPost | null> {
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
    userId?: string | null
  ): Promise<IExtendedPost | null> {
    try {
      let filter = ''

      if (userId) {
        filter = 'l.sourceId = post.id AND l.authorId = :userId'
      }

      const post = await this.dataSource
        .createQueryBuilder()
        .select('post.*')
        .where('post.id = :id', { id })
        .addSelect((subQuery) => {
          return subQuery
            .select('blog.name', 'blogname')
            .from(BlogEntity, 'blog')
            .where('post.blogId = blog.id')
        }, 'blogname')
        .from(PostEntity, 'post')
        .addSelect((subQuery) => {
          return subQuery
            .select('count(*)', 'likesCount')
            .from(PostLikeEntity, 'l')
            .leftJoin('l.user', 'user')
            .where("l.sourceId = post.id AND l.status = 'Like'")
            .andWhere('user.isBanned = NOT(true)')
        }, 'likesCount')
        .addSelect((subQuery) => {
          return subQuery
            .select('count(*)', 'dislikesCount')
            .from(PostLikeEntity, 'l')
            .leftJoin('l.user', 'user')
            .where("l.sourceId = post.id AND l.status = 'Dislike'")
            .andWhere('user.isBanned = NOT(true)')
        }, 'dislikesCount')
        .addSelect((subQuery) => {
          return subQuery
            .select('l.status', 'myStatus')
            .from(PostLikeEntity, 'l')
            .where('l.sourceId = post.id AND l.authorId = :userId', {
              userId
            })
        }, 'myStatus')
        .addSelect((subQuery) => {
          return subQuery
            .select('json_agg(files)', 'main')
            .from(FileEntity, 'files')
            .where("files.postId = post.id AND files.type = 'main'")
        }, 'main')
        .getRawOne()

    const likeQuery = this.postLikesRepo.createQueryBuilder(
      LikeSourceTypeEnum.posts
    )

    const newestLikes = await this.likeRepository.getSegmentOfLikesByParams(
      PostLikeEntity,
      id,
      LENGTH_OF_NEWEST_LIKES_FOR_POST,
      likeQuery
    )

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
      blogName: post.blogname,
      extendedLikesInfo: {
        likesCount: Number(post.likesCount),
        dislikesCount: Number(post.dislikesCount),
        myStatus: post.myStatus ? post.myStatus : LikeStatusEnum.none,
        newestLikes: formatLikes(newestLikes) || []
      },
      images: {
        main: post.main ? post.main.map(main => prepareFile(main)) : []
      }
    }
    } catch(e) {
      throw new Error(e.message)
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
    const updatedPost = await this.postsRepo
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

    if (!updatedPost.affected) {
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
      throw new Error(appMessages().errors.somethingIsWrong)
    }
  }

  async likePost(
    likeStatus: LikeStatusEnum,
    sourceId: string,
    authorId: string
  ) {
    try {
      const query = this.postLikesRepo.createQueryBuilder(
        LikeSourceTypeEnum.posts
      )

      const like = await this.likeRepository.likeEntity(
        likeStatus,
        sourceId,
        LikeSourceTypeEnum.posts,
        authorId,
        query
      )

      return like
    } catch (e) {
      return false
    }
  }
}
