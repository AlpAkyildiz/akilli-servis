import { Vehicle } from '@prisma/client';

export interface IVehicleService {
  createVehicle(data: any): Promise<Vehicle>;
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: number): Promise<Vehicle | null>;
}
