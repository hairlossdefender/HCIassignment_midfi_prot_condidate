
export const SURVEY_QUESTIONS = [
  {
    key: 'impulsivity',
    question: "투자 결정을 내릴 때, 당신의 일반적인 스타일은 무엇인가요?",
    options: [
      { text: "시장 기회가 보이면 즉시 행동해요.", score: 8 },
      { text: "어느 정도 분석 후, 과감하게 결정해요.", score: 6 },
      { text: "충분한 정보를 검토하고 신중하게 결정해요.", score: 4 },
      { text: "매우 보수적으로, 위험이 거의 없을 때만 투자해요.", score: 2 },
    ],
  },
  {
    key: 'financialInterest',
    question: "평소 금융 시장 뉴스나 경제 동향에 얼마나 관심이 있나요?",
    options: [
      { text: "매일 확인하며, 시장 변화에 민감해요.", score: 8 },
      { text: "주요 뉴스가 있을 때 찾아보는 편이에요.", score: 6 },
      { text: "가끔 흥미로운 기사만 읽어요.", score: 4 },
      { text: "거의 관심이 없어요.", score: 2 },
    ],
  },
  {
    key: 'comprehension',
    question: "ETF, PER, 금리 같은 금융 용어에 대해 얼마나 친숙한가요?",
    options: [
      { text: "대부분의 용어를 이해하고 설명할 수 있어요.", score: 8 },
      { text: "자주 듣는 용어는 알고 있지만, 깊이는 부족해요.", score: 6 },
      { text: "몇몇 기본적인 용어만 알고 있어요.", score: 4 },
      { text: "거의 모든 용어가 생소하고 어려워요.", score: 2 },
    ],
  },
];
