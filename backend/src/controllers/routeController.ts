import { Request, Response } from 'express';
import { RouteService } from '../services/RouteService';

const routeService = new RouteService();

export const createRoute = async (req: Request, res: Response) => {
  try {
    const { name, driverId, vehicleId } = req.body;
    
    if (!name || !driverId || !vehicleId) {
      return res.status(400).json({ error: 'Rota adı, Şoför ve Araç seçimi zorunludur.' });
    }

    const route = await routeService.createRoute(req.body);
    res.status(201).json({ message: 'Rota başarıyla oluşturuldu.', route });
  } catch (error) {
    res.status(500).json({ error: 'Rota oluşturulurken bir hata oluştu.' });
  }
};

export const getRoutes = async (req: Request, res: Response) => {
  try {
    const routes = await routeService.getAllRoutes();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: 'Rotalar listelenirken bir hata oluştu.' });
  }
};
