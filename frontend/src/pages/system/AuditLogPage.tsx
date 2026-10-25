import React, { useState, useEffect } from 'react';
import { History, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api.js';
import { AuditLog } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Pagination } from '../../components/common/Pagination.js';
import { formatDateTimeVN } from '../../utils/format.js';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/system/audit-logs', { params: { page, limit: 15 } });
      setLogs(res.data);
      if (res.meta) {
        setTotalPages(res.meta.totalPages);
        setTotalItems(res.meta.total);
      }
    } catch (err) {
      console.error('Lỗi tải nhật ký kiểm toán:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Nhật ký hoạt động hệ thống (Audit Trail)</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Ghi nhận toàn bộ thao tác quan trọng, phục vụ công tác an toàn thông tin và kiểm toán độc lập
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-brand-600" />
            <span>Dòng thời gian hoạt động</span>
          </h3>
          <span className="text-xs text-slate-400">Tổng cộng: {totalItems} bản ghi</span>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Đang tải nhật ký hoạt động..." />
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">Chưa có nhật ký hoạt động nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                  <th className="py-3 px-4">Hành động</th>
                  <th className="py-3 px-4">Thực thể</th>
                  <th className="py-3 px-4">Địa chỉ IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-sans text-slate-500">{formatDateTimeVN(log.createdAt)}</td>
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-900">
                      {log.user?.employee?.fullName || log.user?.email || 'Hệ thống'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{log.entityType}</td>
                    <td className="py-3.5 px-4 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} limit={15} />
      </div>
    </div>
  );
};
