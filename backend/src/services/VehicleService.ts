import { IVehicleService } from '../interfaces/IVehicleService';
import prisma from '../prisma';
import { Vehicle } from '@prisma/client';

export class VehicleService implements IVehicleService {
  async createVehicle(data: any): Promise<Vehicle> {
    return prisma.vehicle.create({
      data: {
        licensePlate: data.licensePlate,
        capacity: parseInt(data.capacity, 10),
        model: data.model
      }
    });
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return prisma.vehicle.findMany();
  }

  async getVehicleById(id: number): Promise<Vehicle | null> {
    return prisma.vehicle.findUnique({ where: { id } });
  }
}
