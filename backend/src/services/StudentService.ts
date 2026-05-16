import { IStudentService } from '../interfaces/IStudentService';
import prisma from '../prisma';
import { Student, StudentStatus } from '@prisma/client';

export class StudentService implements IStudentService {
  async createStudent(userId: number, data: any): Promise<Student> {
    // ParentProfile id bul
    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId }
    });

    if (!parentProfile) {
      throw new Error('Veli profili bulunamadı.');
    }

    return prisma.student.create({
      data: {
        name: data.name,
        schoolName: data.schoolName,
        schoolNumber: data.schoolNumber,
        photoUrl: data.photoUrl,
        parentId: parentProfile.id,
        status: StudentStatus.PENDING,
      }
    });
  }

  async approveStudent(studentId: number): Promise<Student> {
    return prisma.student.update({
      where: { id: studentId },
      data: { status: StudentStatus.APPROVED }
    });
  }

  async rejectStudent(studentId: number): Promise<Student> {
    return prisma.student.update({
      where: { id: studentId },
      data: { status: StudentStatus.REJECTED }
    });
  }

  async deleteStudent(studentId: number): Promise<Student> {
    await prisma.boardingLog.deleteMany({ where: { studentId } });
    return prisma.student.delete({
      where: { id: studentId }
    });
  }

  async getAllStudents(): Promise<Student[]> {
    return prisma.student.findMany({
      include: {
        parent: {
          include: { user: true } // Veli adını çekmek için
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getStudentsByParentId(userId: number): Promise<Student[]> {
    const parentProfile = await prisma.parentProfile.findUnique({ where: { userId } });
    if (!parentProfile) return [];

    return prisma.student.findMany({
      where: { parentId: parentProfile.id },
      orderBy: { createdAt: 'desc' }
    });
  }
}
