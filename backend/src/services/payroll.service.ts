import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/response.js';

export class PayrollService {
  /**
   * Tính thuế Thu nhập cá nhân (TNCN) theo biểu lũy tiến từng phần Việt Nam
   */
  static calculatePIT(taxableIncome: number): number {
    if (taxableIncome <= 0) return 0;

    if (taxableIncome <= 5000000) {
      return taxableIncome * 0.05;
    } else if (taxableIncome <= 10000000) {
      return taxableIncome * 0.1 - 250000;
    } else if (taxableIncome <= 18000000) {
      return taxableIncome * 0.15 - 750000;
    } else if (taxableIncome <= 32000000) {
      return taxableIncome * 0.2 - 1650000;
    } else if (taxableIncome <= 52000000) {
      return taxableIncome * 0.25 - 3250000;
    } else if (taxableIncome <= 80000000) {
      return taxableIncome * 0.3 - 5850000;
    } else {
      return taxableIncome * 0.35 - 9850000;
    }
  }

  static async getPeriods() {
    return prisma.payrollPeriod.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        payrollRuns: true,
      },
    });
  }

  static async createPeriod(data: {
    name: string;
    month: number;
    year: number;
    startDate: string;
    endDate: string;
  }) {
    const existing = await prisma.payrollPeriod.findUnique({
      where: {
        month_year: {
          month: data.month,
          year: data.year,
        },
      },
    });

    if (existing) {
      throw new AppError(`Kỳ lương tháng ${data.month}/${data.year} đã tồn tại`, 409);
    }

    return prisma.payrollPeriod.create({
      data: {
        name: data.name,
        month: data.month,
        year: data.year,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: 'OPEN',
      },
    });
  }

  /**
   * Tự động tính toán bảng lương cho toàn bộ nhân sự theo dữ liệu công thực tế
   */
  static async calculatePayroll(periodId: string, authorUserId?: string) {
    const period = await prisma.payrollPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) {
      throw new AppError('Kỳ tính lương không tồn tại', 404);
    }

    if (period.status === 'LOCKED') {
      throw new AppError('Kỳ tính lương này đã bị khóa. Không thể tính toán lại.', 400);
    }

    // Lấy danh sách nhân viên đang làm việc kèm cấu trúc lương
    const employees = await prisma.employee.findMany({
      where: {
        deletedAt: null,
        status: { in: ['ACTIVE', 'PROBATION'] },
      },
      include: {
        salaryStructure: true,
        contracts: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const standardDays = 22.0;

    const result = await prisma.$transaction(async (tx) => {
      // Tìm hoặc tạo đợt tính lương (PayrollRun)
      let run = await tx.payrollRun.findFirst({
        where: { payrollPeriodId: periodId },
      });

      if (!run) {
        run = await tx.payrollRun.create({
          data: {
            payrollPeriodId: periodId,
            status: 'DRAFT',
          },
        });
      }

      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      for (const emp of employees) {
        const salaryStruct = emp.salaryStructure;
        const activeContract = emp.contracts[0];
        const baseSalary = activeContract ? activeContract.baseSalary : salaryStruct?.baseSalary || 10000000;

        // Đếm ngày làm việc thực tế trong kỳ
        const attendances = await tx.attendanceRecord.findMany({
          where: {
            employeeId: emp.id,
            workDate: { gte: period.startDate, lte: period.endDate },
          },
        });

        const actualWorkDays = attendances.length > 0 ? attendances.length : 22.0; // Nếu chưa có đủ công thì tính 22 ngày mẫu
        const paidLeaveDays = 0.0;
        const effectiveDays = Math.min(standardDays, actualWorkDays + paidLeaveDays);

        // Tính phụ cấp
        const lunch = salaryStruct?.lunchAllowance || 730000;
        const transport = salaryStruct?.transportAllowance || 500000;
        const phone = salaryStruct?.phoneAllowance || 300000;
        const other = salaryStruct?.otherAllowances || 0;
        const totalAllowances = lunch + transport + phone + other;

        // Lương cơ bản theo ngày công thực tế
        const earnedSalary = Math.round((baseSalary / standardDays) * effectiveDays);
        const otPay = 0.0;
        const grossIncome = earnedSalary + totalAllowances + otPay;

        // Bảo hiểm bắt buộc
        const insuranceBase = salaryStruct?.insuranceSalary || baseSalary * 0.7;
        const socialInsurance = Math.round(insuranceBase * 0.08); // 8%
        const healthInsurance = Math.round(insuranceBase * 0.015); // 1.5%
        const unemploymentInsurance = Math.round(insuranceBase * 0.01); // 1%
        const totalInsurance = socialInsurance + healthInsurance + unemploymentInsurance;

        // Thuế TNCN
        const personalDeduction = 11000000;
        const dependentDeduction = (salaryStruct?.dependentsCount || 0) * 4400000;
        const nonTaxableLunch = Math.min(lunch, 730000);

        const taxableIncome = Math.max(
          0,
          grossIncome - totalInsurance - nonTaxableLunch - personalDeduction - dependentDeduction
        );
        const personalIncomeTax = Math.round(PayrollService.calculatePIT(taxableIncome));

        const netSalary = grossIncome - totalInsurance - personalIncomeTax;

        totalGross += grossIncome;
        totalDeductions += totalInsurance + personalIncomeTax;
        totalNet += netSalary;

        // Lưu hoặc cập nhật Payslip
        await tx.payslip.upsert({
          where: {
            payrollRunId_employeeId: {
              payrollRunId: run.id,
              employeeId: emp.id,
            },
          },
          update: {
            baseSalary,
            standardDays,
            actualWorkDays: effectiveDays,
            paidLeaveDays,
            grossIncome,
            otPay,
            allowances: totalAllowances,
            socialInsurance,
            healthInsurance,
            unemploymentInsurance,
            taxableIncome,
            personalIncomeTax,
            netSalary,
          },
          create: {
            payrollRunId: run.id,
            employeeId: emp.id,
            baseSalary,
            standardDays,
            actualWorkDays: effectiveDays,
            paidLeaveDays,
            grossIncome,
            otPay,
            allowances: totalAllowances,
            socialInsurance,
            healthInsurance,
            unemploymentInsurance,
            taxableIncome,
            personalIncomeTax,
            netSalary,
          },
        });
      }

      // Cập nhật tổng đợt tính lương
      const updatedRun = await tx.payrollRun.update({
        where: { id: run.id },
        data: {
          totalGross,
          totalDeductions,
          totalNet,
          status: 'DRAFT',
        },
        include: {
          payslips: {
            include: {
              employee: {
                select: { id: true, fullName: true, employeeCode: true, department: true, position: true },
              },
            },
          },
        },
      });

      await tx.payrollPeriod.update({
        where: { id: periodId },
        data: { status: 'CALCULATED' },
      });

      if (authorUserId) {
        await tx.auditLog.create({
          data: {
            userId: authorUserId,
            action: 'APPROVE',
            entityType: 'PAYROLL',
            entityId: run.id,
            newValues: JSON.stringify({ totalGross, totalNet, count: employees.length }),
          },
        });
      }

      return updatedRun;
    });

    return result;
  }

  static async lockPayrollRun(runId: string, authorUserId?: string) {
    const run = await prisma.payrollRun.findUnique({
      where: { id: runId },
      include: { payrollPeriod: true },
    });

    if (!run) throw new AppError('Bảng lương không tồn tại', 404);

    return prisma.$transaction(async (tx) => {
      const updatedRun = await tx.payrollRun.update({
        where: { id: runId },
        data: { status: 'LOCKED' },
      });

      await tx.payrollPeriod.update({
        where: { id: run.payrollPeriodId },
        data: { status: 'LOCKED' },
      });

      if (authorUserId) {
        await tx.auditLog.create({
          data: {
            userId: authorUserId,
            action: 'UPDATE',
            entityType: 'PAYROLL_LOCK',
            entityId: runId,
          },
        });
      }

      return updatedRun;
    });
  }

  static async getMyPayslips(employeeId: string) {
    return prisma.payslip.findMany({
      where: { employeeId },
      include: {
        payrollRun: {
          include: { payrollPeriod: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getPayslipById(id: string) {
    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        employee: {
          include: { department: true, position: true },
        },
        payrollRun: {
          include: { payrollPeriod: true },
        },
      },
    });

    if (!payslip) throw new AppError('Phiếu lương không tồn tại', 404);
    return payslip;
  }
}
