import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class GeneralSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async clearDB() {
    const query = `DELETE FROM public.users`
    const queryDevices = `DELETE FROM public.devices`
    const queryBlogs = `DELETE FROM public.blogs`
    await this.dataSource.query(queryDevices)
    await this.dataSource.query(query)
    await this.dataSource.query(queryBlogs)
    return true
  }
}
