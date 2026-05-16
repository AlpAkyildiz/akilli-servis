import { Student } from '@prisma/client';

export interface IStudentService {
  createStudent(userId: number, data: any): Promise<Student>;
  approveStudent(studentId: number): Promise<Student>;
  rejectStudent(studentId: number): Promise<Student>;
  getAllStudents(): Promise<Student[]>;
  getStudentsByParentId(userId: number): Promise<Student[]>;
}
