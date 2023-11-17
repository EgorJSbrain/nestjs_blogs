import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Post {
  @Prop()
  id: string;

  @Prop()
  title: string;

  @Prop()
  shortDescription: string;

  @Prop()
  content: string;

  @Prop()
  blogId: string;


  @Prop()
  blogName: string;

  @Prop()
  createdAt: string;

  @Prop()
  websiteUrl: string;

  @Prop({ default: true })
  isMembership: boolean;

  // TO DO add extendedLikesInfo

  async setDateOfCreatedAt() {
    this.createdAt = new Date().toISOString()
  }

  async setId() {
    this.id = Number(new Date()).toString()
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
  setDateOfCreatedAt: Post.prototype.setDateOfCreatedAt,
  setId: Post.prototype.setId
}

export type PostDocument = HydratedDocument<Post>;
