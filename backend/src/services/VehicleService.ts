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

  async deleteVehicle(id: number): Promise<Vehicle> {
    // Delete associated routes first
    const routes = await prisma.route.findMany({ where: { vehicleId: id } });
    for (const r of routes) {
      await prisma.stop.deleteMany({ where: { routeId: r.id } });
      await prisma.boardingLog.deleteMany({ where: { routeId: r.id } });
      await prisma.route.delete({ where: { id: r.id } });
    }
    return prisma.vehicle.delete({ where: { id } });
  }
}
