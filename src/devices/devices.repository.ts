import { DataSource, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import add from 'date-fns/add'

import { IDevice } from '../types/devices'
import { CreateDeviceDto } from '../dtos/devices/create-device.dto'
import { DeviceEntity } from '../entities/devices'

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(DeviceEntity)
    private readonly devicesRepo: Repository<DeviceEntity>
  ) {}

  async getAllDevicesByUserId(userId: string | null): Promise<DeviceEntity[] | null> {
    try {
      const devices = await this.devicesRepo
        .createQueryBuilder('device')
        .select(["device.deviceId", "device.ip", "device.title", "device.lastActiveDate"])
        .where('device.userId = :userId', { userId })
        .getMany()

      if (!devices.length) {
        return null
      }

      return devices
    } catch(e) {
      return []
    }
  }

  async getDeviceByDate(lastActiveDate: string): Promise<IDevice | null> {
    try {
      const device = await this.devicesRepo
        .createQueryBuilder('device')
        .where('device.lastActiveDate = :lastActiveDate', { lastActiveDate })
        .getOne()

      if (!device) {
        return null
      }

      return device
    } catch {
      return null
    }
  }

  async getDeviceByDeviceId(deviceId: string): Promise<IDevice | null> {
    try {
      const device = await this.devicesRepo
        .createQueryBuilder('device')
        .where('device.deviceId = :deviceId', { deviceId })
        .getOne()

      if (!device) {
        return null
      }

      return device
    } catch(e) {
      return null
    }
  }

  async createDevice(device: CreateDeviceDto): Promise<IDevice | null> {
    try {
      const date = new Date()
      const lastActiveDate = date.toISOString()

      const expiredDate = add(date, {
        seconds: 20
      }).toISOString()

      await this.devicesRepo
        .createQueryBuilder('device')
        .insert()
        .values({
          userId: device.userId,
          ip: device.ip,
          title: device.title,
          lastActiveDate,
          expiredDate
        })
        .execute()

      const createdDevice = await this.getDeviceByDate(lastActiveDate)

      if (!createdDevice) {
        return null
      }

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

  async updateDevice(currentLastActiveDate: string): Promise<IDevice | null> {
    try {
      const existedDevice = await this.getDeviceByDate(currentLastActiveDate)

      if (!existedDevice) {
        return null
      }

      const date = new Date()
      const lastActiveDate = date.toISOString()

      const expiredDate = add(date, {
        seconds: 20
      }).toISOString()

      await this.devicesRepo
        .createQueryBuilder('device')
        .update()
        .set({ lastActiveDate, expiredDate })
        .where('deviceId = :deviceId', {
          deviceId: existedDevice.deviceId
        })
        .execute()

      const device = await this.getDeviceByDeviceId(existedDevice.deviceId)

      if (!device) {
        return null
      }

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
      await this.devicesRepo
        .createQueryBuilder('device')
        .delete()
        .where('userId = :userId AND NOT lastActiveDate = :lastActiveDate', {
          userId,
          lastActiveDate
        })
        .execute()

      return true
    } catch {
      return false
    }
  }

  async deleteDevice(deviceId: string): Promise<boolean> {
    try {
      await this.devicesRepo
        .createQueryBuilder('device')
        .delete()
        .where('deviceId = :deviceId', { deviceId })
        .execute()

      return true
    } catch(e) {
      return false
    }
  }
}
