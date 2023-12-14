import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LikeStatusEnum } from '../constants/likes';

@Schema()
export class Like {
  @Prop()
  id: string;

  @Prop()
  authorId: string;

  @Prop()
  sourceId: string;

  @Prop()
  status: LikeStatusEnum;

  @Prop()
  createdAt: string;

  @Prop()
  login: string;

  async setDateOfCreatedAt() {
    this.createdAt = new Date().toISOString()
  }

  async setId() {
    this.id = Number(new Date()).toString()
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.methods = {
  setDateOfCreatedAt: Like.prototype.setDateOfCreatedAt,
  setId: Like.prototype.setId
}

export type LikeDocument = HydratedDocument<Like>;
