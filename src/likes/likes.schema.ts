import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// id: { type: String, required: true },
// authorId: { type: String, required: true },
// sourceId: { type: String, required: true },
// status: { type: String, enum: LikeStatus, required: true },
// createdAt: { type: String, required: true },
// login: { type: String, required: true }

@Schema()
export class Like {
  @Prop()
  id: string;

  @Prop()
  authorId: string;

  @Prop()
  sourceId: string;

  @Prop()
  status: string;

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
