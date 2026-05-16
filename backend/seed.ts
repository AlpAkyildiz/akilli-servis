import bcrypt from 'bcrypt';
import prisma from './src/prisma';

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@okul.edu.tr' }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await prisma.user.create({
      data: {
        email: 'admin@okul.edu.tr',
        password: hashedPassword,
        name: 'Sistem Yöneticisi',
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin hesabı başarıyla oluşturuldu: admin@okul.edu.tr / 123456');
  } else {
    console.log('Admin hesabı zaten mevcut.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
