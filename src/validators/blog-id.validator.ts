import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { appMessages } from '../constants/messages';
import { BlogsRepository } from '../blogs/blogs.repository';

@Injectable()
@ValidatorConstraint({ name: 'blog-id', async: false })
export class BlogIdValidator implements ValidatorConstraintInterface {
  constructor(private readonly BlogsRepository: BlogsRepository) {}

  async validate(value: string): Promise<boolean> {
    const blog = await this.BlogsRepository.getById(value);

    if (blog) {
      return true
    }

    return false;
  }

  defaultMessage(): string {
    return appMessages(appMessages().blog).errors.notFound;
  }
}