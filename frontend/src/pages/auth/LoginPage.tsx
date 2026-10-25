import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../../components/common/Button.js';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@hrm.com');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-brand-500/25 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">HỆ THỐNG QUẢN LÝ NHÂN SỰ</h2>
          <p className="text-xs text-slate-500 mt-1">Đăng nhập tài khoản doanh nghiệp (HRM Enterprise)</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email công việc</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten.nhanvien@hrm.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Mật khẩu</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full py-2.5 mt-2" isLoading={isLoading} icon={<ArrowRight className="w-4 h-4" />}>
            Đăng nhập hệ thống
          </Button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Tài khoản thử nghiệm nhanh (Mật khẩu: Password@123)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@hrm.com')}
              className="p-2 text-left bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200 rounded-xl transition-all"
            >
              <p className="font-semibold text-slate-800">👑 Super Admin</p>
              <p className="text-[10px] text-slate-500 truncate">admin@hrm.com</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('hr.manager@hrm.com')}
              className="p-2 text-left bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200 rounded-xl transition-all"
            >
              <p className="font-semibold text-slate-800">👥 HR Manager</p>
              <p className="text-[10px] text-slate-500 truncate">hr.manager@hrm.com</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('accountant@hrm.com')}
              className="p-2 text-left bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200 rounded-xl transition-all"
            >
              <p className="font-semibold text-slate-800">💼 Accountant</p>
              <p className="text-[10px] text-slate-500 truncate">accountant@hrm.com</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('dept.manager@hrm.com')}
              className="p-2 text-left bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200 rounded-xl transition-all"
            >
              <p className="font-semibold text-slate-800">🏢 Dept Manager</p>
              <p className="text-[10px] text-slate-500 truncate">dept.manager@hrm.com</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('employee@hrm.com')}
              className="col-span-2 p-2 text-left bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200 rounded-xl transition-all"
            >
              <p className="font-semibold text-slate-800">👤 Nhân viên (Employee)</p>
              <p className="text-[10px] text-slate-500 truncate">employee@hrm.com</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
