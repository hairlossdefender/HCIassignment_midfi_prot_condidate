
import React, { useState } from 'react';
import { User, UserExtendedProfile } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onSignup: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignup }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignup) {
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }
      if (password.length < 6) {
        setError('비밀번호는 6자 이상이어야 합니다.');
        return;
      }
      if (!name.trim()) {
        setError('이름을 입력해주세요.');
        return;
      }

      // 회원가입 처리 (localStorage 사용)
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        createdAt: new Date().toISOString(),
      };

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.find((u: User) => u.email === email)) {
        setError('이미 등록된 이메일입니다.');
        return;
      }

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      onSignup(newUser);
    } else {
      // 로그인 처리
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email);
      
      if (!user) {
        setError('등록되지 않은 이메일입니다.');
        return;
      }

      // 실제로는 비밀번호 검증이 필요하지만, MVP에서는 이메일만 확인
      localStorage.setItem('currentUser', JSON.stringify(user));
      onLogin(user);
    }
  };

  const handleSocialLogin = (provider: 'kakao' | 'naver') => {
    // 소셜 로그인 UI만 구현 (실제 연동은 향후)
    alert(`${provider === 'kakao' ? '카카오' : '네이버'} 로그인은 준비 중입니다.`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
      <div className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-primary-light mb-2">
            금융 AI 에이전트
          </h1>
          <p className="text-on-surface-secondary dark:text-on-surface-secondary">
            {isSignup ? '새 계정을 만들어 시작하세요' : '로그인하여 시작하세요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                placeholder="이름을 입력하세요"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-lg transition-colors duration-200"
          >
            {isSignup ? '회원가입' : '로그인'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-color-light dark:border-border-color-dark"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface-light dark:bg-surface-dark text-on-surface-secondary dark:text-on-surface-secondary">
                또는
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin('kakao')}
              className="flex items-center justify-center px-4 py-3 border border-border-color-light dark:border-border-color-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-sm font-medium text-on-surface dark:text-on-surface">카카오 로그인</span>
            </button>
            <button
              onClick={() => handleSocialLogin('naver')}
              className="flex items-center justify-center px-4 py-3 border border-border-color-light dark:border-border-color-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-sm font-medium text-on-surface dark:text-on-surface">네이버 로그인</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            className="text-sm text-brand-primary dark:text-brand-primary-light hover:underline"
          >
            {isSignup ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

