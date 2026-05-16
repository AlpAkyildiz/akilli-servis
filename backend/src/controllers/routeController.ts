import { Request, Response } from 'express';
import { RouteService } from '../services/RouteService';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth';

const routeService = new RouteService();

export const createRoute = async (req: Request, res: Response) => {
  try {
    const { name, driverId, vehicleId } = req.body;
    
    if (!name || !driverId || !vehicleId) {
      return res.status(400).json({ error: 'Rota adı, Şoför ve Araç seçimi zorunludur.' });
    }

    const route = await routeService.createRoute(req.body);
    res.status(201).json({ message: 'Rota başarıyla oluşturuldu.', route });
  } catch (error: any) {
    res.status(500).json({ error: 'Rota oluşturulurken bir hata oluştu.', detail: error.message });
  }
};

export const getRoutes = async (req: Request, res: Response) => {
  try {
    const routes = await routeService.getAllRoutes();
    res.json(routes);
  } catch (error: any) {
    res.status(500).json({ error: 'Rotalar listelenirken bir hata oluştu.', detail: error.message });
  }
};

// Şoförün kendine atanmış rotalarını ve araç bilgilerini getir
export const getMyRoutes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Yetkisiz erişim.' });

    // Kullanıcının driverProfile id'sini bul
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: Number(userId) }
    });

    if (!driverProfile) {
      return res.status(404).json({ error: 'Şoför profili bulunamadı.' });
    }

    // Bu şoföre atanmış rotaları ve araçları getir
    const routes = await prisma.route.findMany({
      where: { driverId: driverProfile.id },
      include: {
        vehicle: true
      }
    });

    res.json({
      driverProfile,
      routes
    });
  } catch (error: any) {
    console.error('getMyRoutes error:', error);
    res.status(500).json({ error: 'Atanmış rotalar getirilemedi.', detail: error.message });
  }
};
