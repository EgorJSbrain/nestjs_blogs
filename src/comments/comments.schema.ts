import { Prop, Schema as NextSchema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Schema } from 'mongoose';
import { ILikeInfo } from '../types/likes';
import { CommentUserInfo } from 'src/types/comments';

@NextSchema()
export class AuthorInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;
}

@NextSchema()
export class Comment {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  authorInfo: AuthorInfo;

  @Prop()
  createdAt: string;

  @Prop()
  sourceId: string;

  async setDateOfCreatedAt() {
    this.createdAt = new Date().toISOString()
  }

  async setId() {
    this.id = Number(new Date()).toString()
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  setDateOfCreatedAt: Comment.prototype.setDateOfCreatedAt,
  setId: Comment.prototype.setId
}

export type CommentDocument = HydratedDocument<Comment>;
