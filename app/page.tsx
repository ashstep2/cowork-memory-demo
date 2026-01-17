'use client';

// React
import { useState, useEffect, useCallback } from 'react';

// External libraries
import { Github, ExternalLink, RotateCcw, Download } from 'lucide-react';

// Components
import ChatPanel from '@/app/components/ChatPanel';
import DealBrowser from '@/app/components/DealBrowser';
import GuidedTour from '@/app/components/GuidedTour';
import MemoryPanel from '@/app/components/MemoryPanel';

// Data and utilities
import { MEMORY, STORAGE_KEYS } from '@/lib/constants';
import { MOCK_DEALS } from '@/lib/deals';
import { applyExtraction } from '@/lib/memory/extractor';
import { injectMemoryContext } from '@/lib/memory/injector';
import { DEFAULT_MEMORY, Deal, Message, Memory, MemoryUpdate } from '@/lib/memory/types';

export default function DemoPage() {
  // State
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);  // Start with MOCK_DEALS to avoid hydration error
  const [memory, setMemory] = useState<Memory>(DEFAULT_MEMORY);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionNumber, setSessionNumber] = useState(1);
  const [activeDeal, setActiveDeal] = useState<string | null>(null);
  const [tourStep, setTourStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | undefined>();
  const [recentMemoryUpdates, setRecentMemoryUpdates] = useState<MemoryUpdate[]>([]);
  const [highlightedMemoryItems, setHighlightedMemoryItems] = useState<string[]>([]);

  // Load deals from API on mount (server-side file loading)
  useEffect(() => {
    fetch('/api/deals')
      .then(res => res.json())
      .then(data => {
        if (data.deals && data.deals.length > 0) {
          setDeals(data.deals);
        }
      })
      .catch(err => {
        console.error('[Deals] Failed to load from API, using MOCK_DEALS:', err);
      });
  }, []);

  // Load memory from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMORY);
    if (stored) {
      try {
        setMemory(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }

    const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (storedSession) {
      setSessionNumber(parseInt(storedSession, 10));
    }
  }, []);

  // Save memory to localStorage
  const saveMemory = useCallback((newMemory: Memory) => {
    // Create immutable copy to avoid state mutation
    const updated = {
      ...newMemory,
      updatedAt: new Date().toISOString(),
    };

    try {
      const jsonStr = JSON.stringify(updated);

      // Check size before saving
      if (jsonStr.length > 4_000_000) {
        console.warn('Memory approaching storage limit');
        // TODO: Show user warning toast
      }

      localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify(updated));
      setMemory(updated);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Please export and clear data.');
        // TODO: Show error toast to user
      } else {
        console.error('Failed to save memory:', error);
      }
    }
  }, []);

  // Helper: Create a message object
  const createMessage = (role: 'user' | 'assistant', content: string, idSuffix = ''): Message => ({
    id: `msg_${Date.now()}${idSuffix}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  });

  // Helper: Build deal context string
  const buildDealContext = (dealId: string | null): string | undefined => {
    if (!dealId) return undefined;
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return undefined;
    return `CURRENT DEAL: ${deal.name}\n\n${deal.deckSummary}\n\nFINANCIALS:\n${deal.financialsDetail}`;
  };

  // Helper: Call chat API
  const callChatAPI = async (
    conversationMessages: Message[],
    memoryContext: string,
    dealContext: string | undefined
  ) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: conversationMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        memoryContext,
        dealContext,
      }),
    });

    if (!response.ok) {
      throw new Error('Chat request failed');
    }

    return response.json();
  };

  // Helper: Map memory updates to highlighted item IDs
  const getMemoryUpdateItemIds = (updates: MemoryUpdate[]): string[] => {
    return updates
      .map(u => {
        if (u.type === 'thesis') return 'thesis';
        if (u.type === 'redFlag' && u.data) return (u.data as { id?: string }).id;
        if (u.type === 'preference') return 'preferences';
        if (u.type === 'dealHistory' && u.data) return `deal_${(u.data as { company?: string }).company}`;
        return null;
      })
      .filter(Boolean) as string[];
  };

  // Handle sending messages
  const sendMessage = async (content: string) => {
    const userMessage = createMessage('user', content);

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setSuggestedPrompt(undefined);
    setRecentMemoryUpdates([]);

    try {
      const dealContext = buildDealContext(activeDeal);
      const memoryContext = injectMemoryContext(memory);
      const conversationMessages = [...messages, userMessage];

      const data = await callChatAPI(conversationMessages, memoryContext, dealContext);

      const assistantMessage = createMessage('assistant', data.content, '_assistant');
      setMessages(prev => [...prev, assistantMessage]);

      // Extract memories from the conversation
      await extractMemories([...conversationMessages, assistantMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);

      let errorText = 'I encountered an error processing your message.';

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
          errorText = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorText = 'The request took too long to complete. Please try again with a shorter message.';
        } else if (error.message.includes('rate limit')) {
          errorText = 'Too many requests. Please wait a moment before sending another message.';
        }
      }

      const errorMessage = createMessage('assistant', errorText, '_error');
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Reload memory from localStorage and update state
  const reloadMemoryFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMORY);
    if (stored) {
      setMemory(JSON.parse(stored));
    }
  };

  // Helper: Highlight memory items temporarily
  const highlightMemoryItems = (updates: MemoryUpdate[]) => {
    const itemIds = getMemoryUpdateItemIds(updates);
    setHighlightedMemoryItems(itemIds);
    setTimeout(() => setHighlightedMemoryItems([]), MEMORY.HIGHLIGHT_DURATION_MS);
  };

  // Extract memories from conversation
  const extractMemories = async (allMessages: Message[]) => {
    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          currentMemory: memory,
        }),
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.extraction) {
        const updates = applyExtraction(data.extraction);

        if (updates.length > 0) {
          reloadMemoryFromStorage();
          setRecentMemoryUpdates(updates);
          highlightMemoryItems(updates);
        }
      }
    } catch (error) {
      console.error('Failed to extract memories:', error);
    }
  };

  // Start new session
  const handleNewSession = () => {
    setMessages([]);
    const newSession = sessionNumber + 1;
    setSessionNumber(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSION, newSession.toString());
  };

  // Full reset
  const handleFullReset = () => {
    setMemory(DEFAULT_MEMORY);
    setMessages([]);
    setSessionNumber(1);
    setActiveDeal(null);
    setTourStep(0);
    setCompletedSteps([]);
    setSuggestedPrompt(undefined);
    setRecentMemoryUpdates([]);
    setHighlightedMemoryItems([]);
    localStorage.removeItem(STORAGE_KEYS.MEMORY);
    localStorage.setItem(STORAGE_KEYS.SESSION, '1');
  };

  // Handle tour navigation
  const handleSetTourStep = (step: number) => {
    setTourStep(step);
    if (step > 0 && !completedSteps.includes(step - 1)) {
      setCompletedSteps(prev => [...prev, step - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3f0] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              Claude Cowork Memory Demo - Venture Capital Use Case
            </h1>
            <p className="text-xs text-gray-500 mt-0">
              Strategic Partnerships · Anthropic Labs
            </p>
          </div>
          <a
            href="https://github.com/ashstep2/cowork-memory-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#C96A50] text-white rounded-full hover:bg-[#A85540] transition-colors font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            Get Started (Deploy your Template)
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 py-2 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-2 min-h-[calc(100vh-120px)]">
          {/* Left Column: Deal Browser + Memory */}
          <div className="col-span-3 flex flex-col gap-2 h-[calc(100vh-140px)]">
            <div className="h-[35%] min-h-0">
              <DealBrowser
                deals={deals}
                activeDeal={activeDeal}
                onSelectDeal={setActiveDeal}
              />
            </div>
            <div className="flex-1 min-h-0">
              <MemoryPanel
                memory={memory}
                onUpdateMemory={saveMemory}
                highlightedItems={highlightedMemoryItems}
              />
            </div>
          </div>

          {/* Center: Chat */}
          <div className="col-span-6 h-[calc(100vh-140px)]">
            <ChatPanel
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              sessionNumber={sessionNumber}
              onNewSession={handleNewSession}
              suggestedPrompt={suggestedPrompt}
              recentMemoryUpdates={recentMemoryUpdates}
            />
          </div>

          {/* Right Column: Guided Tour */}
          <div className="col-span-3 h-[calc(100vh-140px)]">
            <GuidedTour
              currentStep={tourStep}
              onSetStep={handleSetTourStep}
              onUseSuggestedPrompt={setSuggestedPrompt}
              onSelectDeal={setActiveDeal}
              onNewSession={handleNewSession}
              onReset={handleFullReset}
              completedSteps={completedSteps}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#f5f3f0] px-4 py-3 flex-shrink-0 sticky bottom-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-2 text-sm text-gray-600">
          <button
            onClick={handleFullReset}
            className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub Repository
            </a>
            <span className="text-gray-400">|</span>
            <a
              href="https://www.anthropic.com/news/introducing-anthropic-labs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
            >
              Built for Anthropic Labs
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
