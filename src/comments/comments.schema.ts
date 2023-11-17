import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class commentatorInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;
}

@Schema()
export class Comment {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  commentatorInfo: string;

  @Prop()
  createdAt: string;

  // TODO likes info type
  // @Prop()
  // likesInfo: any

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
