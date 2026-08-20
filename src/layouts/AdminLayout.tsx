import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { contentService } from '../services/contentService';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
  refreshStats: () => Promise<void>;
  unreadFeedbackCount: number;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useAdmin = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminLayout');
  return ctx;
};

export const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const fetchUnreadFeedback = async () => {
    try {
      const stats = await contentService.getDashboardStats();
      setUnreadFeedbackCount(stats.unreadFeedback);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchUnreadFeedback();
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider
      value={{
        toast,
        refreshStats: fetchUnreadFeedback,
        unreadFeedbackCount,
      }}
    >
      <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 font-sans">
        {/* Main Body */}
        <div className="flex-1 flex h-screen overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block h-full shrink-0">
            <AdminSidebar unreadFeedbackCount={unreadFeedbackCount} />
          </div>

          {/* Mobile Sidebar Overlay */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Mobile Sidebar Drawer */}
          <div
            className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:hidden ${
              isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <AdminSidebar
              unreadFeedbackCount={unreadFeedbackCount}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            <AdminTopbar
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            />

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto space-y-6">
                <Outlet />
              </div>
            </main>
          </div>
        </div>

        {/* Toast Container */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border text-xs flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-150 ${
                t.type === 'success'
                  ? 'bg-emerald-900 text-white border-emerald-800'
                  : t.type === 'error'
                  ? 'bg-rose-900 text-white border-rose-800'
                  : 'bg-slate-900 text-white border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                {t.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
                <span className="font-medium leading-relaxed truncate">{t.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 hover:bg-white/20 rounded cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};
