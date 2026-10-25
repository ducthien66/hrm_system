import React, { useState, useEffect } from 'react';
import { Plus, Building2, Users } from 'lucide-react';
import { api } from '../../services/api.js';
import { Department } from '../../types/index.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { formatDateVN } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.js';

export const DepartmentListPage: React.FC = () => {
  const { isHR } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách phòng ban:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post('/departments', { code, name, description });
      setShowCreateModal(false);
      setCode('');
      setName('');
      setDescription('');
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || 'Lỗi thêm mới phòng ban');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý phòng ban</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cơ cấu tổ chức doanh nghiệp, định biên nhân sự và quản lý trưởng bộ phận
          </p>
        </div>
        {isHR && (
          <Button
            onClick={() => {
              setError(null);
              setShowCreateModal(true);
            }}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Thêm phòng ban mới
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Đang tải danh sách phòng ban..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                    {dept.code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{dept.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {dept.description || 'Chưa có mô tả chức năng nhiệm vụ.'}
                </p>

                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Trưởng bộ phận:</span>
                    <span className="font-medium text-slate-800">
                      {dept.manager ? dept.manager.fullName : 'Chưa bổ nhiệm'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Ngày thành lập:</span>
                    <span>{formatDateVN(dept.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                  <Users className="w-3.5 h-3.5" />
                  <span>{dept.headcount || 0} nhân sự</span>
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">● Đang hoạt động</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm Mới Phòng Ban */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Thêm mới phòng ban">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mã phòng ban *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: MKT, RND, FIN"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên phòng ban *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Phòng Tiếp thị số & Truyền thông"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả chức năng</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả phạm vi trách nhiệm và mục tiêu hoạt động"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Tạo phòng ban
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
