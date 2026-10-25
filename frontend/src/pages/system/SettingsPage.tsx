import React, { useState, useEffect } from 'react';
import { Settings, Save, Check } from 'lucide-react';
import { api } from '../../services/api.js';
import { Button } from '../../components/common/Button.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/system/settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Lỗi lấy cấu hình:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      await api.patch('/system/settings', { key, value });
      setSaveSuccess(key);
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật cấu hình');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Cài đặt hệ thống & Chính sách tiền lương</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tùy chỉnh thông số thuế thu nhập, tỷ lệ trích nộp bảo hiểm và quy định thời gian làm việc
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Đang tải cấu hình hệ thống..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100">
          {settings.map((s) => (
            <div key={s.key} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="max-w-md">
                <p className="text-xs font-semibold text-slate-900 font-mono">{s.key}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.description || 'Chưa có mô tả'}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                  {s.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  defaultValue={s.value}
                  id={`input-${s.key}`}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 w-56 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <Button
                  onClick={() => {
                    const el = document.getElementById(`input-${s.key}`) as HTMLInputElement;
                    if (el) handleUpdate(s.key, el.value);
                  }}
                  variant="outline"
                  size="sm"
                  isLoading={savingKey === s.key}
                  icon={saveSuccess === s.key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
                >
                  {saveSuccess === s.key ? 'Đã lưu' : 'Lưu'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
