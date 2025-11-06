
import React, { useState } from 'react';
import { SURVEY_QUESTIONS } from '../constants';
import { SurveyScores } from '../types';

interface SurveyProps {
  onComplete: (scores: SurveyScores) => void;
}

const Survey: React.FC<SurveyProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<SurveyScores>({
    impulsivity: 0,
    financialInterest: 0,
    comprehension: 0,
  });

  const handleAnswer = (key: keyof SurveyScores, score: number) => {
    const newScores = { ...scores, [key]: score };
    setScores(newScores);

    if (currentStep < SURVEY_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(newScores);
    }
  };

  const currentQuestion = SURVEY_QUESTIONS[currentStep];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
      <div className="w-full max-w-2xl bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl p-8 transition-all duration-300">
        <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-primary dark:text-brand-primary-light mb-2">금융 AI 에이전트</h1>
            <p className="text-on-surface-secondary dark:text-on-surface-secondary">AI가 당신의 성향을 파악하여 최고의 금융 파트너가 되어드릴게요.</p>
        </div>
        
        <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                    className="bg-brand-primary dark:bg-brand-primary-light h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${((currentStep + 1) / SURVEY_QUESTIONS.length) * 100}%` }}
                ></div>
            </div>
            <p className="text-right text-sm text-on-surface-secondary dark:text-on-surface-secondary mt-2">{currentStep + 1} / {SURVEY_QUESTIONS.length}</p>
        </div>

        <div className="text-center">
            <h2 className="text-xl font-semibold text-on-surface dark:text-on-surface mb-8">{currentQuestion.question}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
                <button
                key={index}
                onClick={() => handleAnswer(currentQuestion.key as keyof SurveyScores, option.score)}
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

export default Survey;
