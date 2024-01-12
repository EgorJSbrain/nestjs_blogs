import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { BlogDocument } from './blogs.schema';
import { CreateBlogDto } from '../dtos/blogs/create-blog.dto';
import { ResponseBody } from '../types/request';
import { BlogsRequestParams } from '../types/blogs';
import { IBlog } from '../types/blogs';
import { UpdateBlogDto } from '../dtos/blogs/update-blog.dto';
import { SortDirectionsEnum } from '../constants/global';

@Injectable()
export class BlogsSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {}

  async getAll(
    params: BlogsRequestParams
  ): Promise<ResponseBody<IBlog> | []> {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirectionsEnum.desc,
        pageNumber = 1,
        pageSize = 10,
        searchNameTerm = ''
      } = params

      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber

      const query = `
        SELECT id, name, description, "createdAt", "websiteUrl", "isMembership"
          FROM public.blogs
          WHERE "name" ILIKE $1
          ORDER BY "${sortBy}" ${sortDirection.toLocaleUpperCase()}
          LIMIT $2 OFFSET $3
      `
      const blogs = await this.dataSource.query(query, [
        `%${searchNameTerm}%`,
        pageSizeNumber,
        skip
      ])

      const queryForCount = `
        SELECT count(*) AS count FROM public.blogs
          WHERE "name" ILIKE $1
      `
      const countResult = await this.dataSource.query(queryForCount, [
        `%${searchNameTerm}%`
      ])

      const count = countResult[0] ? Number(countResult[0].count) : 0
      const pagesCount = Math.ceil(count / pageSizeNumber)

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: blogs
      }
    } catch {
      return []
    }
  }

  async getById(id: string): Promise<IBlog | null> {
    const query = `
      SELECT id, name, description, "createdAt", "websiteUrl", "isMembership"
      FROM public.blogs
      WHERE id = $1
    `
    const blogs = await this.dataSource.query<IBlog[]>(query, [id])

    if (!blogs[0]) {
      return null
    }

    return blogs[0]
  }

  async createBlog(data: CreateBlogDto): Promise<IBlog | null> {
    const query = `
      INSERT INTO public.blogs(
        "name", "description", "websiteUrl"
      )
        VALUES ($1, $2, $3)
        RETURNING id, name, description, "createdAt", "websiteUrl", "isMembership"
    `

    const blogs = await this.dataSource.query(query, [
      data.name,
      data.description,
      data.websiteUrl
    ])

    return blogs[0]
  }

  async updateBlog(id: string, data: UpdateBlogDto): Promise<boolean> {
    const blog = await this.getById(id)

    if (!blog) {
      return false
    }

    const name = data.name ?? blog.name
    const description = data.description ?? blog.description
    const websiteUrl = data.websiteUrl ?? blog.websiteUrl

    const query = `
      UPDATE public.blogs
        SET "name"=$2, "description"=$3, "websiteUrl"=$4
        WHERE id = $1;
    `

    await this.dataSource.query<IBlog[]>(query, [
      id,
      name,
      description,
      websiteUrl
    ])

    return true
  }

  async deleteBlog(id: string) {
    const query = `
      DELETE FROM public.blogs
      WHERE id = $1
    `
    return this.dataSource.query(query, [id])
  }

  save(blog: BlogDocument) {
    return blog.save()
  }
}
