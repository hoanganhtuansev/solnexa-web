import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Lock,
  ShieldCheck,
  User,
  UserPlus,
  X
} from 'lucide-react';

export interface LoginUser {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  tier: string;
  isAdmin: boolean;
  avatar?: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: LoginUser) => void;
  currentUser?: LoginUser | null;
  defaultMode?: 'login' | 'register';
  gatedFeatureNotice?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultMode = 'login',
  gatedFeatureNotice
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regRole, setRegRole] = useState('エンジニア');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMode(defaultMode);
    setErrorMsg(null);
    try {
      const lastEmail = localStorage.getItem('solnexa_last_login_email');
      if (lastEmail) setEmail(lastEmail);
    } catch {}
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const submitAuth = async (endpoint: '/api/auth/login' | '/api/auth/register', payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success || !data?.user) {
        throw new Error(data?.error || '認証に失敗しました。');
      }
      try {
        localStorage.setItem('solnexa_last_login_email', data.user.email);
      } catch {}
      onLoginSuccess(data.user);
      setPassword('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || '認証に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('メールアドレスとパスワードを入力してください。');
      return;
    }
    submitAuth('/api/auth/login', {
      email: email.trim().toLowerCase(),
      password
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !regName.trim() || !password) {
      setErrorMsg('お名前、メールアドレス、パスワードを入力してください。');
      return;
    }
    if (password.length < 10) {
      setErrorMsg('パスワードは10文字以上で設定してください。');
      return;
    }
    submitAuth('/api/auth/register', {
      name: regName.trim(),
      email: email.trim().toLowerCase(),
      company: regCompany.trim(),
      role: regRole,
      password
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 transition-colors hover:text-slate-800"
          aria-label="閉じる"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-slate-100 pb-5">
          <div className="mb-4 flex h-11 w-11 items-center justify-center bg-slate-50 text-[#002b49]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-semibold tracking-[-0.02em] text-[#002b49]">
            {mode === 'login' ? 'SOLNEXA ログイン' : 'アカウント登録'}
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            {gatedFeatureNotice || '設計ツール・会員機能へのアクセス'}
          </p>
        </div>

        {errorMsg && (
          <div className="mt-5 flex items-start gap-2 border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="mt-6 space-y-5">
          {mode === 'register' && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">お名前</label>
                <input
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full border border-slate-300 px-3.5 py-3 text-sm outline-none transition-colors focus:border-[#002b49]"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">会社名</label>
                <input
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  className="w-full border border-slate-300 px-3.5 py-3 text-sm outline-none transition-colors focus:border-[#002b49]"
                  autoComplete="organization"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">役割</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition-colors focus:border-[#002b49]"
                >
                  <option value="エンジニア">エンジニア</option>
                  <option value="施工管理">施工管理</option>
                  <option value="発電事業者">発電事業者</option>
                  <option value="EPC・設計パートナー">EPC・設計パートナー</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">メールアドレス</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 py-3 pl-10 pr-3.5 text-sm outline-none transition-colors focus:border-[#002b49]"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              パスワード
              {mode === 'register' && <span className="ml-2 text-xs font-normal text-slate-400">10文字以上</span>}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={mode === 'register' ? 10 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 py-3 pl-10 pr-3.5 text-sm outline-none transition-colors focus:border-[#002b49]"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 bg-[#002b49] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#001d32] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mode === 'login' ? <ShieldCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {isSubmitting ? '処理中…' : mode === 'login' ? 'ログイン' : '登録する'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'login' ? 'register' : 'login'));
            setErrorMsg(null);
            setPassword('');
          }}
          className="mt-5 w-full text-center text-sm text-slate-500 transition-colors hover:text-[#002b49]"
        >
          {mode === 'login' ? '新規アカウントを登録' : 'ログイン画面へ戻る'}
        </button>
      </div>
    </div>
  );
};
