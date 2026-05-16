import prisma from './src/prisma';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Canlı veritabanına başlangıç verileri ekleniyor...');

  try {
    // 1. Admin Kullanıcısı
    const adminEmail = 'admin@akilliservis.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Sistem Yöneticisi',
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log('✅ Admin kullanıcısı oluşturuldu: admin@akilliservis.com / Admin123!');
    } else {
      console.log('⚡ Admin kullanıcısı zaten mevcut.');
    }

    // 2. Örnek Şoför
    const driverEmail = 'sofor@akilliservis.com';
    const existingDriver = await prisma.user.findUnique({ where: { email: driverEmail } });

    if (!existingDriver) {
      const hashedPassword = await bcrypt.hash('Sofor123!', 10);
      const driverUser = await prisma.user.create({
        data: {
          email: driverEmail,
          name: 'Ahmet Yılmaz (Şoför)',
          password: hashedPassword,
          role: 'DRIVER',
          driverProfile: {
            create: {
              licenseNumber: '34-EHL-98765',
              phone: '05321112233',
            },
          },
        },
      });
      console.log('✅ Örnek Şoför oluşturuldu: sofor@akilliservis.com / Sofor123!');
    } else {
      console.log('⚡ Örnek Şoför zaten mevcut.');
    }

    // 3. Örnek Araç
    const licensePlate = '34 ABC 123';
    const existingVehicle = await prisma.vehicle.findUnique({ where: { licensePlate } });

    if (!existingVehicle) {
      await prisma.vehicle.create({
        data: {
          licensePlate,
          capacity: 16,
          model: 'Mercedes Sprinter',
        },
      });
      console.log('✅ Örnek Araç oluşturuldu: 34 ABC 123');
    } else {
      console.log('⚡ Örnek Araç zaten mevcut.');
    }

    console.log('🎉 Tüm seed işlemleri tamamlandı!');
  } catch (error) {
    console.error('❌ Seed sırasında hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
