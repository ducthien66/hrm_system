import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { api } from '../../services/api.js';
import { Employee, Department, Position } from '../../types/index.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';
import { ConfirmModal } from '../../components/common/ConfirmModal.js';
import { Pagination } from '../../components/common/Pagination.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { formatDateVN, getStatusBadge } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.js';

export const EmployeeListPage: React.FC = () => {
  const { isHR } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: '',
    address: '',
    departmentId: '',
    positionId: '',
    status: 'ACTIVE',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/employees', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          departmentId: departmentId || undefined,
          status: status || undefined,
        },
      });
      setEmployees(res.data);
      if (res.meta) {
        setTotalPages(res.meta.totalPages);
        setTotalItems(res.meta.total);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách nhân sự:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, departmentId, status]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes, posRes]: any = await Promise.all([
          api.get('/departments'),
          api.get('/positions'),
        ]);
        setDepartments(deptRes.data);
        setPositions(posRes.data);
      } catch (err) {
        console.error('Lỗi lấy metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.post('/employees', formData);
      setShowCreateModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: 'MALE',
        dateOfBirth: '',
        address: '',
        departmentId: '',
        positionId: '',
        status: 'ACTIVE',
      });
      fetchEmployees();
    } catch (err: any) {
      setFormError(err.message || 'Lỗi thêm mới nhân viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.patch(`/employees/${selectedEmp.id}`, formData);
      setShowEditModal(false);
      fetchEmployees();
    } catch (err: any) {
      setFormError(err.message || 'Lỗi cập nhật thông tin nhân viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!selectedEmp) return;
    setIsSubmitting(true);
    try {
      await api.post(`/employees/${selectedEmp.id}/archive`);
      setShowArchiveModal(false);
      fetchEmployees();
    } catch (err) {
      console.error('Lỗi thôi việc nhân sự:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (emp: Employee) => {
    setSelectedEmp(emp);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone || '',
      gender: (emp.gender as any) || 'MALE',
      dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
      address: emp.address || '',
      departmentId: emp.departmentId || '',
      positionId: emp.positionId || '',
      status: emp.status,
    });
    setFormError(null);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý hồ sơ nhân viên</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách nhân sự toàn diện, quản trị vòng đời và phân bổ phòng ban
          </p>
        </div>

        {isHR && (
          <Button
            onClick={() => {
              setFormError(null);
              setShowCreateModal(true);
            }}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Thêm nhân viên mới
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã NV, họ tên, email, SĐT..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Tìm kiếm
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Phòng ban:</span>
          </div>
          <select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang làm việc</option>
            <option value="PROBATION">Thử việc</option>
            <option value="RESIGNED">Đã thôi việc</option>
          </select>
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Đang tải danh sách nhân viên..." />
        ) : employees.length === 0 ? (
          <EmptyState
            title="Không tìm thấy nhân viên"
            description="Không có nhân viên nào phù hợp với bộ lọc tìm kiếm hiện tại."
            actionLabel="Tải lại danh sách"
            onAction={fetchEmployees}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Mã & Họ tên</th>
                  <th className="py-3 px-4">Liên hệ</th>
                  <th className="py-3 px-4">Phòng ban & Vị trí</th>
                  <th className="py-3 px-4">Ngày vào làm</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {employees.map((emp) => {
                  const badge = getStatusBadge(emp.status);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0">
                            {emp.lastName ? emp.lastName.charAt(0) : 'E'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{emp.fullName}</p>
                            <p className="text-[11px] font-mono text-slate-400">{emp.employeeCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{emp.email}</span>
                          </p>
                          {emp.phone && (
                            <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{emp.phone}</span>
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{emp.department?.name || 'Chưa phân bổ'}</p>
                        <p className="text-[11px] text-slate-500">{emp.position?.name || '—'}</p>
                      </td>
                      <td className="py-3.5 px-4">{formatDateVN(emp.joinDate)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedEmp(emp);
                              setShowDetailModal(true);
                            }}
                            title="Xem chi tiết"
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isHR && (
                            <>
                              <button
                                onClick={() => openEditModal(emp)}
                                title="Chỉnh sửa"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {emp.status !== 'RESIGNED' && (
                                <button
                                  onClick={() => {
                                    setSelectedEmp(emp);
                                    setShowArchiveModal(true);
                                  }}
                                  title="Thôi việc nhân viên"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
          limit={10}
        />
      </div>

      {/* Modal Thêm Mới Nhân Viên */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Thêm nhân viên mới" maxWidth="xl">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ đệm *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                placeholder="Nguyễn Văn"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                placeholder="An"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email công việc *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                placeholder="an.nguyen@hrm.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                placeholder="0912345678"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng ban</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value="">-- Chọn phòng ban --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chức danh</label>
              <select
                value={formData.positionId}
                onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value="">-- Chọn chức danh --</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái làm việc</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value="ACTIVE">Đang làm việc</option>
                <option value="PROBATION">Thử việc</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Tạo hồ sơ
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Chỉnh Sửa Nhân Viên */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Cập nhật hồ sơ nhân viên" maxWidth="xl">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ đệm *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email công việc *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng ban</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value="">-- Chọn phòng ban --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chức danh</label>
              <select
                value={formData.positionId}
                onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value="">-- Chọn chức danh --</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Xem Chi Tiết */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Hồ sơ nhân viên chi tiết">
        {selectedEmp && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-lg">
                {selectedEmp.lastName.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedEmp.fullName}</h4>
                <p className="text-slate-400 font-mono">{selectedEmp.employeeCode}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-slate-400">Email công việc</p>
                <p className="font-medium text-slate-800">{selectedEmp.email}</p>
              </div>
              <div>
                <p className="text-slate-400">Số điện thoại</p>
                <p className="font-medium text-slate-800">{selectedEmp.phone || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400">Phòng ban</p>
                <p className="font-medium text-slate-800">{selectedEmp.department?.name || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400">Chức danh</p>
                <p className="font-medium text-slate-800">{selectedEmp.position?.name || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400">Ngày gia nhập</p>
                <p className="font-medium text-slate-800">{formatDateVN(selectedEmp.joinDate)}</p>
              </div>
              <div>
                <p className="text-slate-400">Trạng thái</p>
                <p className="font-medium text-slate-800">{getStatusBadge(selectedEmp.status).label}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setShowDetailModal(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Modal Thôi việc (Archive) */}
      <ConfirmModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchiveConfirm}
        title="Xác nhận thôi việc nhân viên"
        message={`Bạn có chắc chắn muốn chuyển trạng thái nhân viên ${selectedEmp?.fullName} (${selectedEmp?.employeeCode}) sang Đã thôi việc? Hành động này sẽ khóa tài khoản và lưu trữ lịch sử.`}
        confirmLabel="Xác nhận thôi việc"
        isLoading={isSubmitting}
      />
    </div>
  );
};
