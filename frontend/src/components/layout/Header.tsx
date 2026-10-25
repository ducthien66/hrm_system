import React, { useState, useEffect } from 'react';
import { Bell, Search, LogOut, Lock, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Modal } from '../common/Modal.js';
import { Button } from '../common/Button.js';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res: any = await api.get('/system/notifications');
        setNotifications(res.data || []);
      } catch {
        // Ignore
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/system/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Ignore
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    setIsChangingPass(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Lỗi đổi mật khẩu' });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Bar */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm nhân viên, phòng ban..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-900">Thông báo hệ thống</h4>
                <span className="text-[10px] text-slate-400">{unreadCount} chưa đọc</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 text-center">Không có thông báo mới</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                        !n.isRead ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-800">{n.title}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{n.message}</p>
                      </div>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800">{user?.employee?.fullName || user?.email}</p>
            <p className="text-[11px] text-slate-500">{user?.role.name}</p>
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            title="Đổi mật khẩu"
            className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
          >
            <Lock className="w-4 h-4" />
          </button>

          <button
            onClick={logout}
            title="Đăng xuất"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Đổi mật khẩu */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Đổi mật khẩu tài khoản">
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {passwordMsg.type === 'success' && <Check className="w-4 h-4" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mật khẩu mới (Tối thiểu 6 ký tự)</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowPasswordModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isChangingPass}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>
    </header>
  );
};
