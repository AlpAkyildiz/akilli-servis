import prisma from './src/prisma';
import bcrypt from 'bcrypt';

async function seedParentAndStudent() {
  console.log('🌱 Canlı veritabanına Veli ve Öğrenci ekleniyor...');

  try {
    const parentEmail = 'veli@akilliservis.com';
    const existingParent = await prisma.user.findUnique({ where: { email: parentEmail } });

    if (!existingParent) {
      const hashedPassword = await bcrypt.hash('Veli123!', 10);
      
      // Veli kullanıcısını ve Parent profilini oluştur
      const parentUser = await prisma.user.create({
        data: {
          email: parentEmail,
          name: 'Mehmet Demir (Veli)',
          password: hashedPassword,
          role: 'PARENT',
          parentProfile: {
            create: {
              phone: '05441112233',
              address: 'Kadıköy, İstanbul',
              children: {
                create: {
                  name: 'Ali Demir',
                  schoolName: 'Atatürk İlkokulu',
                  schoolNumber: '1024',
                  status: 'APPROVED', // Doğrudan onaylı ekliyoruz
                }
              }
            }
          }
        },
      });

      console.log('✅ Veli ve Öğrenci başarıyla oluşturuldu!');
    } else {
      console.log('⚡ Veli ve Öğrenci zaten mevcut.');
    }

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedParentAndStudent();
