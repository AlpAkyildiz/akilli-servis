import { Request, Response } from 'express';
import { StudentService } from '../services/StudentService';
import { AuthRequest } from '../middlewares/auth';

const studentService = new StudentService();

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Yetkisiz işlem.' });

    const student = await studentService.createStudent(userId, req.body);
    res.status(201).json({ message: 'Öğrenci eklendi, yönetici onayı bekleniyor.', student });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Öğrenci eklenirken bir hata oluştu.' });
  }
};

export const approveStudent = async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.id);
    const student = await studentService.approveStudent(studentId);
    res.json({ message: 'Öğrenci onaylandı.', student });
  } catch (error) {
    res.status(500).json({ error: 'Öğrenci onaylanırken bir hata oluştu.' });
  }
};

export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Yetkisiz erişim.' });

    if (role === 'ADMIN') {
      const students = await studentService.getAllStudents();
      return res.json(students);
    } else if (role === 'PARENT') {
      const students = await studentService.getStudentsByParentId(userId);
      return res.json(students);
    }

    res.status(403).json({ error: 'Yetkisiz erişim.' });
  } catch (error) {
    res.status(500).json({ error: 'Öğrenciler getirilirken bir hata oluştu.' });
  }
};
