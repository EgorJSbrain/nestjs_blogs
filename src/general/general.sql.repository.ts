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
    await this.dataSource.query(query)
    return true
  }
}
