import React, { useState, useEffect } from 'react';
import { Plus, UserPlus, Briefcase, CheckCircle, Mail, Phone } from 'lucide-react';
import { api } from '../../services/api.js';
import { JobPosting, Candidate } from '../../types/index.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { formatVND, formatDateVN, getStatusBadge } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.js';

export const RecruitmentPage: React.FC = () => {
  const { isHR } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal new job
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [salaryMin, setSalaryMin] = useState(15000000);
  const [salaryMax, setSalaryMax] = useState(25000000);

  // Modal new candidate
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  const fetchRecruitment = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, candRes]: any = await Promise.all([
        api.get('/recruitment/jobs'),
        api.get('/recruitment/candidates'),
      ]);
      setJobs(jobsRes.data);
      setCandidates(candRes.data);
      if (jobsRes.data.length > 0 && !selectedJobId) {
        setSelectedJobId(jobsRes.data[0].id);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu tuyển dụng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruitment();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/recruitment/jobs', {
        title: jobTitle,
        quantity: Number(quantity),
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
      });
      setShowJobModal(false);
      setJobTitle('');
      fetchRecruitment();
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo tin tuyển dụng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/recruitment/candidates', {
        fullName: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        jobPostingId: selectedJobId || null,
      });
      setShowCandidateModal(false);
      setCandidateName('');
      setCandidateEmail('');
      setCandidatePhone('');
      fetchRecruitment();
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm hồ sơ ứng viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToEmployee = async (candidateId: string) => {
    if (!confirm('Xác nhận chuyển ứng viên này thành nhân viên chính thức của công ty?')) return;
    try {
      await api.post(`/recruitment/candidates/${candidateId}/convert-to-employee`);
      alert('Chuyển đổi thành công! Hồ sơ nhân viên đã được tạo và kích hoạt trong hệ thống.');
      fetchRecruitment();
    } catch (err: any) {
      alert(err.message || 'Lỗi chuyển đổi ứng viên');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản trị tuyển dụng & Thu hút nhân tài</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị vị trí tuyển dụng, theo dõi phỏng vấn và tiếp nhận nhân sự mới
          </p>
        </div>
        {isHR && (
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowJobModal(true)} variant="outline" size="sm" icon={<Briefcase className="w-4 h-4" />}>
              Đăng tin tuyển dụng
            </Button>
            <Button onClick={() => setShowCandidateModal(true)} variant="primary" size="sm" icon={<UserPlus className="w-4 h-4" />}>
              Tiếp nhận ứng viên
            </Button>
          </div>
        )}
      </div>

      {/* Jobs Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Đang mở tuyển ({job.quantity} chỉ tiêu)
                </span>
                <span className="text-[11px] text-slate-400">{formatDateVN(job.createdAt)}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{job.title}</h3>
              <p className="text-xs font-mono text-brand-600 font-semibold">
                {formatVND(job.salaryMin)} - {formatVND(job.salaryMax)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Hồ sơ đã nộp: {job._count?.candidates || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Danh sách ứng viên ứng tuyển ({candidates.length} ứng viên)
          </h3>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Đang tải danh sách ứng viên..." />
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">Chưa có ứng viên nào ứng tuyển.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Họ và tên ứng viên</th>
                  <th className="py-3 px-4">Liên hệ</th>
                  <th className="py-3 px-4">Vị trí ứng tuyển</th>
                  <th className="py-3 px-4">Ngày nộp hồ sơ</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{c.fullName}</td>
                    <td className="py-3.5 px-4">
                      <p className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{c.email}</span>
                      </p>
                      {c.phone && (
                        <p className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{c.jobPosting?.title || 'Ứng tuyển tự do'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDateVN(c.createdAt)}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isHR && c.status !== 'HIRED' && (
                        <Button
                          onClick={() => handleConvertToEmployee(c.id)}
                          variant="outline"
                          size="sm"
                          icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                        >
                          Chuyển thành nhân viên
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Đăng tin */}
      <Modal isOpen={showJobModal} onClose={() => setShowJobModal(false)} title="Đăng tin tuyển dụng mới">
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề vị trí *</label>
            <input
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="VD: Senior Backend Engineer (Node.js)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số lượng</label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lương tối thiểu</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lương tối đa</label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowJobModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Đăng tuyển
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Thêm Ứng Viên */}
      <Modal isOpen={showCandidateModal} onClose={() => setShowCandidateModal(false)} title="Thêm hồ sơ ứng viên">
        <form onSubmit={handleCreateCandidate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên ứng viên *</label>
            <input
              type="text"
              required
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="VD: Trần Quốc Tuấn"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="ungvien@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={candidatePhone}
                onChange={(e) => setCandidatePhone(e.target.value)}
                placeholder="0988776655"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Vị trí ứng tuyển</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowCandidateModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Lưu ứng viên
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
