'use client';

// React
import { useState, useRef, useEffect } from 'react';

// External libraries
import { Send, Loader2, Sparkles, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types and constants
import { UI } from '@/lib/constants';
import { Message, MemoryUpdate } from '@/lib/memory/types';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  sessionNumber: number;
  onNewSession: () => void;
  suggestedPrompt?: string;
  recentMemoryUpdates: MemoryUpdate[];
}

const LOADING_MESSAGES = [
  'Writing...',
  'Thinking...',
  'Analyzing...',
  'Extracting memories...',
];

export default function ChatPanel({
  messages,
  onSendMessage,
  isLoading,
  sessionNumber,
  onNewSession,
  suggestedPrompt,
  recentMemoryUpdates,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [loadingTime, setLoadingTime] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [memoryDrawerExpanded, setMemoryDrawerExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const loadingStartRef = useRef<number>(0);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevMessageCountRef = useRef<number>(0);

  useEffect(() => {
    // Only auto-scroll when assistant responds (not when user types)
    if (messages.length > 0 && messages.length > prevMessageCountRef.current) {
      const lastMessage = messages[messages.length - 1];
      // Only scroll if the last message is from the assistant (response completed)
      if (lastMessage.role === 'assistant') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (suggestedPrompt) {
      setInput(suggestedPrompt);
      inputRef.current?.focus();
    }
  }, [suggestedPrompt]);

  // Auto-expand textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Handle loading timer and message rotation
  useEffect(() => {
    if (isLoading) {
      loadingStartRef.current = Date.now();
      setLoadingTime(0);
      setLoadingMessage(LOADING_MESSAGES[0]);

      loadingIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - loadingStartRef.current) / 1000);
        setLoadingTime(elapsed);

        // Rotate message every few seconds
        const messageIndex = Math.floor(elapsed / UI.LOADING_MESSAGE_INTERVAL_SECONDS) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[messageIndex]);
      }, 100);
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      setLoadingTime(0);
    }

    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const content = input.trim();
    setInput('');
    // Reset textarea height without causing scroll
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    await onSendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fafaf8] rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-900">
            Session {sessionNumber}
          </span>
          {sessionNumber > 1 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-[#FDF0ED] text-[#C96A50] rounded font-medium">
              Memory Active
            </span>
          )}
        </div>
        <button
          onClick={onNewSession}
          className="text-xs text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          New Session
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8 max-w-md mx-auto">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Claude Cowork Memory Demo
            </p>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Experience how Claude can work alongside you as a strategic partner by learning your priorities, decision patterns, and preferences across sessions to provide increasingly tailored insights.
            </p>
            <div className="text-xs text-gray-500 space-y-1.5 text-left bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p><span className="font-medium text-gray-700">How it works:</span> As you evaluate deals and discuss strategy, Claude automatically builds a memory of your investment thesis, red flags, writing style, and past decisions.</p>
              <p><span className="font-medium text-gray-700">What makes it special:</span> Claude learns implicitly from context, so there is no need to repeat yourself. It adapts its tone, anticipates your concerns, and connects patterns across opportunities.</p>
              <p className="pt-1 border-t border-gray-200"><span className="font-medium text-[#C96A50]">Try it:</span> Follow the Guided Demo on the right to see 5 "wow moments" of persistent memory in action.</p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2.5 ${
                message.role === 'user'
                  ? 'bg-[#f4f4f4] text-[#2f2f2f]'
                  : 'bg-[#f7f7f8] text-[#2f2f2f] border border-[#e5e5e5]'
              }`}
            >
              <div className="text-[13px] leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:mt-2 prose-headings:mb-1 prose-pre:my-1 prose-code:text-[13px]">
                {message.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>

              {/* Memory update indicators */}
              {message.memoryUpdates && message.memoryUpdates.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200/50">
                  {message.memoryUpdates.map((update, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 text-xs text-[#C96A50] bg-[#FDF0ED] rounded px-2 py-1 mt-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{update.description}</span>
                      {!update.explicit && (
                        <span className="text-[#E8A090]">(inferred)</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start items-center gap-3">
            <svg
              className="animate-spin"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C96A50"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
            </svg>
            <span className="text-sm text-gray-600 italic">
              {loadingMessage} {loadingTime > 0 && (
                <span className="text-gray-400">({loadingTime}s)</span>
              )}
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Recent Memory Updates Banner */}
      {recentMemoryUpdates.length > 0 && (
        <div className="border-t border-gray-200 flex-shrink-0">
          {/* Expandable Drawer */}
          {memoryDrawerExpanded && (
            <div className="px-3 py-2 bg-white border-b border-gray-200 max-h-48 overflow-y-auto">
              <div className="space-y-1.5">
                {recentMemoryUpdates.map((update, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 flex-1 break-words">{update.description}</span>
                    <span className="text-gray-400 text-[10px] uppercase tracking-wide flex-shrink-0">
                      {update.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collapsed Summary (clickable) */}
          <button
            onClick={() => setMemoryDrawerExpanded(!memoryDrawerExpanded)}
            className="w-full px-2 py-1 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between gap-2 text-xs text-gray-600"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#C96A50]" />
              <span>
                {recentMemoryUpdates.length === 1
                  ? recentMemoryUpdates[0].description
                  : `${recentMemoryUpdates.length} memories updated`}
              </span>
            </div>
            <ChevronUp
              className={`w-3 h-3 transition-transform ${memoryDrawerExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-gray-200 flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C96A50] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 min-h-[42px] max-h-[200px] overflow-y-auto"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            onClick={(e) => {
              // Prevent any scroll behavior on button click
              e.currentTarget.blur();
            }}
            className="px-3 py-2 bg-[#C96A50] text-white rounded-lg hover:bg-[#B85A40] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
