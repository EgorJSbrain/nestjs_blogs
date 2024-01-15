import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { appMessages } from '../constants/messages';
import { BlogsSqlRepository } from '../blogs/blogs.repository.sql';

@Injectable()
@ValidatorConstraint({ name: 'blog-id', async: false })
export class BlogIdValidator implements ValidatorConstraintInterface {
  constructor(private readonly blogsSQLRepository: BlogsSqlRepository) {}

  async validate(value: string): Promise<boolean> {
    const blog = await this.blogsSQLRepository.getById(value);

    if (blog) {
      return true
    }

    return false;
  }

  defaultMessage(): string {
    return appMessages(appMessages().blog).errors.notFound;
  }
}