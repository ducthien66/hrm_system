import React, { useState, useEffect } from 'react';
import { Calculator, Lock, Eye, Download, FileText } from 'lucide-react';
import { api } from '../../services/api.js';
import { PayrollPeriod, PayrollRun, Payslip } from '../../types/index.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { formatVND, getStatusBadge } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.js';

export const PayrollPage: React.FC = () => {
  const { user, isAccountant } = useAuth();
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [currentRun, setCurrentRun] = useState<PayrollRun | null>(null);
  const [myPayslips, setMyPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  // Payslip detail modal
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);

  // New period modal
  const [showNewPeriodModal, setShowNewPeriodModal] = useState(false);
  const [newMonth, setNewMonth] = useState(new Date().getMonth() + 1);
  const [newYear, setNewYear] = useState(new Date().getFullYear());

  const fetchPayroll = async () => {
    setIsLoading(true);
    try {
      if (isAccountant) {
        const res: any = await api.get('/payroll/periods');
        setPeriods(res.data);
        if (res.data.length > 0 && !selectedPeriod) {
          const firstPeriod = res.data[0];
          setSelectedPeriod(firstPeriod);
          if (firstPeriod.payrollRuns && firstPeriod.payrollRuns.length > 0) {
            setCurrentRun(firstPeriod.payrollRuns[0]);
          }
        }
      } else {
        const res: any = await api.get('/payroll/my-payslips');
        setMyPayslips(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu tiền lương:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [isAccountant]);

  const handleCalculatePayroll = async () => {
    if (!selectedPeriod) return;
    setIsCalculating(true);
    try {
      const res: any = await api.post('/payroll/calculate', { periodId: selectedPeriod.id });
      setCurrentRun(res.data);
      fetchPayroll();
    } catch (err: any) {
      alert(err.message || 'Lỗi tính toán bảng lương');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleLockPayroll = async () => {
    if (!currentRun) return;
    if (!confirm('Bạn có chắc chắn muốn khóa bảng lương này? Sau khi khóa sẽ không thể tính toán lại.')) return;
    setIsLocking(true);
    try {
      await api.post(`/payroll/runs/${currentRun.id}/lock`);
      fetchPayroll();
    } catch (err: any) {
      alert(err.message || 'Lỗi khóa bảng lương');
    } finally {
      setIsLocking(false);
    }
  };

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startDate = `${newYear}-${String(newMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(newYear, newMonth, 0).getDate();
      const endDate = `${newYear}-${String(newMonth).padStart(2, '0')}-${lastDay}`;

      await api.post('/payroll/periods', {
        name: `Kỳ lương Tháng ${newMonth}/${newYear}`,
        month: Number(newMonth),
        year: Number(newYear),
        startDate,
        endDate,
      });

      setShowNewPeriodModal(false);
      fetchPayroll();
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo kỳ lương');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý tiền lương & Phúc lợi (C&B)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tính toán lương tự động theo công, trích nộp bảo hiểm bắt buộc và thuế TNCN lũy tiến
          </p>
        </div>

        {isAccountant && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowNewPeriodModal(true)}
              variant="outline"
              size="sm"
            >
              + Mở kỳ lương mới
            </Button>
            {selectedPeriod && (
              <Button
                onClick={handleCalculatePayroll}
                variant="primary"
                size="sm"
                isLoading={isCalculating}
                icon={<Calculator className="w-4 h-4" />}
                disabled={selectedPeriod.status === 'LOCKED'}
              >
                Tính lương tự động
              </Button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Đang tải dữ liệu bảng lương..." />
      ) : isAccountant ? (
        /* Accountant View: Full Payroll Administration */
        <div className="space-y-6">
          {/* Period Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPeriod(p);
                  setCurrentRun(p.payrollRuns && p.payrollRuns.length > 0 ? p.payrollRuns[0] : null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedPeriod?.id === p.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p.name}
                <span className="ml-2 text-[10px] opacity-75">({getStatusBadge(p.status).label})</span>
              </button>
            ))}
          </div>

          {/* Period Summary KPI Cards */}
          {currentRun && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                <p className="text-xs font-medium text-slate-500">Tổng thu nhập gộp (Gross)</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{formatVND(currentRun.totalGross)}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                <p className="text-xs font-medium text-slate-500">Tổng khấu trừ (BHXH + Thuế)</p>
                <p className="text-xl font-bold text-rose-600 mt-1">{formatVND(currentRun.totalDeductions)}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                <p className="text-xs font-medium text-slate-500">Tổng thực nhận (Net)</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">{formatVND(currentRun.totalNet)}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Trạng thái bảng lương</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {getStatusBadge(currentRun.status).label}
                  </p>
                </div>
                {currentRun.status !== 'LOCKED' && (
                  <Button
                    onClick={handleLockPayroll}
                    variant="danger"
                    size="sm"
                    icon={<Lock className="w-3.5 h-3.5" />}
                    isLoading={isLocking}
                  >
                    Khóa sổ
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Detailed Payroll Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>Bảng thanh toán lương chi tiết ({selectedPeriod?.name})</span>
              </h3>
            </div>

            {!currentRun || !currentRun.payslips || currentRun.payslips.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Chưa có dữ liệu tính lương cho kỳ này. Nhấn nút "Tính lương tự động" ở góc trên bên phải để bắt đầu.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Mã & Họ tên</th>
                      <th className="py-3 px-4">Lương cơ bản</th>
                      <th className="py-3 px-4">Ngày công</th>
                      <th className="py-3 px-4">Phụ cấp</th>
                      <th className="py-3 px-4">Thu nhập gộp</th>
                      <th className="py-3 px-4">BHXH (8%)</th>
                      <th className="py-3 px-4">Thuế TNCN</th>
                      <th className="py-3 px-4">Lương thực nhận</th>
                      <th className="py-3 px-4 text-right">Phiếu lương</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {currentRun.payslips.map((ps) => (
                      <tr key={ps.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900">{ps.employee?.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{ps.employee?.employeeCode}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono">{formatVND(ps.baseSalary)}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {ps.actualWorkDays} / {ps.standardDays}
                        </td>
                        <td className="py-3.5 px-4 font-mono">{formatVND(ps.allowances)}</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{formatVND(ps.grossIncome)}</td>
                        <td className="py-3.5 px-4 font-mono text-rose-600">{formatVND(ps.socialInsurance)}</td>
                        <td className="py-3.5 px-4 font-mono text-rose-600">{formatVND(ps.personalIncomeTax)}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                          {formatVND(ps.netSalary)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedPayslip(ps);
                              setShowPayslipModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Xem chi tiết phiếu lương"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Regular Employee View: My Payslips */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Phiếu lương cá nhân của bạn
            </h3>
          </div>

          {myPayslips.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Bạn chưa có phiếu lương nào được công bố trong hệ thống.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Kỳ lương</th>
                    <th className="py-3 px-4">Ngày công</th>
                    <th className="py-3 px-4">Thu nhập gộp</th>
                    <th className="py-3 px-4">Các khoản khấu trừ</th>
                    <th className="py-3 px-4">Thực nhận (Net)</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {myPayslips.map((ps) => {
                    const deductions =
                      ps.socialInsurance + ps.healthInsurance + ps.unemploymentInsurance + ps.personalIncomeTax;
                    return (
                      <tr key={ps.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {ps.payrollRun?.payrollPeriod?.name || 'Kỳ lương'}
                        </td>
                        <td className="py-3.5 px-4">{ps.actualWorkDays} ngày</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{formatVND(ps.grossIncome)}</td>
                        <td className="py-3.5 px-4 font-mono text-rose-600">{formatVND(deductions)}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 text-sm">
                          {formatVND(ps.netSalary)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            onClick={() => {
                              setSelectedPayslip(ps);
                              setShowPayslipModal(true);
                            }}
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Xem phiếu lương
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Mở Kỳ Lương Mới */}
      <Modal isOpen={showNewPeriodModal} onClose={() => setShowNewPeriodModal(false)} title="Mở kỳ tính lương mới">
        <form onSubmit={handleCreatePeriod} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tháng (1 - 12)</label>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={newMonth}
                onChange={(e) => setNewMonth(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Năm</label>
              <input
                type="number"
                min={2020}
                required
                value={newYear}
                onChange={(e) => setNewYear(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowNewPeriodModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Xác nhận mở kỳ
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Phiếu Lương Chi Tiết (Payslip) */}
      <Modal isOpen={showPayslipModal} onClose={() => setShowPayslipModal(false)} title="Phiếu lương chi tiết (Payslip)" maxWidth="lg">
        {selectedPayslip && (
          <div className="space-y-4 text-xs">
            {/* Header Voucher */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[11px] uppercase tracking-wider">Họ và tên nhân viên</p>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedPayslip.employee?.fullName || user?.employee?.fullName}
                </h3>
                <p className="text-slate-400 font-mono text-[11px]">
                  {selectedPayslip.employee?.employeeCode || user?.employee?.employeeCode}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[11px]">Thực nhận (Net Salary)</p>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  {formatVND(selectedPayslip.netSalary)}
                </p>
              </div>
            </div>

            {/* Income Breakdown */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h4 className="font-semibold text-slate-800 uppercase text-[11px] tracking-wider mb-2">
                1. Các khoản thu nhập (Gross Income)
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-500">Lương cơ bản hợp đồng:</span>
                <span className="font-mono font-medium">{formatVND(selectedPayslip.baseSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Ngày làm việc thực tế ({selectedPayslip.actualWorkDays} / {selectedPayslip.standardDays} ngày):
                </span>
                <span className="font-mono font-medium">
                  {formatVND(Math.round((selectedPayslip.baseSalary / selectedPayslip.standardDays) * selectedPayslip.actualWorkDays))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng phụ cấp (Ăn trưa, xăng xe, điện thoại):</span>
                <span className="font-mono font-medium">{formatVND(selectedPayslip.allowances)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
                <span>Tổng thu nhập gộp:</span>
                <span className="font-mono text-brand-600">{formatVND(selectedPayslip.grossIncome)}</span>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h4 className="font-semibold text-slate-800 uppercase text-[11px] tracking-wider mb-2">
                2. Các khoản khấu trừ (Deductions)
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-500">Bảo hiểm xã hội (BHXH 8%):</span>
                <span className="font-mono text-rose-600">{formatVND(selectedPayslip.socialInsurance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bảo hiểm y tế (BHYT 1.5%):</span>
                <span className="font-mono text-rose-600">{formatVND(selectedPayslip.healthInsurance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bảo hiểm thất nghiệp (BHTN 1%):</span>
                <span className="font-mono text-rose-600">{formatVND(selectedPayslip.unemploymentInsurance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thuế thu nhập cá nhân (TNCN lũy tiến):</span>
                <span className="font-mono text-rose-600">{formatVND(selectedPayslip.personalIncomeTax)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
                <span>Tổng cộng khấu trừ:</span>
                <span className="font-mono text-rose-600">
                  {formatVND(
                    selectedPayslip.socialInsurance +
                      selectedPayslip.healthInsurance +
                      selectedPayslip.unemploymentInsurance +
                      selectedPayslip.personalIncomeTax
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowPayslipModal(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
