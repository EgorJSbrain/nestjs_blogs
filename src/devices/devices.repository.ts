import { DataSource } from 'typeorm'
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import add from 'date-fns/add';

import { IDevice } from '../types/devices'
import { CreateDeviceDto } from '../dtos/devices/create-device.dto'


@Injectable()
export class DevicesRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async getAllDevicesByUserId(
    userId: string | null,
  ): Promise<any> {
    try {
      const query = `
        SELECT "deviceId", ip, title, "lastActiveDate"
          FROM public.devices
          WHERE "userId" = $1
      `
    const devices = await this.dataSource.query<IDevice[]>(query, [userId])

    if (!devices[0]) {
      return null
    }

    return devices
    } catch {
      return []
    }
  }

  async getDeviceByDate(lastActiveDate: string): Promise<IDevice | null> {
    try {
      const query = `
        SELECT "deviceId", "userId", ip, title, "lastActiveDate", "expiredDate"
          FROM public.devices
          WHERE "lastActiveDate" = $1
      `
      const device = await this.dataSource.query(query, [lastActiveDate])

      if (!device.length) {
        return null
      }

      return device[0]
    } catch {
      return null
    }
  }

  async getDeviceByDeviceId(deviceId: string): Promise<IDevice | null> {
    try {
      const query = `
        SELECT "deviceId", "userId", ip, title, "lastActiveDate", "expiredDate"
          FROM public.devices
          WHERE "deviceId" = $1
      `
      const device = await this.dataSource.query(query, [deviceId])

      if (!device.length) {
        return null
      }

      return device[0]
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

      const query = `
        INSERT INTO public.devices(
          "userId", ip, title, "lastActiveDate", "expiredDate")
          VALUES ($1, $2, $3, $4, $5);
        `

      await this.dataSource.query(query, [
        device.userId,
        device.ip,
        device.title,
        lastActiveDate,
        expiredDate
      ])

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

  async updateDevice(
    currentLastActiveDate: string,
  ): Promise<IDevice | null> {
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

      const query = `
        UPDATE public.devices
          SET "lastActiveDate"=$2, "expiredDate"=$3
          WHERE "deviceId" = $1;
      `
      await this.dataSource.query(query, [existedDevice.deviceId, lastActiveDate, expiredDate])
      const device = await this.getDeviceByDeviceId(existedDevice.deviceId)

      if (!existedDevice) {
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
      const query = `
        DELETE FROM public.devices
        WHERE "userId" = $1
          AND NOT "lastActiveDate"=$2
      `
      await this.dataSource.query(query, [userId, lastActiveDate])

      return true
    } catch {
      return false
    }
  }

  async deleteDevice(deviceId: string): Promise<boolean> {
    try {
      const query = `
        DELETE FROM public.devices
        WHERE "deviceId" = $1
      `
      return this.dataSource.query(query, [deviceId])
    } catch {
      return false
    }
  }
}
