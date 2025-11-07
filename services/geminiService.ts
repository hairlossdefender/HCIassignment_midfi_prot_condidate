
import { GoogleGenAI, FunctionDeclaration, Type, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { SurveyScores, Asset, FinancialTip } from '../types';

let ai: GoogleGenAI | null = null;

// Vite에서는 import.meta.env를 사용해야 함
// vite.config.ts에서 정의한 process.env.API_KEY도 확인
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 
               (typeof process !== 'undefined' && (process as any).env?.API_KEY) ||
               (typeof process !== 'undefined' && (process as any).env?.GEMINI_API_KEY);

if (apiKey) {
    try {
        ai = new GoogleGenAI({ apiKey: apiKey as string });
        console.log("✅ Gemini API initialized successfully");
    } catch (error) {
        console.error("❌ Error initializing Gemini API:", error);
        ai = null;
    }
} else {
    console.error("❌ GEMINI_API_KEY environment variable not set.");
    console.error("📝 Please create a .env.local file in the project root with:");
    console.error("   VITE_GEMINI_API_KEY=your_api_key_here");
    console.error("   OR");
    console.error("   GEMINI_API_KEY=your_api_key_here");
}


export const createSystemInstruction = (scores: SurveyScores): string => {
  let persona = "You are a helpful financial AI agent. Your name is '금융 AI 에이전트'. Always respond in Korean.\n";
  
  // Comprehension
  if (scores.comprehension <= 4) {
    persona += "Your user is a beginner in finance. Use very simple and easy-to-understand language. Avoid jargon. If you must use a technical term, explain it immediately in a simple way.\n";
  } else if (scores.comprehension <= 6) {
    persona += "Your user has some basic financial knowledge. You can use common terms, but avoid highly technical language. Keep explanations clear and concise.\n";
  } else {
    persona += "Your user is knowledgeable about finance. You can use professional terms and provide more in-depth, data-driven analysis.\n";
  }

  // Impulsivity
  if (scores.impulsivity >= 7) {
    persona += "Crucially, your user tends to be impulsive. Your primary goal is to promote cautious and deliberate decision-making. If the user suggests a high-risk investment or shows signs of emotional decision-making, you MUST gently intervene. Use phrases like '한번 더 신중하게 생각해보는 것은 어떨까요?' or '이런 투자는 높은 변동성을 가질 수 있으니, 리스크를 충분히 인지하셔야 해요.' to encourage reflection. Prioritize stability and long-term planning in your advice.\n";
  } else if (scores.impulsivity >= 5) {
     persona += "Your user is moderately impulsive. Remind them to consider risks and diversification. Encourage them to base decisions on analysis rather than just market hype.\n";
  } else {
    persona += "Your user is cautious. Support their analytical approach with data and logical reasoning. You can discuss a wider range of investment options, respecting their careful nature.\n";
  }
  
  // Financial Interest
  if (scores.financialInterest <= 4) {
    persona += "The user has low interest in finance. Keep your answers brief and to the point. Focus on providing direct answers to their questions rather than extensive details. Offer simple, actionable tips.\n";
  } else {
    persona += "The user is interested in finance. You can provide more detailed information, including market context and news, as they will find it valuable.\n";
  }
  
  persona += "When you use function calling to get data, present the data to the user in a clean, summarized, and easily digestible format. For example, for assets, you can provide a total and a breakdown. For stocks, clearly state the current price and change.";

  return persona;
};


// Function Declarations for Gemini
const functions: Record<string, FunctionDeclaration> = {
    getAssetSummary: {
        name: "getAssetSummary",
        description: "사용자의 전체 자산 포트폴리오를 조회합니다. (Get the user's total asset portfolio.)",
        parameters: { type: Type.OBJECT, properties: {} }
    },
    getTransactionHistory: {
        name: "getTransactionHistory",
        description: "사용자의 최근 거래 내역을 조회합니다. (Get the user's recent transaction history.)",
        parameters: { type: Type.OBJECT, properties: {} }
    },
    getStockPrice: {
        name: "getStockPrice",
        description: "특정 주식의 현재 가격을 조회합니다. (Get the current price of a specific stock.)",
        parameters: {
            type: Type.OBJECT,
            properties: {
                symbol: { type: Type.STRING, description: "주식 종목 코드 또는 이름 (e.g., '005930', '삼성전자', 'TSLA')" },
            },
            required: ["symbol"]
        }
    },
    getVirtualPortfolio: {
        name: "getVirtualPortfolio",
        description: "사용자의 가상 거래소 포트폴리오를 조회합니다. (Get the user's virtual trading portfolio.)",
        parameters: { type: Type.OBJECT, properties: {} }
    },
    getInvestmentDiary: {
        name: "getInvestmentDiary",
        description: "사용자의 투자 일기를 조회합니다. (Get the user's investment diary entries.)",
        parameters: {
            type: Type.OBJECT,
            properties: {
                stockSymbol: { type: Type.STRING, description: "종목 코드로 필터링 (선택사항, Optional filter by stock symbol)" },
            },
            required: []
        }
    },
    getNews: {
        name: "getNews",
        description: "최신 금융 뉴스를 조회합니다. (Get the latest financial news.)",
        parameters: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING, description: "뉴스 카테고리 (market, company, economy, policy) - 선택사항" },
            },
            required: []
        }
    }
};

export const createChatSession = (systemInstruction: string): Chat | null => {
  if (!ai) return null;
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      tools: [{ functionDeclarations: Object.values(functions) }]
    }
  });
};

export const sendMessage = async (chat: Chat, message: string): Promise<GenerateContentResponse> => {
  const result = await chat.sendMessage({ message });
  return result;
};

export const generateDashboardBriefing = async (assets: Asset[], userName: string): Promise<string> => {
    if (!ai) return "AI 서비스를 사용할 수 없습니다.";
    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const assetSummary = assets.map(a => `${a.name}: ${Math.round(a.value / 10000)}만원`).join(', ');
    
    const prompt = `사용자 '${userName}'를 위해 개인화된 대시보드 환영 메시지를 생성해줘. 사용자의 현재 자산 상황을 긍정적이고 간결하게 요약해줘.
    - 총 자산: ${totalAssets.toLocaleString()}원
    - 자산 구성: ${assetSummary}
    - 톤앤매너: 친절하고, 격려하며, 전문적인 금융 비서처럼.
    - 분량: 2~3 문장으로 짧게.
    - 예시: "좋은 아침입니다, ${userName}님! 현재 총 자산은 ${totalAssets.toLocaleString()}원으로 안정적으로 관리되고 있네요. 오늘도 성공적인 하루를 위해 AI가 함께할게요."`;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating dashboard briefing:", error);
        return `안녕하세요, ${userName}님. 당신의 금융 현황을 요약해 드릴게요.`;
    }
};

export const getFinancialTip = async (comprehensionScore: number): Promise<FinancialTip> => {
    if (!ai) {
        // API가 없을 때 기본 팁 제공
        const defaultTips: FinancialTip[] = [
            { title: "복리 효과의 힘", content: "작은 금액이라도 꾸준히 저축하면 복리 효과로 시간이 지날수록 자산이 크게 늘어납니다. 매월 일정 금액을 저축하는 습관을 만들어보세요." },
            { title: "긴급자금 마련의 중요성", content: "예상치 못한 상황에 대비해 생활비의 3-6개월분을 긴급자금으로 준비하는 것이 좋습니다. 이 자금은 안전한 예금 상품에 보관하세요." },
            { title: "분산투자의 원칙", content: "모든 자산을 한 곳에 투자하지 말고 여러 자산에 분산 투자하면 리스크를 줄일 수 있습니다. 주식, 채권, 부동산 등 다양한 자산에 투자해보세요." },
            { title: "장기 투자의 가치", content: "단기적인 시장 변동에 흔들리지 말고 장기적인 관점에서 투자하세요. 시간이 지날수록 시장 변동성이 완화되고 수익 가능성이 높아집니다." },
            { title: "수수료 관리하기", content: "투자 수수료와 관리비는 장기적으로 수익률에 큰 영향을 미칩니다. 수수료가 낮은 상품을 선택하고 정기적으로 비용을 점검하세요." }
        ];
        const level = comprehensionScore > 6 ? 3 : comprehensionScore > 4 ? 2 : 0;
        return defaultTips[level] || defaultTips[0];
    }
    
    let level = "초급자를 위한";
    if (comprehensionScore > 6) {
        level = "숙련자를 위한";
    } else if (comprehensionScore > 4) {
        level = "중급자를 위한";
    }

    const prompt = `사용자의 금융 이해도 수준은 '${level}'이야. 이 사용자를 위해 유용하고 흥미로운 금융 팁을 하나 생성해줘. 
    반드시 아래 JSON 형식에 맞춰서, 제목(title)과 내용(content)을 한국어로 작성해줘. 내용은 2-3문장으로 간결하게.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ['title', 'content']
              }
            }
        });
        
        const parsed = JSON.parse(response.text) as FinancialTip;
        // 응답이 올바른 형식인지 확인
        if (parsed.title && parsed.content) {
            return parsed;
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.error("Error generating financial tip:", error);
        // 에러 발생 시 기본 팁 제공
        const defaultTips: FinancialTip[] = [
            { title: "복리 효과의 힘", content: "작은 금액이라도 꾸준히 저축하면 복리 효과로 시간이 지날수록 자산이 크게 늘어납니다. 매월 일정 금액을 저축하는 습관을 만들어보세요." },
            { title: "긴급자금 마련의 중요성", content: "예상치 못한 상황에 대비해 생활비의 3-6개월분을 긴급자금으로 준비하는 것이 좋습니다. 이 자금은 안전한 예금 상품에 보관하세요." },
            { title: "분산투자의 원칙", content: "모든 자산을 한 곳에 투자하지 말고 여러 자산에 분산 투자하면 리스크를 줄일 수 있습니다. 주식, 채권, 부동산 등 다양한 자산에 투자해보세요." }
        ];
        const level = comprehensionScore > 6 ? 2 : comprehensionScore > 4 ? 1 : 0;
        return defaultTips[level] || defaultTips[0];
    }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    if (!ai) return null;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};
