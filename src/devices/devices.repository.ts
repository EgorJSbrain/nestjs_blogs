import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Device, DeviceDocument } from './devices.schema';
import { IDevice } from '../types/devices';
import { CreateDeviceDto } from '../dtos/devices/create-device.dto';
import add from 'date-fns/add';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private devicesModel: Model<DeviceDocument>
  ) {}

  async getAllDevicesByUserId(
    userId: string | null,
  ): Promise<any> {
    try {
      const devices = await this.devicesModel
        .find({ userId }, { _id: 0, __v: 0, expiredDate: 0, userId: 0 })
        .exec()

      return devices
    } catch {
      return []
    }
  }

  async getDeviceByDate(lastActiveDate: string): Promise<IDevice | null> {
    try {
      const device = await this.devicesModel.findOne(
        { lastActiveDate },
        { _id: 0 }
      )

      return device
    } catch {
      return null
    }
  }

  async getDeviceByDeviceId(deviceId: string): Promise<IDevice | null> {
    try {
      const device = await this.devicesModel.findOne({ deviceId }, { _id: 0, __v: 0 })

      return device
    } catch {
      return null
    }
  }

  async createDevice(device: CreateDeviceDto): Promise<IDevice | null> {
    try {
      const newDevice = new this.devicesModel(device)

      newDevice.setDeviceId()
      newDevice.setExpiredDate()
      newDevice.setLastActiveDate()

      const createdDevice = await newDevice.save()

      return {
        userId: createdDevice.userId,
        lastActiveDate: createdDevice.lastActiveDate,
        deviceId: createdDevice.deviceId,
        title: createdDevice.title,
        ip: createdDevice.ip,
        expiredDate: createdDevice.expiredDate
      }
    } catch {
      return null
    }
  }

  async updateDevice(
    currentLastActiveDate: string,
  ): Promise<IDevice | null> {
    try {
      const device = await this.devicesModel.findOne(
        { lastActiveDate: currentLastActiveDate }
      )

      if (!currentLastActiveDate) {
        return null
      }

      device?.setExpiredDate()
      device?.setLastActiveDate()

      device?.save()

      return device
    } catch {
      return null
    }
  }

  async deleteDevices(
    userId: string,
    lastActiveDate: string
  ): Promise<boolean> {
    try {
      const response = await this.devicesModel.deleteMany({
        userId,
        $nor: [{ lastActiveDate }]
      })

      return !!response.deletedCount
    } catch {
      return false
    }
  }

  async deleteDevice(deviceId: string): Promise<boolean> {
    try {
      return !!(await this.devicesModel.deleteOne({ deviceId })).deletedCount
    } catch {
      return false
    }
  }

  save(device: DeviceDocument) {
    return device.save()
  }
}
