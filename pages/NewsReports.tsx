
import React, { useState, useMemo } from 'react';
import { News, ResearchReport } from '../types';
import { mockNews, mockReports } from '../services/mockData';

type NewsCategory = 'all' | 'market' | 'company' | 'economy' | 'policy';

const NewsReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'reports'>('news');
  const [newsCategory, setNewsCategory] = useState<NewsCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNews = useMemo(() => {
    let filtered = mockNews;

    if (newsCategory !== 'all') {
      filtered = filtered.filter(news => news.category === newsCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(news =>
        news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        news.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [newsCategory, searchTerm]);

  const filteredReports = useMemo(() => {
    if (!searchTerm) return mockReports;

    return mockReports.filter(report =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.targetStock.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const categoryLabels: Record<NewsCategory, string> = {
    all: '전체',
    market: '시장 동향',
    company: '기업 뉴스',
    economy: '경제',
    policy: '정책',
  };

  const ratingLabels: Record<string, string> = {
    buy: '매수',
    hold: '보유',
    sell: '매도',
  };

  const ratingColors: Record<string, string> = {
    buy: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    hold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    sell: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-on-surface dark:text-on-surface mb-2">
          뉴스 및 리포트
        </h2>
        <p className="text-lg text-on-surface-secondary dark:text-on-surface-secondary">
          최신 금융 뉴스와 증권사 리포트를 확인하세요.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-2 border-b border-border-color-light dark:border-border-color-dark">
        <button
          onClick={() => setActiveTab('news')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'news'
              ? 'border-b-2 border-brand-primary text-brand-primary dark:text-brand-primary-light'
              : 'text-on-surface-secondary dark:text-on-surface-secondary hover:text-on-surface dark:hover:text-on-surface'
          }`}
        >
          뉴스
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'reports'
              ? 'border-b-2 border-brand-primary text-brand-primary dark:text-brand-primary-light'
              : 'text-on-surface-secondary dark:text-on-surface-secondary hover:text-on-surface dark:hover:text-on-surface'
          }`}
        >
          증권사 리포트
        </button>
      </div>

      {/* 검색바 */}
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={activeTab === 'news' ? '뉴스 검색...' : '리포트 검색...'}
          className="w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
        />
      </div>

      {/* 뉴스 탭 */}
      {activeTab === 'news' && (
        <>
          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'market', 'company', 'economy', 'policy'] as NewsCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setNewsCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  newsCategory === category
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-on-surface dark:text-on-surface hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>

          {/* 뉴스 리스트 */}
          <div className="space-y-4">
            {filteredNews.length === 0 ? (
              <div className="text-center py-12 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-color-light dark:border-border-color-dark">
                <p className="text-on-surface-secondary dark:text-on-surface-secondary">검색 결과가 없습니다.</p>
              </div>
            ) : (
              filteredNews.map((news) => (
                <div
                  key={news.id}
                  className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary dark:text-brand-primary-light rounded text-xs font-semibold">
                          {categoryLabels[news.category]}
                        </span>
                        <span className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">
                          {news.source}
                        </span>
                        <span className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">
                          {new Date(news.publishedAt).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-on-surface dark:text-on-surface mb-2">
                        {news.title}
                      </h3>
                      <p className="text-on-surface-secondary dark:text-on-surface-secondary leading-relaxed">
                        {news.content}
                      </p>
                      {news.relatedStocks && news.relatedStocks.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {news.relatedStocks.map((symbol) => (
                            <span
                              key={symbol}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-on-surface-secondary dark:text-on-surface-secondary rounded text-xs"
                            >
                              {symbol}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* 리포트 탭 */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-color-light dark:border-border-color-dark">
              <p className="text-on-surface-secondary dark:text-on-surface-secondary">검색 결과가 없습니다.</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-on-surface-secondary dark:text-on-surface-secondary">
                        {report.source}
                      </span>
                      <span className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">
                        {new Date(report.publishedAt).toLocaleDateString()}
                      </span>
                      {report.rating && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${ratingColors[report.rating]}`}
                        >
                          {ratingLabels[report.rating]}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-on-surface dark:text-on-surface mb-2">
                      {report.title}
                    </h3>
                    <p className="text-on-surface-secondary dark:text-on-surface-secondary leading-relaxed mb-3">
                      {report.summary}
                    </p>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">종목: </span>
                        <span className="font-semibold text-on-surface dark:text-on-surface">{report.targetStock}</span>
                      </div>
                      {report.targetPrice && (
                        <div>
                          <span className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">목표가: </span>
                          <span className="font-semibold text-on-surface dark:text-on-surface">
                            {report.targetPrice.toLocaleString()}원
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NewsReports;

