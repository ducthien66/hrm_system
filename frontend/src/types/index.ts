export interface User {
  id: string;
  email: string;
  role: Role;
  employeeId?: string | null;
  employee?: Employee | null;
  lastLoginAt?: string | null;
}

export interface Role {
  id: string;
  code: 'SUPER_ADMIN' | 'HR_MANAGER' | 'ACCOUNTANT' | 'DEPT_MANAGER' | 'EMPLOYEE';
  name: string;
  description?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  managerId?: string | null;
  headcount?: number;
  manager?: {
    id: string;
    fullName: string;
    employeeCode: string;
    email: string;
  } | null;
  isActive: boolean;
  createdAt: string;
}

export interface Position {
  id: string;
  code: string;
  name: string;
  gradeLevel: number;
  description?: string;
  departmentId?: string | null;
  department?: Department | null;
  isActive: boolean;
  _count?: {
    employees: number;
  };
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  dateOfBirth?: string | null;
  address?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  managerId?: string | null;
  joinDate: string;
  status: 'PROBATION' | 'ACTIVE' | 'RESIGNED' | 'SUSPENDED';
  avatarUrl?: string | null;
  emergencyContact?: string | null;
  department?: Department | null;
  position?: Position | null;
  manager?: { id: string; fullName: string; employeeCode: string } | null;
  createdAt: string;
}

export interface EmploymentContract {
  id: string;
  contractNumber: string;
  employeeId: string;
  contractType: 'PROBATION' | 'DEFINITE_1Y' | 'DEFINITE_3Y' | 'INDEFINITE';
  startDate: string;
  endDate?: string | null;
  baseSalary: number;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'TERMINATED';
  notes?: string | null;
  employee?: {
    id: string;
    fullName: string;
    employeeCode: string;
    department?: Department | null;
    position?: Position | null;
  };
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  workDate: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  workHours: number;
  otHours: number;
  lateMinutes: number;
  earlyMinutes: number;
  status: 'NORMAL' | 'LATE' | 'EARLY' | 'ABSENT' | 'HOLIDAY' | 'ON_LEAVE';
  notes?: string | null;
  employee?: {
    id: string;
    fullName: string;
    employeeCode: string;
    department?: Department | null;
  };
}

export interface LeaveType {
  id: string;
  code: string;
  name: string;
  daysPerYear: number;
  isPaid: boolean;
  description?: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  entitledDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  leaveType: LeaveType;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string | null;
  createdAt: string;
  employee?: {
    id: string;
    fullName: string;
    employeeCode: string;
    department?: Department | null;
  };
  leaveType: LeaveType;
}

export interface PayrollPeriod {
  id: string;
  name: string;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CALCULATED' | 'LOCKED' | 'APPROVED';
  payrollRuns?: PayrollRun[];
}

export interface PayrollRun {
  id: string;
  payrollPeriodId: string;
  runDate: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  status: 'DRAFT' | 'LOCKED' | 'APPROVED';
  payslips?: Payslip[];
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  baseSalary: number;
  standardDays: number;
  actualWorkDays: number;
  paidLeaveDays: number;
  grossIncome: number;
  otPay: number;
  allowances: number;
  socialInsurance: number;
  healthInsurance: number;
  unemploymentInsurance: number;
  taxableIncome: number;
  personalIncomeTax: number;
  netSalary: number;
  paymentStatus: 'UNPAID' | 'PAID';
  payrollRun?: (PayrollRun & { payrollPeriod?: PayrollPeriod }) | null;
  employee?: {
    id: string;
    fullName: string;
    employeeCode: string;
    department?: Department | null;
    position?: Position | null;
  };
}

export interface JobPosting {
  id: string;
  title: string;
  quantity: number;
  salaryMin?: number | null;
  salaryMax?: number | null;
  requirements?: string | null;
  deadline?: string | null;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  _count?: { candidates: number };
}

export interface Candidate {
  id: string;
  jobPostingId?: string | null;
  fullName: string;
  email: string;
  phone?: string | null;
  resumeUrl?: string | null;
  status: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';
  notes?: string | null;
  createdAt: string;
  jobPosting?: JobPosting | null;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  serialNumber?: string | null;
  cost?: number | null;
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'DISPOSED';
  assignments?: Array<{
    id: string;
    assignedDate: string;
    employee?: { id: string; fullName: string; employeeCode: string } | null;
  }>;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValues?: string | null;
  newValues?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: { id: string; email: string; employee?: { fullName: string } | null } | null;
}

export interface DashboardMetrics {
  cards: {
    totalEmployees: number;
    activeEmployees: number;
    probationEmployees: number;
    resignedEmployees: number;
    expiringContracts: number;
    todayAttendances: number;
    attendanceRate: number;
    pendingLeaves: number;
    latestPayrollNet: number;
    latestPayrollPeriod: string;
  };
  charts: {
    departmentDistribution: Array<{ name: string; code: string; count: number }>;
    monthlyTrend: Array<{ month: string; joins: number; leaves: number }>;
  };
}
