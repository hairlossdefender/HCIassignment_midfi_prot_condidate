
import React, { useState } from 'react';
import { SURVEY_QUESTIONS } from '../constants';
import { SurveyScores, UserExtendedProfile } from '../types';

interface UserProfileSetupProps {
  userName: string;
  onComplete: (profile: UserExtendedProfile, scores: SurveyScores) => void;
}

type SetupStep = 'basic' | 'investment' | 'survey';

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({ userName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('basic');
  const [profile, setProfile] = useState<Partial<UserExtendedProfile>>({});
  const [scores, setScores] = useState<SurveyScores>({
    impulsivity: 0,
    financialInterest: 0,
    comprehension: 0,
  });
  const [surveyStep, setSurveyStep] = useState(0);

  // 기본 정보 처리
  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('investment');
  };

  // 투자 성향 설문 처리
  const handleInvestmentPreference = (key: keyof UserExtendedProfile, value: any) => {
    setProfile({ ...profile, [key]: value });
  };

  const handleInvestmentSubmit = () => {
    setCurrentStep('survey');
  };

  // 기존 설문 처리
  const handleSurveyAnswer = (key: keyof SurveyScores, score: number) => {
    const newScores = { ...scores, [key]: score };
    setScores(newScores);

    if (surveyStep < SURVEY_QUESTIONS.length - 1) {
      setSurveyStep(surveyStep + 1);
    } else {
      onComplete(profile as UserExtendedProfile, newScores);
    }
  };

  const totalSteps = 3 + SURVEY_QUESTIONS.length;
  const currentStepNumber = currentStep === 'basic' ? 1 : currentStep === 'investment' ? 2 : 3 + surveyStep + 1;
  const progress = (currentStepNumber / totalSteps) * 100;

  // 기본 정보 입력
  if (currentStep === 'basic') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
        <div className="w-full max-w-2xl bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-primary dark:text-brand-primary-light mb-2">
              프로필 설정
            </h1>
            <p className="text-on-surface-secondary dark:text-on-surface-secondary">
              {userName}님의 기본 정보를 알려주세요.
            </p>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-brand-primary dark:bg-brand-primary-light h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-right text-sm text-on-surface-secondary dark:text-on-surface-secondary mt-2">
              {currentStepNumber} / {totalSteps}
            </p>
          </div>

          <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                나이
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={profile.age || ''}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                placeholder="나이를 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                성별
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['male', 'female', 'other'] as const).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setProfile({ ...profile, gender })}
                    className={`p-4 border rounded-lg transition-colors ${
                      profile.gender === gender
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-background-light dark:bg-background-dark border-border-color-light dark:border-border-color-dark text-on-surface dark:text-on-surface hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {gender === 'male' ? '남성' : gender === 'female' ? '여성' : '기타'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                직업
              </label>
              <input
                type="text"
                value={profile.occupation || ''}
                onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                placeholder="직업을 입력하세요 (예: 학생, 회사원, 주부 등)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                소득 수준
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setProfile({ ...profile, incomeLevel: level })}
                    className={`p-4 border rounded-lg transition-colors ${
                      profile.incomeLevel === level
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-background-light dark:bg-background-dark border-border-color-light dark:border-border-color-dark text-on-surface dark:text-on-surface hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {level === 'low' ? '낮음' : level === 'medium' ? '보통' : '높음'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                고정 수입 (월)
              </label>
              <input
                type="number"
                min="0"
                value={profile.fixedIncome || ''}
                onChange={(e) => setProfile({ ...profile, fixedIncome: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                placeholder="월 고정 수입을 입력하세요 (원)"
                required
              />
              <p className="text-xs text-on-surface-secondary dark:text-on-surface-secondary mt-1">
                이 정보는 거래 내역에 자동으로 반영됩니다.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-lg transition-colors duration-200"
            >
              다음
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 투자 성향 설문
  if (currentStep === 'investment') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
        <div className="w-full max-w-2xl bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-primary dark:text-brand-primary-light mb-2">
              투자 성향 파악
            </h1>
            <p className="text-on-surface-secondary dark:text-on-surface-secondary">
              투자에 대한 기본 정보를 알려주세요.
            </p>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-brand-primary dark:bg-brand-primary-light h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-right text-sm text-on-surface-secondary dark:text-on-surface-secondary mt-2">
              {currentStepNumber} / {totalSteps}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-4">
                투자 경험
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['none', 'beginner', 'intermediate', 'advanced'] as const).map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => handleInvestmentPreference('investmentExperience', exp)}
                    className={`p-4 border rounded-lg transition-colors ${
                      profile.investmentExperience === exp
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-background-light dark:bg-background-dark border-border-color-light dark:border-border-color-dark text-on-surface dark:text-on-surface hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {exp === 'none' ? '없음' : exp === 'beginner' ? '초보' : exp === 'intermediate' ? '중급' : '고급'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-4">
                투자 목표
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['profit', 'stability', 'balanced'] as const).map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleInvestmentPreference('investmentGoal', goal)}
                    className={`p-4 border rounded-lg transition-colors ${
                      profile.investmentGoal === goal
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-background-light dark:bg-background-dark border-border-color-light dark:border-border-color-dark text-on-surface dark:text-on-surface hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {goal === 'profit' ? '수익성' : goal === 'stability' ? '안정성' : '균형'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-4">
                투자 기간
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['short', 'medium', 'long'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => handleInvestmentPreference('investmentPeriod', period)}
                    className={`p-4 border rounded-lg transition-colors ${
                      profile.investmentPeriod === period
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-background-light dark:bg-background-dark border-border-color-light dark:border-border-color-dark text-on-surface dark:text-on-surface hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {period === 'short' ? '단기 (1년 이하)' : period === 'medium' ? '중기 (1-5년)' : '장기 (5년 이상)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                월 저축액 (선택)
              </label>
              <input
                type="number"
                min="0"
                value={profile.savingsAmount || ''}
                onChange={(e) => setProfile({ ...profile, savingsAmount: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                placeholder="월 저축액을 입력하세요 (원)"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep('basic')}
                className="flex-1 py-3 border border-border-color-light dark:border-border-color-dark text-on-surface dark:text-on-surface font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleInvestmentSubmit}
                disabled={!profile.investmentExperience || !profile.investmentGoal || !profile.investmentPeriod}
                className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 기존 설문 (충동성, 금융 관심도, 이해도)
  const currentQuestion = SURVEY_QUESTIONS[surveyStep];
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
      <div className="w-full max-w-2xl bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-brand-primary dark:text-brand-primary-light mb-2">
            금융 성향 파악
          </h1>
          <p className="text-on-surface-secondary dark:text-on-surface-secondary">
            AI가 당신의 성향을 파악하여 최고의 금융 파트너가 되어드릴게요.
          </p>
        </div>

        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-brand-primary dark:bg-brand-primary-light h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-right text-sm text-on-surface-secondary dark:text-on-surface-secondary mt-2">
            {currentStepNumber} / {totalSteps}
          </p>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-on-surface dark:text-on-surface mb-8">
            {currentQuestion.question}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSurveyAnswer(currentQuestion.key as keyof SurveyScores, option.score)}
                className="w-full p-4 text-left bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-brand-primary/10 dark:hover:bg-brand-primary-light/10 hover:border-brand-primary dark:hover:border-brand-primary-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <p className="font-medium text-on-surface dark:text-on-surface">{option.text}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSetup;

