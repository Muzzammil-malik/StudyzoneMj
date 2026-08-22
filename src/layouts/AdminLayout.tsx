import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { contentService } from '../services/contentService';
import { supabase } from '../lib/supabase';
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
  const [sessionReady, setSessionReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted && session) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        setIsAdmin(profile?.role === 'admin');
      }
      if (mounted) setSessionReady(true);
    };
    loadSession();
    const { data: listener } = supabase.auth.onAuthStateChange(() => { loadSession(); });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSigningIn(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError('Unable to sign in with those credentials.');
    setIsSigningIn(false);
  };

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
  }, [isAdmin]);

  if (!sessionReady) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">Checking admin session...</div>;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <form onSubmit={signIn} className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div><h1 className="font-serif text-2xl font-bold text-slate-900">Admin sign in</h1><p className="text-xs text-slate-500 mt-1">Use an authorized StudyZone administrator account.</p></div>
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          {authError && <p className="text-xs text-rose-600">{authError}</p>}
          <button disabled={isSigningIn} className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50">{isSigningIn ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </div>
    );
  }

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
