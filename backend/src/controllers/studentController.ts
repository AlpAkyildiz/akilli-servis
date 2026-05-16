import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth';

// Veli kendi çocuğunu ekler (PENDING olarak kaydedilir)
export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const parentId = req.user?.id;
    if (!parentId) return res.status(401).json({ error: 'Yetkisiz işlem.' });

    const { name, schoolName, schoolNumber, photoUrl } = req.body;

    const student = await prisma.student.create({
      data: {
        name,
        schoolName,
        schoolNumber,
        photoUrl,
        parentId,
        status: 'PENDING', // Admin onayı bekliyor
      }
    });

    res.status(201).json({ message: 'Öğrenci eklendi, yönetici onayı bekleniyor.', student });
  } catch (error) {
    res.status(500).json({ error: 'Öğrenci eklenirken bir hata oluştu.' });
  }
};

// Admin onayı bekleyen öğrencileri onaylar
export const approveStudent = async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.id);

    const student = await prisma.student.update({
      where: { id: studentId },
      data: { status: 'APPROVED' }
    });

    res.json({ message: 'Öğrenci onaylandı.', student });
  } catch (error) {
    res.status(500).json({ error: 'Öğrenci onaylanırken bir hata oluştu.' });
  }
};

// Velinin kendi öğrencilerini getirmesi veya Admin'in tüm öğrencileri getirmesi
export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    if (role === 'ADMIN') {
      const students = await prisma.student.findMany({ include: { parent: true } });
      return res.json(students);
    } else if (role === 'PARENT') {
      const students = await prisma.student.findMany({ where: { parentId: userId } });
      return res.json(students);
    }

    res.status(403).json({ error: 'Yetkisiz erişim.' });
  } catch (error) {
    res.status(500).json({ error: 'Öğrenciler getirilirken bir hata oluştu.' });
  }
};
