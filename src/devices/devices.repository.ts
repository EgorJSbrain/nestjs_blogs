import { DataSource, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import add from 'date-fns/add'

import { IDevice } from '../types/devices'
import { CreateDeviceDto } from '../dtos/devices/create-device.dto'
import { DeviceEntity } from '../entities/devices'

const writeSql = async (sql: string) => {
  const fs = require('fs/promises')
  try {
    await fs.writeFile('sql.txt', sql)
  } catch (err) {
    console.log(err)
  }
}

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(DeviceEntity)
    private readonly devicesRepo: Repository<DeviceEntity>
  ) {}

  async getAllDevicesByUserId(userId: string | null): Promise<any> {
    try {
      const device = await this.devicesRepo
        .createQueryBuilder('device')
        .where('device.userId = :userId', { userId })
        .getOne()

      if (!device) {
        return null
      }

      return device
    } catch {
      return []
    }
  }

  async getDeviceByDate(lastActiveDate: string): Promise<IDevice | null> {
    try {
      console.log("lastActiveDate:", lastActiveDate)
      const device = await this.devicesRepo
        .createQueryBuilder('device')
        .where('device.lastActiveDate = :lastActiveDate', { lastActiveDate })
        .getOne()
      console.log("!!!!!getDeviceByDate ~ device:", device)

      if (!device) {
        return null
      }

      return device
    } catch {
      return null
    }
  }

  async getDeviceByDeviceId(deviceId: string): Promise<IDevice | null> {
    console.log("======= ~ deviceId:", deviceId)
    try {
      const device = await this.devicesRepo
        .createQueryBuilder('device')
        .where('device.deviceId = :deviceId', { deviceId })
        .getOne()

      if (!device) {
        return null
      }

      return device
    } catch {
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
console.log('---BEFORE-upDTAE')
      await this.devicesRepo
      .createQueryBuilder('device')
      .update()
      .set({ lastActiveDate, expiredDate })
      .where('deviceId = :deviceId', {
        deviceId: existedDevice.deviceId
      })
      .execute()

      // const query = `
      //   UPDATE public.devices
      //     SET "lastActiveDate"=$2, "expiredDate"=$3
      //     WHERE "deviceId" = $1;
      // `
      // await this.dataSource.query(query, [
      //   existedDevice.deviceId,
      //   lastActiveDate,
      //   expiredDate
      // ])
      console.log('---AFTER-upDTAE')
      const device = await this.getDeviceByDeviceId(existedDevice.deviceId)
      console.log("ppppp000ppppp00-------device:", device)

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
      // const query = `
      //   DELETE FROM public.devices
      //   WHERE "userId" = $1
      //     AND NOT "lastActiveDate"=$2
      // `
      // await this.dataSource.query(query, [userId, lastActiveDate])
      console.log("--1:")
      const res = await this.devicesRepo
        .createQueryBuilder('device')
        .delete()
        .where('device.userId = :userId AND NOT device.lastActiveDate = :lastActiveDate', {
          userId,
          lastActiveDate
        })
        .execute()
      console.log("--DELETE MANY--res:", res)

      return true
    } catch {
      return false
    }
  }

  async deleteDevice(deviceId: string): Promise<boolean> {
    try {
      console.log("--2--:")
      const res = await this.devicesRepo
      .createQueryBuilder('device')
      .delete()
      .where('device.deviceId = :deviceId', { deviceId })
      .execute()
      console.log("one======== ~ res:", res)
      // const query = `
      //   DELETE FROM public.devices
      //   WHERE "deviceId" = $1
      // `
      // return this.dataSource.query(query, [deviceId])
      return true
    } catch {
      return false
    }
  }
}
