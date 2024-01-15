import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class GeneralSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async clearDB() {
    const queryUsers = `DELETE FROM public.users`
    const queryDevices = `DELETE FROM public.devices`
    const queryPosts = `DELETE FROM public.posts`
    const queryPostsLikes = `DELETE FROM public.posts_likes`
    const queryComments = `DELETE FROM public.comments`
    const queryBlogs = `DELETE FROM public.blogs`
    await this.dataSource.query(queryComments)
    await this.dataSource.query(queryPostsLikes)
    await this.dataSource.query(queryDevices)
    await this.dataSource.query(queryUsers)
    await this.dataSource.query(queryPosts)
    await this.dataSource.query(queryBlogs)
    return true
  }
}
