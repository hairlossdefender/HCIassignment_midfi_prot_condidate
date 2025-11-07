
import React, { useState, useEffect } from 'react';
import { InvestmentDiary } from '../types';
import { availableStocks } from '../services/mockData';

interface InvestmentDiaryPageProps {
  userId: string;
}

const InvestmentDiaryPage: React.FC<InvestmentDiaryPageProps> = ({ userId }) => {
  const [diaries, setDiaries] = useState<InvestmentDiary[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<InvestmentDiary>>({
    title: '',
    content: '',
    stockSymbol: '',
    stockName: '',
    decisionReason: '',
    emotion: 'neutral',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadDiaries();
  }, [userId]);

  const loadDiaries = () => {
    const stored = localStorage.getItem(`investmentDiaries_${userId}`);
    if (stored) {
      setDiaries(JSON.parse(stored).sort((a: InvestmentDiary, b: InvestmentDiary) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    }
  };

  const saveDiaries = (newDiaries: InvestmentDiary[]) => {
    localStorage.setItem(`investmentDiaries_${userId}`, JSON.stringify(newDiaries));
    setDiaries(newDiaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.decisionReason) {
      alert('제목, 내용, 투자 결정 근거를 모두 입력해주세요.');
      return;
    }

    if (editingId) {
      // 수정
      const updated = diaries.map(diary =>
        diary.id === editingId
          ? {
              ...diary,
              ...formData,
              updatedAt: new Date().toISOString(),
            }
          : diary
      );
      saveDiaries(updated);
      setEditingId(null);
    } else {
      // 새로 작성
      const newDiary: InvestmentDiary = {
        id: `diary_${Date.now()}`,
        userId,
        date: formData.date || new Date().toISOString().split('T')[0],
        title: formData.title!,
        content: formData.content!,
        stockSymbol: formData.stockSymbol,
        stockName: formData.stockName,
        decisionReason: formData.decisionReason!,
        emotion: formData.emotion || 'neutral',
        tags: formData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveDiaries([...diaries, newDiary]);
    }

    // 폼 초기화
    setFormData({
      title: '',
      content: '',
      stockSymbol: '',
      stockName: '',
      decisionReason: '',
      emotion: 'neutral',
      tags: [],
    });
    setIsWriting(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const updated = diaries.filter(diary => diary.id !== id);
      saveDiaries(updated);
    }
  };

  const handleEdit = (diary: InvestmentDiary) => {
    setFormData({
      title: diary.title,
      content: diary.content,
      stockSymbol: diary.stockSymbol,
      stockName: diary.stockName,
      decisionReason: diary.decisionReason,
      emotion: diary.emotion,
      tags: diary.tags,
      date: diary.date,
    });
    setEditingId(diary.id);
    setIsWriting(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };

  const emotionLabels: Record<string, string> = {
    excited: '흥분',
    anxious: '불안',
    hopeful: '기대',
    regretful: '후회',
    confident: '자신감',
    neutral: '평온',
  };

  const emotionColors: Record<string, string> = {
    excited: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    anxious: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    hopeful: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    regretful: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    confident: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    neutral: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-on-surface dark:text-on-surface mb-2">
            투자 일기
          </h2>
          <p className="text-lg text-on-surface-secondary dark:text-on-surface-secondary">
            투자 결정 과정과 감정을 기록하세요.
          </p>
        </div>
        <button
          onClick={() => {
            setIsWriting(true);
            setEditingId(null);
            setFormData({
              title: '',
              content: '',
              stockSymbol: '',
              stockName: '',
              decisionReason: '',
              emotion: 'neutral',
              tags: [],
              date: new Date().toISOString().split('T')[0],
            });
          }}
          className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-lg transition-colors"
        >
          새 일기 작성
        </button>
      </div>

      {/* 작성 폼 */}
      {isWriting && (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
          <h3 className="text-xl font-bold text-on-surface dark:text-on-surface mb-4">
            {editingId ? '일기 수정' : '새 일기 작성'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                날짜
              </label>
              <input
                type="date"
                value={formData.date || new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                placeholder="일기 제목"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                  종목 코드 (선택)
                </label>
                <input
                  type="text"
                  value={formData.stockSymbol || ''}
                  onChange={(e) => {
                    const symbol = e.target.value;
                    const stock = availableStocks.find(s => s.symbol === symbol);
                    setFormData({
                      ...formData,
                      stockSymbol: symbol,
                      stockName: stock?.name || '',
                    });
                  }}
                  className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                  placeholder="예: 005930"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                  종목명
                </label>
                <input
                  type="text"
                  value={formData.stockName || ''}
                  onChange={(e) => setFormData({ ...formData, stockName: e.target.value })}
                  className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                  placeholder="예: 삼성전자"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                내용 *
              </label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                placeholder="투자 일기 내용을 작성하세요..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                투자 결정 근거 *
              </label>
              <textarea
                value={formData.decisionReason || ''}
                onChange={(e) => setFormData({ ...formData, decisionReason: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                placeholder="왜 이 투자 결정을 내렸는지 설명하세요..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                감정 상태
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {(['excited', 'anxious', 'hopeful', 'regretful', 'confident', 'neutral'] as const).map((emotion) => (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => setFormData({ ...formData, emotion })}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.emotion === emotion
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-border-color-light dark:border-border-color-dark'
                    }`}
                  >
                    <span className="text-sm font-medium text-on-surface dark:text-on-surface">
                      {emotionLabels[emotion]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                태그
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                  placeholder="태그 입력 후 Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-on-surface dark:text-on-surface rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-brand-primary/10 text-brand-primary dark:text-brand-primary-light rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsWriting(false);
                  setEditingId(null);
                  setFormData({
                    title: '',
                    content: '',
                    stockSymbol: '',
                    stockName: '',
                    decisionReason: '',
                    emotion: 'neutral',
                    tags: [],
                  });
                }}
                className="flex-1 px-6 py-3 border border-border-color-light dark:border-border-color-dark text-on-surface dark:text-on-surface font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-lg transition-colors"
              >
                {editingId ? '수정' : '저장'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 일기 리스트 */}
      <div className="space-y-4">
        {diaries.length === 0 ? (
          <div className="text-center py-12 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-color-light dark:border-border-color-dark">
            <p className="text-on-surface-secondary dark:text-on-surface-secondary">
              작성된 일기가 없습니다. 첫 일기를 작성해보세요!
            </p>
          </div>
        ) : (
          diaries.map((diary) => (
            <div
              key={diary.id}
              className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">
                      {new Date(diary.date).toLocaleDateString()}
                    </span>
                    {diary.stockSymbol && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-on-surface-secondary dark:text-on-surface-secondary rounded text-xs">
                        {diary.stockName || diary.stockSymbol}
                      </span>
                    )}
                    {diary.emotion && (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${emotionColors[diary.emotion]}`}>
                        {emotionLabels[diary.emotion]}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-on-surface dark:text-on-surface mb-2">
                    {diary.title}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(diary)}
                    className="px-3 py-1 text-sm text-brand-primary dark:text-brand-primary-light hover:bg-brand-primary/10 rounded"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(diary.id)}
                    className="px-3 py-1 text-sm text-red-500 hover:bg-red-500/10 rounded"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p className="text-on-surface-secondary dark:text-on-surface-secondary mb-4 whitespace-pre-wrap">
                {diary.content}
              </p>
              <div className="mb-4 p-4 bg-background-light dark:bg-background-dark rounded-lg">
                <p className="text-sm font-semibold text-on-surface dark:text-on-surface mb-1">
                  투자 결정 근거
                </p>
                <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">
                  {diary.decisionReason}
                </p>
              </div>
              {diary.tags && diary.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {diary.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-brand-primary/10 text-brand-primary dark:text-brand-primary-light rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InvestmentDiaryPage;

