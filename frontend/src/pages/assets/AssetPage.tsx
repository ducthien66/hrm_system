import React, { useState, useEffect } from 'react';
import { Plus, Laptop, UserCheck, ArrowLeftRight } from 'lucide-react';
import { api } from '../../services/api.js';
import { Asset, Employee } from '../../types/index.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { formatVND, getStatusBadge } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.js';

export const AssetPage: React.FC = () => {
  const { isHR } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal new asset
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('LAPTOP');
  const [cost, setCost] = useState(25000000);

  // Modal assign
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const [assetsRes, empsRes]: any = await Promise.all([
        api.get('/assets'),
        api.get('/employees?limit=100'),
      ]);
      setAssets(assetsRes.data);
      setEmployees(empsRes.data);
      if (empsRes.data.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(empsRes.data[0].id);
      }
    } catch (err) {
      console.error('Lỗi lấy tài sản:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assets', { code, name, category, cost: Number(cost) });
      setShowCreateModal(false);
      setCode('');
      setName('');
      fetchAssets();
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm tài sản');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      await api.post(`/assets/${selectedAsset.id}/assign`, {
        employeeId: selectedEmployeeId,
      });
      setShowAssignModal(false);
      fetchAssets();
    } catch (err: any) {
      alert(err.message || 'Lỗi cấp phát tài sản');
    }
  };

  const handleReturn = async (assetId: string) => {
    if (!confirm('Xác nhận thu hồi tài sản này về kho?')) return;
    try {
      await api.post(`/assets/${assetId}/return`);
      fetchAssets();
    } catch (err: any) {
      alert(err.message || 'Lỗi thu hồi tài sản');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý tài sản & Thiết bị cấp phát</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi trang thiết bị làm việc, quy trình bàn giao và thu hồi khi nhân sự thôi việc
          </p>
        </div>
        {isHR && (
          <Button onClick={() => setShowCreateModal(true)} variant="primary" icon={<Plus className="w-4 h-4" />}>
            Thêm tài sản mới
          </Button>
        )}
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <LoadingSpinner message="Đang tải danh mục tài sản..." />
      ) : assets.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
          Chưa có tài sản nào được đăng ký trong hệ thống.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assets.map((ast) => {
            const badge = getStatusBadge(ast.status);
            const currentAssignment = ast.assignments && ast.assignments.length > 0 ? ast.assignments[0] : null;

            return (
              <div
                key={ast.id}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
                      <Laptop className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  <span className="font-mono text-xs font-semibold text-slate-400">{ast.code}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5 mb-1">{ast.name}</h3>
                  <p className="text-xs font-mono font-semibold text-brand-600 mb-4">{formatVND(ast.cost)}</p>

                  <div className="border-t border-slate-100 pt-3 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Đang cấp phát cho:</span>
                      <span className="font-semibold text-slate-800">
                        {currentAssignment?.employee ? currentAssignment.employee.fullName : 'Trong kho'}
                      </span>
                    </div>
                  </div>
                </div>

                {isHR && (
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    {ast.status === 'AVAILABLE' ? (
                      <Button
                        onClick={() => {
                          setSelectedAsset(ast);
                          setShowAssignModal(true);
                        }}
                        variant="outline"
                        size="sm"
                        icon={<UserCheck className="w-3.5 h-3.5" />}
                      >
                        Bàn giao cho NV
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleReturn(ast.id)}
                        variant="secondary"
                        size="sm"
                        icon={<ArrowLeftRight className="w-3.5 h-3.5 text-rose-600" />}
                      >
                        Thu hồi về kho
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Thêm tài sản */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Thêm tài sản mới">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mã tài sản *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: AST-LAP-003"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên thiết bị *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Dell UltraSharp 27 inch 4K"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loại tài sản</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value="LAPTOP">Máy tính xách tay</option>
                <option value="MONITOR">Màn hình</option>
                <option value="ACCESS_CARD">Thẻ ra vào</option>
                <option value="VEHICLE">Xe công vụ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giá trị nguyên giá (VND)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Lưu tài sản
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Bàn giao tài sản */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Bàn giao tài sản cho nhân viên">
        <form onSubmit={handleAssign} className="space-y-4">
          <p className="text-xs text-slate-500">
            Thiết bị: <span className="font-semibold text-slate-800">{selectedAsset?.name}</span> ({selectedAsset?.code})
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nhân viên tiếp nhận *</label>
            <select
              required
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowAssignModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Xác nhận bàn giao
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
