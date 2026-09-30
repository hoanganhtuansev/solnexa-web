import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  LogIn, 
  UserPlus, 
  X, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Clock
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
  currentUser,
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
  
  // Last logged in suggestion
  const [lastAccount, setLastAccount] = useState<{ email: string; name: string; isAdmin: boolean }>(() => {
    try {
      const saved = localStorage.getItem('solnexa_last_account');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      email: 'hoanganhtuan.solnexa@gmail.com',
      name: 'Hoàng Anh Tuấn (サイト管理者・CTO)',
      isAdmin: true
    };
  });

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUseSuggestedAccount = () => {
    setEmail(lastAccount.email);
    setPassword('Hoangtuan26');
    setErrorMsg(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('メールアドレスを入力してください。');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'hoanganhtuan.solnexa@gmail.com' || cleanEmail === 'admin@solnexa.co.jp' || cleanEmail.includes('admin');

    const loggedInUser: LoginUser = {
      id: isAdmin ? 'user-admin' : `user-${Date.now().toString(36)}`,
      name: isAdmin ? 'Hoàng Anh Tuấn (サイト管理者・CTO)' : cleanEmail.split('@')[0],
      role: isAdmin ? '代表 / 最高技術責任者・サイト全権管理者' : 'エンジニア / 設計パートナー',
      company: isAdmin ? '株式会社ソルネクサ (SOLNEXA Japan)' : '会員企業',
      email: cleanEmail,
      tier: isAdmin ? 'Super Administrator' : 'Standard Member',
      isAdmin,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    };

    // Save as last account for quick suggestion next time
    try {
      localStorage.setItem('solnexa_last_account', JSON.stringify({
        email: cleanEmail,
        name: loggedInUser.name,
        isAdmin
      }));
    } catch {}

    onLoginSuccess(loggedInUser);
    setIsSubmitting(false);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !regName.trim()) {
      setErrorMsg('お名前とメールアドレスを入力してください。');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'hoanganhtuan.solnexa@gmail.com' || cleanEmail.includes('admin');

    const newUser: LoginUser = {
      id: `user-${Date.now().toString(36)}`,
      name: regName.trim(),
      role: regRole,
      company: regCompany.trim() || 'SOLNEXA パートナー企業',
      email: cleanEmail,
      tier: isAdmin ? 'Super Administrator' : 'Standard Member',
      isAdmin,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    };

    try {
      localStorage.setItem('solnexa_last_account', JSON.stringify({
        email: cleanEmail,
        name: newUser.name,
        isAdmin
      }));
    } catch {}

    onLoginSuccess(newUser);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
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
            
            {/* Suggested / Last Logged In Account */}
            {lastAccount && (
              <div className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>前回ログインしたアカウント（ gợi ý tài khoản ）:</span>
                  </span>
                  {lastAccount.isAdmin && (
                    <span className="text-[10px] font-extrabold bg-[#d81a28] text-white px-1.5 py-0.2 rounded">
                      管理者
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{lastAccount.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{lastAccount.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseSuggestedAccount}
                    className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white text-[#002b49] text-xs font-bold rounded-lg border border-slate-300 hover:border-blue-600 shadow-2xs transition-all cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <span>自動入力</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </button>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                メールアドレス <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="hoanganhtuan.solnexa@gmail.com"
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
                <span className="text-[11px] text-slate-400 font-mono">
                  (管理者初期: Hoangtuan26)
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
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
              className="w-full py-2.5 px-4 bg-[#002b49] hover:bg-[#001c30] active:scale-98 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>ログイン</span>
            </button>

            {/* Switch to Register */}
            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(null); }}
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
              <input
                type="text"
                required
                placeholder="例: 山田 太郎"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                貴社名 / 所属
              </label>
              <input
                type="text"
                placeholder="例: 株式会社エナジー開発"
                value={regCompany}
                onChange={(e) => setRegCompany(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                メールアドレス <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="t.yamada@example.co.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#d81a28] hover:bg-[#b51420] active:scale-98 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>アカウントを作成してログイン</span>
            </button>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); }}
                className="text-xs text-slate-500 hover:text-[#002b49] font-medium transition-colors cursor-pointer"
              >
                既にアカウントをお持ちの方は <span className="font-bold text-[#002b49] underline">ログイン</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
