import { Route } from '@prisma/client';

export interface IRouteService {
  createRoute(data: any): Promise<Route>;
  getAllRoutes(): Promise<Route[]>;
  getRouteById(id: number): Promise<Route | null>;
  getRoutesByDriverId(driverProfileId: number): Promise<Route[]>;
}
