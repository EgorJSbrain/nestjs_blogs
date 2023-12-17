import { Prop, Schema as NextSchema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

  @Prop(({ type: AuthorInfo }))
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
