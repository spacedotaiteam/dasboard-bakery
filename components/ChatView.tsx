import React, { useEffect, useRef } from 'react';
import type { ChatMessage, Json } from '../types';
import { MessageIcon, UserCircleIcon, AtSymbolIcon } from './Icons';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string | null;
  userIp: Json | null;
}

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isBot = message.author === 'bot';

  return (
    <div className={`flex items-end gap-2 ${isBot ? 'justify-end' : 'justify-start'}`}>
      {!isBot && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0"><UserCircleIcon className="w-5 h-5 text-slate-500"/></div>}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-xl px-4 py-3 rounded-2xl shadow-md relative ${
          isBot
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-lg'
            : 'bg-white text-slate-800 rounded-bl-lg'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
};

const ChatViewSkeleton: React.FC = () => (
    <div className="p-6 space-y-6 animate-pulse">
        <div className="flex items-end gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
            <div className="h-16 w-1/2 bg-slate-200 rounded-2xl rounded-bl-none"></div>
        </div>
        <div className="flex items-end gap-2 justify-end">
            <div className="h-20 w-3/5 bg-slate-300 rounded-2xl rounded-br-none"></div>
        </div>
        <div className="flex items-end gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
            <div className="h-10 w-2/5 bg-slate-200 rounded-2xl rounded-bl-none"></div>
        </div>
        <div className="flex items-end gap-2 justify-end">
            <div className="h-12 w-1/2 bg-slate-300 rounded-2xl rounded-br-none"></div>
        </div>
    </div>
);

const ChatView: React.FC<ChatViewProps> = ({ messages, isLoading, sessionId, userIp }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!sessionId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-100 text-slate-500 h-screen p-8 text-center">
                <div className="bg-white p-8 rounded-full shadow-md mb-6">
                    <MessageIcon className="w-16 h-16 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700">Welcome to the Chat Dashboard</h2>
                <p className="max-w-sm mt-2">Select a session from the sidebar to view the conversation and get started.</p>
            </div>
        );
    }

    return (
        <main className="flex-1 flex flex-col bg-slate-100 h-screen">
            <header className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <UserCircleIcon className="w-5 h-5 text-slate-500" />
                    <h2 className="font-semibold text-base text-slate-700">
                        Session: <span className="font-mono text-blue-600 text-sm">{sessionId}</span>
                    </h2>
                </div>
                {userIp && (
                    <div className="flex items-center gap-2 mt-1">
                        <AtSymbolIcon className="w-5 h-5 text-slate-500" />
                        <p className="text-sm text-slate-600 font-mono">
                            {typeof userIp === 'string' ? userIp : JSON.stringify(userIp)}
                        </p>
                    </div>
                )}
            </header>

            <div className="flex-1 p-6 overflow-y-auto">
                {isLoading ? (
                    <ChatViewSkeleton />
                ) : (
                    <div className="space-y-6">
                        {messages.map((msg, index) => (
                            <ChatBubble key={index} message={msg} />
                        ))}
                        <div ref={endOfMessagesRef} />
                    </div>
                )}
            </div>
            
            <footer className="p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200">
                <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-400">
                    Message input disabled in admin view
                </div>
            </footer>
        </main>
    );
};

export default ChatView;