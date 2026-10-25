import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/response.js';
import { EmployeeService } from './employee.service.js';

export class RecruitmentService {
  static async getJobs() {
    return prisma.jobPosting.findMany({
      include: {
        _count: { select: { candidates: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createJob(data: any) {
    return prisma.jobPosting.create({
      data: {
        title: data.title.trim(),
        departmentId: data.departmentId || null,
        positionId: data.positionId || null,
        quantity: data.quantity || 1,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        requirements: data.requirements,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: 'OPEN',
      },
    });
  }

  static async getCandidates(jobPostingId?: string) {
    const where: any = {};
    if (jobPostingId) where.jobPostingId = jobPostingId;

    return prisma.candidate.findMany({
      where,
      include: { jobPosting: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createCandidate(data: any) {
    return prisma.candidate.create({
      data: {
        jobPostingId: data.jobPostingId || null,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone,
        resumeUrl: data.resumeUrl,
        notes: data.notes,
        status: 'APPLIED',
      },
    });
  }

  static async updateCandidateStatus(id: string, status: string, notes?: string) {
    return prisma.candidate.update({
      where: { id },
      data: { status, notes },
    });
  }

  /**
   * Chuyển đổi ứng viên trúng tuyển thành hồ sơ nhân viên trong 1 thao tác
   */
  static async convertToEmployee(candidateId: string, authorUserId?: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { jobPosting: true },
    });

    if (!candidate) throw new AppError('Ứng viên không tồn tại', 404);

    const nameParts = candidate.fullName.trim().split(' ');
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ') || lastName;

    const employee = await EmployeeService.createEmployee(
      {
        firstName,
        lastName,
        email: candidate.email,
        phone: candidate.phone,
        departmentId: candidate.jobPosting?.departmentId,
        positionId: candidate.jobPosting?.positionId,
        status: 'PROBATION',
        joinDate: new Date().toISOString(),
      },
      authorUserId
    );

    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: 'HIRED' },
    });

    return employee;
  }
}
