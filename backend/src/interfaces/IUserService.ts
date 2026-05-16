import { User } from '@prisma/client';

export interface IUserService {
  createDriver(data: any): Promise<User>;
  createParent(data: any): Promise<User>;
  createAdmin(data: any): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  getDrivers(): Promise<any[]>;
}
