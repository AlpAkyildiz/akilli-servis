import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar';

// Sadece Veliler kendini kayıt edebilir (Admin/Şoför sistemden eklenir)
export const registerParent = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Bu email zaten kayıtlı.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'PARENT'
      }
    });

    res.status(201).json({ message: 'Kayıt başarılı.', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
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

// Yöneticinin yeni bir personel (Örn: Şoför) eklemesi
export const createStaff = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body; // role: DRIVER veya ADMIN
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Bu email zaten kayıtlı.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    });

    res.status(201).json({ message: 'Personel başarıyla oluşturuldu.', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Personel oluşturulurken bir hata oluştu.' });
  }
};
