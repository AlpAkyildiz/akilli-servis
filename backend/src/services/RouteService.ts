import { IRouteService } from '../interfaces/IRouteService';
import prisma from '../prisma';
import { Route } from '@prisma/client';

export class RouteService implements IRouteService {
  async createRoute(data: any): Promise<Route> {
    return prisma.route.create({
      data: {
        name: data.name,
        startPoint: data.startPoint,
        endPoint: data.endPoint,
        driverId: parseInt(data.driverId, 10),
        vehicleId: parseInt(data.vehicleId, 10),
      }
    });
  }

  async getAllRoutes(): Promise<Route[]> {
    return prisma.route.findMany({
      include: {
        driver: { include: { user: true } },
        vehicle: true,
        stops: true
      }
    });
  }

  async getRouteById(id: number): Promise<Route | null> {
    return prisma.route.findUnique({
      where: { id },
      include: {
        driver: { include: { user: true } },
        vehicle: true,
        stops: true
      }
    });
  }

  async getRoutesByDriverId(driverProfileId: number): Promise<Route[]> {
    return prisma.route.findMany({
      where: { driverId: driverProfileId },
      include: { stops: true, vehicle: true }
    });
  }
}
