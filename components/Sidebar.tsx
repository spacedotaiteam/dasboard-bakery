import React, { useState } from 'react';
import type { SessionSummary } from '../types';
import { SearchIcon, UserCircleIcon } from './Icons';

interface SidebarProps {
  sessions: SessionSummary[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  isLoading: boolean;
}

const SidebarSkeleton: React.FC = () => (
  <div className="p-2 space-y-2">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

const SessionItem: React.FC<{
  session: SessionSummary;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ session, isSelected, onSelect }) => {
  const shortId = session.id.substring(0, 8) + '...';
  const lastUpdated = new Date(session.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div
      onClick={onSelect}
      className={`flex items-start p-3 m-2 rounded-xl cursor-pointer transition-colors duration-200 relative ${
        isSelected ? 'bg-blue-500 text-white' : 'hover:bg-slate-200'
      }`}
    >
      <div className="flex-shrink-0 mr-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-400' : 'bg-slate-200'}`}>
          <UserCircleIcon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>{shortId}</p>
          <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>{lastUpdated}</span>
        </div>
        <div className="flex items-center mt-1">
          <p className={`text-sm truncate flex-1 ${isSelected ? 'text-blue-50' : 'text-slate-500'}`}>{session.preview}</p>
          {session.hasNewMessage && !isSelected && (
            <span className="ml-2 w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 ring-2 ring-white"></span>
          )}
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ sessions, selectedSessionId, onSelectSession, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(
    (session) =>
      session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-full md:w-1/3 lg:w-1/4 max-w-sm bg-white/80 backdrop-blur-sm border-r border-slate-200 flex flex-col h-screen">
      <div className="p-4 border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold text-slate-800">Chat Sessions</h1>
        <div className="relative mt-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <SidebarSkeleton />
        ) : filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isSelected={session.id === selectedSessionId}
              onSelect={() => onSelectSession(session.id)}
            />
          ))
        ) : (
          <div className="p-4 text-center text-slate-500">No sessions found.</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;