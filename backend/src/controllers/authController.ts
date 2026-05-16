import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/UserService';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar';
const userService = new UserService(); // Dependency Injection via instantiation (can be advanced further)

export const registerParent = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    const existingUser = await userService.findByEmail(email);
    if (existingUser) return res.status(400).json({ error: 'Bu email zaten kayıtlı.' });

    const user = await userService.createParent(req.body);

    res.status(201).json({ message: 'Kayıt başarılı.', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // AuthController is responsible for Auth logic, but uses UserService for fetching
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Giriş sırasında bir hata oluştu.' });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    
    const existingUser = await userService.findByEmail(email);
    if (existingUser) return res.status(400).json({ error: 'Bu email zaten kayıtlı.' });

    let user;
    if (role === 'DRIVER') {
      user = await userService.createDriver(req.body);
    } else if (role === 'ADMIN') {
      user = await userService.createAdmin(req.body);
    } else {
      return res.status(400).json({ error: 'Geçersiz personel rolü.' });
    }

    res.status(201).json({ message: 'Personel başarıyla oluşturuldu.', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Personel oluşturulurken bir hata oluştu.' });
  }
};

export const getDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await userService.getDrivers();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: 'Şoförler getirilirken bir hata oluştu.' });
  }
};

export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const driverId = parseInt(req.params.id);
    await userService.deleteDriver(driverId);
    res.json({ message: 'Şoför silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Şoför silinirken bir hata oluştu.' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Yetkisiz erişim.' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mevcut şifre ve yeni şifre zorunludur.' });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Mevcut şifreniz hatalı.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Şifreniz başarıyla güncellendi.' });
  } catch (error) {
    res.status(500).json({ error: 'Şifre güncellenirken bir hata oluştu.' });
  }
};
