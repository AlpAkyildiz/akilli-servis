import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth';
import { BoardingType } from '@prisma/client';

// Şoförün aktif seferindeki tüm onaylı öğrencileri getir
export const getStudentsForDriver = async (req: AuthRequest, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      where: { status: 'APPROVED' },
      include: { parent: { include: { user: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(students);
  } catch (error: any) {
    console.error('getStudentsForDriver error:', error);
    res.status(500).json({ error: 'Öğrenciler getirilemedi.', detail: error.message });
  }
};

// Şoför öğrenciyi servise aldı
export const markBoarded = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, tripSessionId, driverProfileId } = req.body;
    console.log('markBoarded:', { studentId, tripSessionId, driverProfileId });

    const log = await prisma.boardingLog.create({
      data: {
        studentId: parseInt(studentId),
        type: BoardingType.BOARDED,
        tripSessionId: tripSessionId || null,
        driverProfileId: driverProfileId ? parseInt(driverProfileId) : null
      }
    });

    res.status(201).json({ message: 'Öğrenci servise alındı.', log });
  } catch (error: any) {
    console.error('markBoarded error:', error);
    res.status(500).json({ error: 'Binme kaydı oluşturulamadı.', detail: error.message });
  }
};

// Öğrenciyi servisten indirdi
export const markDroppedOff = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, tripSessionId, driverProfileId } = req.body;

    const log = await prisma.boardingLog.create({
      data: {
        studentId: parseInt(studentId),
        type: BoardingType.DROPPED_OFF,
        tripSessionId: tripSessionId || null,
        driverProfileId: driverProfileId ? parseInt(driverProfileId) : null
      }
    });

    res.status(201).json({ message: 'Öğrenci indirildi.', log });
  } catch (error: any) {
    console.error('markDroppedOff error:', error);
    res.status(500).json({ error: 'İnme kaydı oluşturulamadı.', detail: error.message });
  }
};

// Sefer sonunda servise binmemiş öğrencileri devamsız kaydet
export const markAbsent = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, tripSessionId, driverProfileId } = req.body;

    const log = await prisma.boardingLog.create({
      data: {
        studentId: parseInt(studentId),
        type: BoardingType.ABSENT,
        tripSessionId: tripSessionId || null,
        driverProfileId: driverProfileId ? parseInt(driverProfileId) : null
      }
    });

    // Veliye bildirim gönder
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      include: { parent: { include: { user: true } } }
    });

    if (student?.parent?.userId) {
      await prisma.notification.create({
        data: {
          userId: student.parent.userId,
          message: `⚠️ ${student.name} bugünkü servise binmedi veya servise bindiği işaretlenmedi.`
        }
      });
      console.log(`📢 Bildirim oluşturuldu - Veli: ${student.parent.userId}, Öğrenci: ${student.name}`);
    }

    res.status(201).json({ message: 'Devamsızlık kaydedildi, veliye bildirim gönderildi.', log });
  } catch (error: any) {
    console.error('markAbsent error:', error);
    res.status(500).json({ error: 'Devamsızlık kaydı oluşturulamadı.', detail: error.message });
  }
};

// Veli: öğrencisinin güncel seyahat durumunu getir
export const getStudentTripStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;

    const latestLog = await prisma.boardingLog.findFirst({
      where: { studentId: parseInt(studentId) },
      orderBy: { timestamp: 'desc' }
    });

    res.json({
      studentId: parseInt(studentId),
      latestStatus: latestLog?.type || null,
      tripSessionId: latestLog?.tripSessionId || null,
      driverProfileId: latestLog?.driverProfileId || null,
      timestamp: latestLog?.timestamp || null
    });
  } catch (error: any) {
    console.error('getStudentTripStatus error:', error);
    res.status(500).json({ error: 'Durum getirilemedi.', detail: error.message });
  }
};

// Veli: bildirimlerini getir
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log('getMyNotifications - userId:', userId);

    if (!userId) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    console.log(`📬 ${notifications.length} bildirim bulundu - userId: ${userId}`);
    res.json(notifications);
  } catch (error: any) {
    console.error('getMyNotifications error:', error);
    res.status(500).json({ error: 'Bildirimler getirilemedi.', detail: error.message });
  }
};
