import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Blog {
  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  createdAt: string;

  @Prop()
  websiteUrl: string;

  @Prop({ default: false })
  isMembership: boolean;

  async setDateOfCreatedAt() {
    this.createdAt = new Date().toISOString()
  }

  async setId() {
    this.id = Number(new Date()).toString()
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  setDateOfCreatedAt: Blog.prototype.setDateOfCreatedAt,
  setId: Blog.prototype.setId
}

export type BlogDocument = HydratedDocument<Blog>;
