import { Request, Response } from 'express';
import { VehicleService } from '../services/VehicleService';

const vehicleService = new VehicleService();

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { licensePlate, capacity, model } = req.body;
    
    if (!licensePlate || !capacity) {
      return res.status(400).json({ error: 'Plaka ve kapasite zorunludur.' });
    }

    const vehicle = await vehicleService.createVehicle({ licensePlate, capacity, model });
    res.status(201).json({ message: 'Araç başarıyla eklendi.', vehicle });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Bu plakaya sahip bir araç zaten mevcut.' });
    } else {
      res.status(500).json({ error: 'Araç eklenirken bir hata oluştu.' });
    }
  }
};

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Araçlar listelenirken bir hata oluştu.' });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.id);
    await vehicleService.deleteVehicle(vehicleId);
    res.json({ message: 'Araç silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Araç silinirken bir hata oluştu.' });
  }
};
