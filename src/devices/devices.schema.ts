import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import add from 'date-fns/add';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Device {
  @Prop()
  ip: string;

  @Prop()
  deviceId: string;

  @Prop()
  title: string;

  @Prop()
  userId: string;

  @Prop()
  lastActiveDate: string;

  @Prop()
  expiredDate: string;

  async setLastActiveDate() {
    this.lastActiveDate = new Date().toISOString()
  }

  async setExpiredDate() {
    this.expiredDate = add(new Date(), {
      seconds: 20
    }).toISOString()
  }

  async setDeviceId() {
    this.deviceId = Number(new Date()).toString()
  }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.methods = {
  setLastActiveDate: Device.prototype.setLastActiveDate,
  setDeviceId: Device.prototype.setDeviceId,
  setExpiredDate: Device.prototype.setExpiredDate,
}

export type DeviceDocument = HydratedDocument<Device>;
