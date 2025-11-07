import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, MessageSender, UserProfile } from '../types';
import * as geminiService from '../services/geminiService';
import { mockAssets, mockTransactions, mockStocks, mockNews, getInitialVirtualAccount, calculateVirtualPositions } from '../services/mockData';
import { AssetsChart, TransactionsList } from '../components/DashboardWidgets';
import { Chat } from '@google/genai';

// Audio Helper Functions
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
        <path d="M12 2a.75.75 0 01.75.75v.51a15.352 15.352 0 015.043 2.118.75.75 0 01-.564 1.343A13.852 13.852 0 0012 5.5a13.852 13.852 0 00-5.229 1.22.75.75 0 01-.564-1.343A15.352 15.352 0 0111.25 3.26V2.75A.75.75 0 0112 2z" />
        <path fillRule="evenodd" d="M12 7.5a12.345 12.345 0 00-8.895 3.963.75.75 0 00.518 1.332 10.845 10.845 0 0116.754 0 .75.75 0 00.518-1.332A12.345 12.345 0 0012 7.5zm-2.438 4.743a.75.75 0 01.75-.513h3.375a.75.75 0 01.75.513c.015.084.028.17.04.256a.75.75 0 01-1.48.22c-.01-.07-.02-.14-.03-.21h-2.125c-.01.07-.02.14-.03.21a.75.75 0 01-1.48-.22c.012-.085.025-.172.04-.256z" clipRule="evenodd" />
        <path d="M12 14.25a7.488 7.488 0 00-7.316 6.019.75.75 0 00.748.731h13.136a.75.75 0 00.748-.731A7.488 7.488 0 0012 14.25z" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-on-surface dark:text-on-surface">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const SpeakerIcon = ({ state }: { state: 'idle' | 'loading' | 'playing' | 'error' }) => {
    if (state === 'loading') {
        return <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>;
    }
    if (state === 'playing') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a1 1 0 00-2 0v12a1 1 0 002 0V4zM15 4a1 1 0 00-2 0v12a1 1 0 002 0V4z"/>
            </svg>
        );
    }
    if (state === 'error') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.71 5.25A.75.75 0 017.75 6v8a.75.75 0 01-1.5 0V6a.75.75 0 011.04-.75zM10.25 5.25a.75.75 0 011.04.75v8a.75.75 0 01-1.5 0V6a.75.75 0 01.46-.75zM13.25 6a.75.75 0 00-1.5 0v8a.75.75 0 001.5 0V6z" />
        </svg>
    );
};

interface FloatingChatProps {
    userProfile: UserProfile;
    userId?: string;
    onClose?: () => void;
}

type AudioState = 'idle' | 'loading' | 'playing' | 'error';

const FloatingChat: React.FC<FloatingChatProps> = ({ userProfile, userId, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: `안녕하세요, ${userProfile.name}님! 무엇을 도와드릴까요?`, sender: MessageSender.AI }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const [audioCache, setAudioCache] = useState<Record<string, string>>({});
    const [audioStates, setAudioStates] = useState<Record<string, AudioState>>({});
    const currentPlayingSource = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        chatRef.current = geminiService.createChatSession(userProfile.systemInstruction);
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
    }, [userProfile.systemInstruction]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);
    
    const stopCurrentAudio = useCallback(() => {
        if (currentPlayingSource.current) {
            currentPlayingSource.current.stop();
            currentPlayingSource.current.disconnect();
            currentPlayingSource.current = null;
        }
        setAudioStates(prev => {
            const newStates: Record<string, AudioState> = {};
            for (const key in prev) {
                if (prev[key] === 'playing') newStates[key] = 'idle';
                else newStates[key] = prev[key];
            }
            return newStates;
        });
    }, []);

    const handlePlayAudio = async (msgId: string, text: string) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        const currentState = audioStates[msgId];
        if (currentState === 'playing') {
            stopCurrentAudio();
            return;
        }

        stopCurrentAudio();
        
        try {
            let audioData = audioCache[msgId];
            if (!audioData) {
                setAudioStates(prev => ({ ...prev, [msgId]: 'loading' }));
                const fetchedData = await geminiService.generateSpeech(text);
                if (!fetchedData) throw new Error("Failed to generate audio.");
                audioData = fetchedData;
                setAudioCache(prev => ({ ...prev, [msgId]: audioData }));
            }
            
            setAudioStates(prev => ({ ...prev, [msgId]: 'playing' }));

            const audioBytes = decode(audioData);
            const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => {
                setAudioStates(prev => ({ ...prev, [msgId]: 'idle' }));
                if (currentPlayingSource.current === source) {
                    currentPlayingSource.current = null;
                }
            };
            source.start();
            currentPlayingSource.current = source;

        } catch (error) {
            console.error("Error playing audio:", error);
            setAudioStates(prev => ({ ...prev, [msgId]: 'error' }));
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;

        stopCurrentAudio();

        const userMessage: Message = { id: Date.now().toString(), text: input, sender: MessageSender.USER };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            let response = await geminiService.sendMessage(chatRef.current, input);
            const uiData = [];
            
            while (response.functionCalls && response.functionCalls.length > 0) {
                const functionCalls = response.functionCalls;
                const functionResponseParts = [];

                for (const call of functionCalls) {
                    let result: any;
                    switch(call.name) {
                        case 'getAssetSummary':
                           result = { data: mockAssets, type: 'assets' };
                           break;
                        case 'getTransactionHistory':
                            result = { data: mockTransactions, type: 'transactions' };
                            break;
                        case 'getStockPrice':
                            const stockSymbol = call.args.symbol as string;
                            const stock = mockStocks[stockSymbol] || Object.values(mockStocks).find(s => s.symbol === stockSymbol || s.name.toLowerCase().includes(stockSymbol.toLowerCase()));
                            result = stock ? { data: stock, type: 'stock' } : { error: "주식을 찾을 수 없습니다." };
                            break;
                        case 'getVirtualPortfolio':
                            if (userId) {
                                const account = getInitialVirtualAccount(userId);
                                const positions = calculateVirtualPositions(account.id);
                                result = { data: { account, positions }, type: 'virtualPortfolio' };
                            } else {
                                result = { error: "사용자 정보가 없습니다." };
                            }
                            break;
                        case 'getInvestmentDiary':
                            if (userId) {
                                const stored = localStorage.getItem(`investmentDiaries_${userId}`);
                                let diaries = stored ? JSON.parse(stored) : [];
                                const filterSymbol = call.args.stockSymbol as string;
                                if (filterSymbol) {
                                    diaries = diaries.filter((d: any) => d.stockSymbol === filterSymbol);
                                }
                                result = { data: diaries, type: 'investmentDiary' };
                            } else {
                                result = { error: "사용자 정보가 없습니다." };
                            }
                            break;
                        case 'getNews':
                            let news = mockNews;
                            const category = call.args.category as string;
                            if (category) {
                                news = news.filter(n => n.category === category);
                            }
                            result = { data: news, type: 'news' };
                            break;
                        default:
                            result = { error: "알 수 없는 함수입니다."};
                    }

                    uiData.push(result);

                    functionResponseParts.push({
                        functionResponse: {
                           name: call.name,
                           response: result
                        }
                    });
                }
                
                response = await chatRef.current.sendMessage({
                    message: functionResponseParts
                });
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.text,
                sender: MessageSender.AI,
                data: uiData,
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "죄송합니다, 오류가 발생했어요. 다시 시도해주세요.", sender: MessageSender.AI };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-brand-primary dark:bg-brand-primary-light rounded-full shadow-lg flex items-center justify-center hover:bg-brand-primary-dark dark:hover:bg-brand-primary transition-all z-50"
                aria-label="AI 채팅 열기"
            >
                <BotIcon />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl border border-border-color-light dark:border-border-color-dark flex flex-col z-50">
            {/* 헤더 */}
            <div className="flex justify-between items-center p-4 border-b border-border-color-light dark:border-border-color-dark">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
                        <BotIcon />
                    </div>
                    <span className="font-semibold text-on-surface dark:text-on-surface">AI 채팅</span>
                </div>
                <button
                    onClick={() => {
                        setIsOpen(false);
                        onClose?.();
                    }}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-on-surface-secondary dark:text-on-surface-secondary"
                    aria-label="닫기"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === MessageSender.AI && (
                            <div className="w-6 h-6 rounded-full bg-brand-primary flex-shrink-0 flex items-center justify-center">
                                <BotIcon />
                            </div>
                        )}
                        <div className={`max-w-[80%] group relative ${msg.sender === MessageSender.USER ? 'order-1' : ''}`}>
                            <div className={`p-3 rounded-lg ${msg.sender === MessageSender.USER ? 'bg-brand-primary text-white rounded-br-sm' : 'bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-bl-sm'}`}>
                                <p className="text-sm whitespace-pre-wrap text-on-surface dark:text-on-surface">{msg.text}</p>
                            </div>
                            {msg.sender === MessageSender.AI && (
                                <button 
                                    onClick={() => handlePlayAudio(msg.id, msg.text)}
                                    className="absolute -bottom-2 -right-2 p-1 bg-surface-light dark:bg-surface-dark rounded-full shadow-md border border-border-color-light dark:border-border-color-dark opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="음성 재생"
                                >
                                    <SpeakerIcon state={audioStates[msg.id] || 'idle'} />
                                </button>
                            )}
                        </div>
                        {msg.sender === MessageSender.USER && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center order-2">
                                <UserIcon />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center">
                            <BotIcon />
                        </div>
                        <div className="flex space-x-1">
                            <span className="w-2 h-2 bg-on-surface-secondary rounded-full animate-pulse"></span>
                            <span className="w-2 h-2 bg-on-surface-secondary rounded-full animate-pulse delay-150"></span>
                            <span className="w-2 h-2 bg-on-surface-secondary rounded-full animate-pulse delay-300"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="p-4 border-t border-border-color-light dark:border-border-color-dark">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="메시지 입력..."
                        className="flex-1 px-3 py-2 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm text-on-surface dark:text-on-surface"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim()} 
                        className="p-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FloatingChat;

