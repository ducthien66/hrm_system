export function formatVND(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function formatDateVN(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTimeVN(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Đang làm việc', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'PROBATION':
      return { label: 'Thử việc', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'RESIGNED':
      return { label: 'Đã thôi việc', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'SUSPENDED':
      return { label: 'Tạm hoãn', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    case 'NORMAL':
      return { label: 'Đúng giờ', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'LATE':
      return { label: 'Đi muộn', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'EARLY':
      return { label: 'Về sớm', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'PENDING':
      return { label: 'Chờ duyệt', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'APPROVED':
      return { label: 'Đã duyệt', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'REJECTED':
      return { label: 'Từ chối', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'LOCKED':
      return { label: 'Đã khóa', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'AVAILABLE':
      return { label: 'Sẵn sàng', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'ASSIGNED':
      return { label: 'Đã cấp phát', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    default:
      return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}
