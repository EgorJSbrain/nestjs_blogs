import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class User {
  @Prop()
  id: string;

  @Prop()
  login: string;

  @Prop()
  email: string;

  @Prop()
  createdAt: string;

  async setDateOfCreatedAt() {
    this.createdAt = new Date().toISOString()
  }

  async setId() {
    this.id = Number(new Date()).toString()
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
  setDateOfCreatedAt: User.prototype.setDateOfCreatedAt,
  setId: User.prototype.setId
}

export type UserDocument = HydratedDocument<User>;
