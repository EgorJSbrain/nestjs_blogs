import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import add from 'date-fns/add'
import { v4 } from 'uuid'

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

  @Prop()
  passwordHash: string;

  @Prop()
  passwordSalt: string;

  @Prop()
  confirmationCode: string;

  @Prop()
  expirationDate: Date;

  @Prop()
  isConfirmed: boolean;

  async setDateOfCreatedAt() {
    this.createdAt = new Date().toISOString()
  }

  async setId() {
    this.id = Number(new Date()).toString()
  }

  async setExpirationDate() {
    this.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 10
    })
  }

  async setConfirmationCode() {
    this.confirmationCode = v4()
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
// export const AccountDataSchema = SchemaFactory.createForClass(AccountData);
// export const ConfirmDataSchema = SchemaFactory.createForClass(ConfirmData);

UserSchema.methods = {
  setDateOfCreatedAt: User.prototype.setDateOfCreatedAt,
  setId: User.prototype.setId,
  setExpirationDate: User.prototype.setExpirationDate,
  setConfirmationCode: User.prototype.setConfirmationCode
}

export type UserDocument = HydratedDocument<User>;
