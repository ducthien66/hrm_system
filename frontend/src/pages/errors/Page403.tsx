import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button.js';

export const Page403: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-rose-50 text-rose-600 rounded-3xl mb-4 border border-rose-100">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">403 - Quyền truy cập bị từ chối</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
        Tài khoản của bạn không được phân quyền để truy cập vào tài nguyên hoặc chức năng này.
      </p>
      <Button onClick={() => navigate('/dashboard')} variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
        Về trang tổng quan
      </Button>
    </div>
  );
};

export const Page404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-black text-slate-200 mb-2">404</h1>
      <h2 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy trang yêu cầu</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
        Địa chỉ trang web bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển sang phân hệ khác.
      </p>
      <Button onClick={() => navigate('/dashboard')} variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
        Về trang tổng quan
      </Button>
    </div>
  );
};
