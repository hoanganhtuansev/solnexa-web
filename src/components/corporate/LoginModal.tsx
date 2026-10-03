import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  LogIn, 
  UserPlus, 
  X, 
  ShieldCheck, 
  AlertCircle,
  Building2,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  modalBackdropVariants, 
  modalCardVariants,
  reducedModalBackdropVariants,
  reducedModalCardVariants 
} from '../../utils/motionConfig';

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
  currentUser: _currentUser,
  defaultMode = 'login',
  gatedFeatureNotice
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  
  // Login form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register inputs
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regRole, setRegRole] = useState('EPCエンジニア');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setPassword('');
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('メールアドレスとパスワードを入力してください。');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok || !data || !data.success) {
        if (!data) {
          throw new Error('サーバーが起動中または応答していません。数秒後に再度お試しください。');
        }
        throw new Error(data.message || data.error || 'メールアドレスまたはパスワードが正しくありません。');
      }

      onLoginSuccess(data.user);
      setPassword('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'ログイン中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !regName.trim() || !password) {
      setErrorMsg('お名前、メールアドレス、パスワードを入力してください。');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('パスワードは6文字以上で設定してください。');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: regName.trim(),
          email: email.trim(),
          company: regCompany.trim() || '一般会員',
          role: regRole,
          password
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok || !data || !data.success) {
        if (!data) {
          throw new Error('サーバーが起動中または応答していません。数秒後に再度お試しください。');
        }
        throw new Error(data.message || data.error || '登録処理に失敗しました。');
      }

      onLoginSuccess(data.user);
      setPassword('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '登録中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          variants={shouldReduceMotion ? reducedModalBackdropVariants : modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans"
          onClick={onClose}
        >
          <motion.div 
            variants={shouldReduceMotion ? reducedModalCardVariants : modalCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="閉じる"
            >
              <X className="w-5 h-5" />
            </button>

        {/* Header */}
        <div className="text-center space-y-2 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 bg-blue-50 text-[#002b49] rounded-xl flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-[#002b49]" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            {mode === 'login' ? 'SOLNEXA ログイン' : '新規アカウント登録'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {gatedFeatureNotice ? (
              <span className="text-[#d81a28] font-bold block bg-rose-50 border border-rose-200 p-2 rounded-md">
                {gatedFeatureNotice}
              </span>
            ) : (
              '設計ツールの高度機能・仕様書データ・サイト管理機能へのアクセス'
            )}
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="mt-4 space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                メールアドレス <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="name@example.co.jp"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  パスワード <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="パスワードを入力してください"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#002b49] hover:bg-[#001c30] active:scale-98 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? '認証中...' : 'ログイン'}</span>
            </button>

            {/* Switch to Register */}
            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(null); setPassword(''); }}
                className="text-xs text-slate-500 hover:text-[#002b49] font-medium transition-colors cursor-pointer"
              >
                アカウントをお持ちでない方は <span className="font-bold text-[#d81a28] underline">新規登録（無料）</span>
              </button>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                お名前 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="例: 山田 太郎"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                貴社名 / 所属
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="例: 株式会社エナジー開発"
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white transition-all"
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                職種 / 役職
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="例: EPCエンジニア"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white transition-all"
                />
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                メールアドレス <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="t.yamada@example.co.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                パスワード (6文字以上) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#d81a28] hover:bg-[#b51420] active:scale-98 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? '登録中...' : 'アカウントを作成してログイン'}</span>
            </button>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); setPassword(''); }}
                className="text-xs text-slate-500 hover:text-[#002b49] font-medium transition-colors cursor-pointer"
              >
                既にアカウントをお持ちの方は <span className="font-bold text-[#002b49] underline">ログイン</span>
              </button>
            </div>
          </form>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
