import { Injectable } from '@nestjs/common'

import { DevicesRepository } from './devices.repository'
import { CreateDeviceDto } from '../dtos/devices/create-device.dto'

@Injectable()
export class DevicesService {
  constructor(private devicesRepository: DevicesRepository) {}

  async getAllDevicesByUserId(userId: string | null): Promise<any> {
    return await this.devicesRepository.getAllDevicesByUserId(userId)
  }

  async getDeviceByDate(lastActiveDate: string): Promise<any> {
    return await this.devicesRepository.getDeviceByDate(lastActiveDate)
  }

  async getDeviceByDeviceId(deviceId: string): Promise<any> {
    return await this.devicesRepository.getDeviceByDeviceId(deviceId)
  }

  async createDevice(device: CreateDeviceDto): Promise<any> {
    return await this.devicesRepository.createDevice(device)
  }

  async updateDevice(currentLastActiveDate: string): Promise<any> {
    return await this.devicesRepository.updateDevice(currentLastActiveDate)
  }

  async deleteDevices(userId: string, lastActiveDate: string): Promise<any> {
    return await this.devicesRepository.deleteDevices(userId, lastActiveDate)
  }

  async deleteDevice(deviceId: string): Promise<any> {
    return this.devicesRepository.deleteDevice(deviceId)
  }
}
