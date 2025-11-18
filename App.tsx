import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './services/supabase';
import type { ChatMessage, SessionSummary, ChatSessionRow, Json } from './types';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';

// Helper function to safely parse messages and ensure they are in the correct format
const parseMessages = (messages: any): ChatMessage[] => {
  const isValidChatMessageArray = (arr: any): arr is ChatMessage[] => {
    return Array.isArray(arr) && arr.every(
      (msg) =>
        typeof msg === 'object' &&
        msg !== null &&
        'author' in msg &&
        'content' in msg &&
        (msg.author === 'user' || msg.author === 'bot')
    );
  };

  // 1. If it's already a valid array, return it.
  if (isValidChatMessageArray(messages)) {
    return messages;
  }

  // 2. If it's not a string, we can't process it.
  if (typeof messages !== 'string') {
    return [];
  }

  // 3. Try to parse as JSON first.
  try {
    const parsed = JSON.parse(messages);
    if (isValidChatMessageArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    // Not a valid JSON string, fall through to text parser.
  }

  // 4. Fallback to plain text parser for 'user:-' and 'bot:-' format.
  const chatMessages: ChatMessage[] = [];
  // Split by newlines that are followed by 'user:-' or 'bot:-'
  // This correctly handles multi-line messages.
  const messageBlocks = messages.trim().split(/\r?\n(?=user:-|bot:-)/);

  for (const block of messageBlocks) {
    const trimmedBlock = block.trim();
    if (trimmedBlock.startsWith('user:-')) {
      chatMessages.push({
        author: 'user',
        content: trimmedBlock.substring(6).trim(),
      });
    } else if (trimmedBlock.startsWith('bot:-')) {
      chatMessages.push({
        author: 'bot',
        content: trimmedBlock.substring(5).trim(),
      });
    }
  }

  return chatMessages;
};


const App: React.FC = () => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([]);
  const [activeUserIp, setActiveUserIp] = useState<Json | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('session_id, messages, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      setIsLoadingSessions(false);
      return;
    }

    if (data) {
       const sessionSummaries = data.map(row => {
        const messages = parseMessages(row.messages);
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        const preview = lastMessage && typeof lastMessage.content === 'string'
            ? lastMessage.content.substring(0, 40) + (lastMessage.content.length > 40 ? '...' : '')
            : 'No messages yet';

        return {
          id: row.session_id,
          preview,
          last_updated: row.updated_at,
          hasNewMessage: false,
        };
      });
      setSessions(sessionSummaries);
    }
    setIsLoadingSessions(false);
  }, []);

  useEffect(() => {
    fetchSessions();

    const channel = supabase.channel('chat_sessions_changes')
      .on<ChatSessionRow>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_sessions' },
        (payload) => {
          const newRow = payload.new;
          if (!newRow || !newRow.session_id) return;

          const messages = parseMessages(newRow.messages);
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
          const preview = lastMessage && typeof lastMessage.content === 'string'
            ? lastMessage.content.substring(0, 40) + (lastMessage.content.length > 40 ? '...' : '')
            : 'New session started';
          
          setSessions(prevSessions => {
            const otherSessions = prevSessions.filter(s => s.id !== newRow.session_id);
            const newSummary: SessionSummary = {
              id: newRow.session_id,
              preview,
              last_updated: newRow.updated_at,
              hasNewMessage: newRow.session_id !== selectedSessionId,
            };
            return [newSummary, ...otherSessions].sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime());
          });
          
          if (newRow.session_id === selectedSessionId) {
             setActiveChatMessages(messages);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSessionId, fetchSessions]);

  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === selectedSessionId) return;

    setSelectedSessionId(sessionId);
    setIsLoadingMessages(true);
    setActiveChatMessages([]);
    setActiveUserIp(null);

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('messages, user_ip')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching messages for session:', error);
      setIsLoadingMessages(false);
      return;
    }

    if (data) {
      const messages = parseMessages(data.messages);
      setActiveChatMessages(messages);
      setActiveUserIp(data.user_ip);
    }
    
    setSessions(prev => prev.map(s => s.id === sessionId ? {...s, hasNewMessage: false} : s));
    setIsLoadingMessages(false);
  };

  return (
    <div className="flex h-screen font-sans antialiased text-slate-900 bg-white">
      <Sidebar
        sessions={sessions}
        selectedSessionId={selectedSessionId}
        onSelectSession={handleSelectSession}
        isLoading={isLoadingSessions}
      />
      <ChatView
        sessionId={selectedSessionId}
        messages={activeChatMessages}
        isLoading={isLoadingMessages}
        userIp={activeUserIp}
      />
    </div>
  );
};

export default App;