
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, MessageSender, UserProfile } from '../types';
import * as geminiService from '../services/geminiService';
import { mockAssets, mockTransactions, mockStocks } from '../services/mockData';
import { AssetsChart, TransactionsList } from '../components/DashboardWidgets';
import { Chat } from '@google/genai';

// --- Audio Helper Functions ---
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
// --- End Audio Helper Functions ---


const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
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

// Fix: Updated SpeakerIcon to accept the 'error' state and render a corresponding icon.
const SpeakerIcon = ({ state }: { state: 'idle' | 'loading' | 'playing' | 'error' }) => {
    if (state === 'loading') {
        return <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>;
    }
    if (state === 'playing') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a1 1 0 00-2 0v12a1 1 0 002 0V4zM15 4a1 1 0 00-2 0v12a1 1 0 002 0V4z"/>
            </svg>
        );
    }
    if (state === 'error') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.71 5.25A.75.75 0 017.75 6v8a.75.75 0 01-1.5 0V6a.75.75 0 011.04-.75zM10.25 5.25a.75.75 0 011.04.75v8a.75.75 0 01-1.5 0V6a.75.75 0 01.46-.75zM13.25 6a.75.75 0 00-1.5 0v8a.75.75 0 001.5 0V6z" />
        </svg>
    );
};


interface ChatProps {
    userProfile: UserProfile;
}

type AudioState = 'idle' | 'loading' | 'playing' | 'error';

const AIChatPage: React.FC<ChatProps> = ({ userProfile }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: `안녕하세요, ${userProfile.name}님! 저는 당신의 금융 AI 에이전트입니다. 무엇을 도와드릴까요? (예: 내 자산 보여줘, 삼성전자 주가 알려줘)`, sender: MessageSender.AI }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    
    // Audio state management
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
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
                           const assets = mockAssets;
                           result = { data: assets, type: 'assets' };
                           break;
                        case 'getTransactionHistory':
                            const transactions = mockTransactions;
                            result = { data: transactions, type: 'transactions' };
                            break;
                        case 'getStockPrice':
                            const stockSymbol = call.args.symbol as string;
                            const stock = mockStocks[stockSymbol] || Object.values(mockStocks).find(s => s.symbol === stockSymbol || s.name.toLowerCase().includes(stockSymbol.toLowerCase()));
                            result = stock ? { data: stock, type: 'stock' } : { error: "주식을 찾을 수 없습니다." };
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

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-on-surface dark:text-on-surface">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-4 animate-fadeIn ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === MessageSender.AI && (
                            <div className="w-10 h-10 rounded-full bg-brand-primary flex-shrink-0 flex items-center justify-center shadow-md">
                                <BotIcon />
                            </div>
                        )}
                        <div className={`max-w-xl group relative ${msg.sender === MessageSender.USER ? 'order-1' : ''}`}>
                             <div className={`p-4 rounded-2xl ${msg.sender === MessageSender.USER ? 'bg-brand-primary dark:bg-brand-primary-dark text-white rounded-br-lg' : 'bg-surface-light dark:bg-surface-dark shadow-sm rounded-bl-lg border border-border-color-light dark:border-border-color-dark'}`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                {msg.data && msg.data.length > 0 && (
                                    <div className="mt-4 border-t border-border-color-light dark:border-border-color-dark pt-4 space-y-4">
                                        {msg.data.map((dataItem: any, i: number) => (
                                            <div key={i}>
                                                {dataItem.type === 'assets' && <AssetsChart data={dataItem.data} />}
                                                {dataItem.type === 'transactions' && <TransactionsList data={dataItem.data} />}
                                                {dataItem.type === 'stock' && dataItem.data && (
                                                    <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg border border-border-color-light dark:border-border-color-dark">
                                                        <p className="font-bold text-lg">{dataItem.data.name} ({dataItem.data.symbol})</p>
                                                        <p className="text-2xl font-bold">{dataItem.data.price.toLocaleString()}원</p>
                                                        <p className={`${dataItem.data.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {dataItem.data.change.toLocaleString()}원 ({dataItem.data.changePercent.toFixed(2)}%)
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {msg.sender === MessageSender.AI && (
                                <button 
                                    onClick={() => handlePlayAudio(msg.id, msg.text)}
                                    className="absolute -bottom-3 -right-3 p-1.5 bg-surface-light dark:bg-surface-dark rounded-full shadow-md border border-border-color-light dark:border-border-color-dark opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-secondary"
                                    aria-label="Play audio"
                                >
                                    <SpeakerIcon state={audioStates[msg.id] || 'idle'} />
                                </button>
                            )}
                        </div>
                         {msg.sender === MessageSender.USER && (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center shadow-sm order-2">
                                <UserIcon />
                            </div>
                        )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3 justify-start animate-fadeIn">
                        <div className="w-10 h-10 rounded-full bg-brand-primary flex-shrink-0 flex items-center justify-center">
                           <BotIcon />
                        </div>
                        <div className="max-w-xl p-4 rounded-2xl bg-surface-light dark:bg-surface-dark shadow-sm rounded-bl-none flex items-center space-x-2 border border-border-color-light dark:border-border-color-dark">
                           <span className="w-2.5 h-2.5 bg-on-surface-secondary rounded-full animate-pulse delay-0"></span>
                           <span className="w-2.5 h-2.5 bg-on-surface-secondary rounded-full animate-pulse delay-150"></span>
                           <span className="w-2.5 h-2.5 bg-on-surface-secondary rounded-full animate-pulse delay-300"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-transparent">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-3 p-2 bg-surface-light dark:bg-surface-dark rounded-full border border-border-color-light dark:border-border-color-dark shadow-lg">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your AI agent anything..."
                        className="flex-1 px-4 py-3 bg-transparent text-lg focus:outline-none"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-3 rounded-full bg-brand-primary hover:bg-brand-primary-dark text-white disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-all duration-200 disabled:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIChatPage;