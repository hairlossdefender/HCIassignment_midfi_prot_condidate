
import { GoogleGenAI, FunctionDeclaration, Type, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { SurveyScores, Asset, FinancialTip } from '../types';

let ai: GoogleGenAI | null = null;

if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
    console.error("API_KEY environment variable not set.");
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
    if (!ai) return { title: "오류", content: "AI 서비스를 사용할 수 없습니다."};
    
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
        
        return JSON.parse(response.text) as FinancialTip;
    } catch (error) {
        console.error("Error generating financial tip:", error);
        return { title: "금융 팁", content: "새로운 금융 팁을 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요."};
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
