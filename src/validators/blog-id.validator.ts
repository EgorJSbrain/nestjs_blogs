import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs/blogs.repository';
import { appMessages } from '../constants/messages';

@Injectable()
@ValidatorConstraint({ name: 'blog-id', async: false })
export class BlogIdValidator implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async validate(value: string): Promise<boolean> {
    const blog = await this.blogsRepository.getById(value);

    if (blog) {
      return true
    }

    return false;
  }

  defaultMessage(): string {
    return appMessages(appMessages().blog).errors.notFound;
  }
}