import { IUserService } from '../interfaces/IUserService';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import { User, Role } from '@prisma/client';

export class UserService implements IUserService {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async createDriver(data: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: Role.DRIVER,
        driverProfile: {
          create: {
            licenseNumber: data.licenseNumber,
            phone: data.phone
          }
        }
      }
    });
  }

  async createParent(data: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: Role.PARENT,
        parentProfile: {
          create: {
            phone: data.phone,
            address: data.address
          }
        }
      }
    });
  }

  async createAdmin(data: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: Role.ADMIN
      }
    });
  }

  async getDrivers(): Promise<any[]> {
    return prisma.driverProfile.findMany({
      include: { user: true }
    });
  }

  async deleteDriver(driverProfileId: number): Promise<void> {
    const profile = await prisma.driverProfile.findUnique({ where: { id: driverProfileId } });
    if (!profile) return;
    
    // Find all routes associated with driver
    const routes = await prisma.route.findMany({ where: { driverId: profile.id } });
    for (const r of routes) {
      await prisma.stop.deleteMany({ where: { routeId: r.id } });
      await prisma.boardingLog.deleteMany({ where: { routeId: r.id } });
      await prisma.route.delete({ where: { id: r.id } });
    }

    // Delete user (DriverProfile will be cascade deleted)
    await prisma.user.delete({ where: { id: profile.userId } });
  }
}
