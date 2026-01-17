'use client';

import { useState, useEffect, useCallback } from 'react';
import { Github, ExternalLink, RotateCcw } from 'lucide-react';
import ChatPanel from '@/app/components/ChatPanel';
import MemoryPanel from '@/app/components/MemoryPanel';
import DealBrowser from '@/app/components/DealBrowser';
import GuidedTour from '@/app/components/GuidedTour';
import { Message, Memory, MemoryUpdate } from '@/lib/memory/types';
import { DEFAULT_MEMORY } from '@/lib/memory/types';
import { deals, getDealById } from '@/lib/deals';
import { injectMemoryContext } from '@/lib/memory/injector';
import { applyExtraction } from '@/lib/memory/extractor';

export default function DemoPage() {
  // State
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

  // Load memory from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cowork_memory');
    if (stored) {
      try {
        setMemory(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
    
    const storedSession = localStorage.getItem('cowork_session');
    if (storedSession) {
      setSessionNumber(parseInt(storedSession, 10));
    }
  }, []);

  // Save memory to localStorage
  const saveMemory = useCallback((newMemory: Memory) => {
    newMemory.updatedAt = new Date().toISOString();
    localStorage.setItem('cowork_memory', JSON.stringify(newMemory));
    setMemory(newMemory);
  }, []);

  // Handle sending messages
  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setSuggestedPrompt(undefined);
    setRecentMemoryUpdates([]);

    try {
      // Get deal context if a deal is selected
      const deal = activeDeal ? getDealById(activeDeal) : null;
      const dealContext = deal
        ? `CURRENT DEAL: ${deal.name}\n\n${deal.deckSummary}\n\nFINANCIALS:\n${deal.financialsDetail}`
        : undefined;

      // Get memory context
      const memoryContext = injectMemoryContext(memory);

      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
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

      const data = await response.json();

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Extract memories from the conversation
      await extractMemories([...messages, userMessage, assistantMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the ANTHROPIC_API_KEY is configured.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
          // Reload memory from localStorage (applyExtraction saves it)
          const stored = localStorage.getItem('cowork_memory');
          if (stored) {
            setMemory(JSON.parse(stored));
          }
          
          setRecentMemoryUpdates(updates);
          
          // Highlight updated items
          const itemIds = updates
            .map(u => {
              if (u.type === 'thesis') return 'thesis';
              if (u.type === 'redFlag' && u.data) return (u.data as { id?: string }).id;
              if (u.type === 'preference') return 'preferences';
              if (u.type === 'dealHistory' && u.data) return `deal_${(u.data as { company?: string }).company}`;
              return null;
            })
            .filter(Boolean) as string[];
          
          setHighlightedMemoryItems(itemIds);
          
          // Clear highlights after 3 seconds
          setTimeout(() => setHighlightedMemoryItems([]), 3000);
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
    localStorage.setItem('cowork_session', newSession.toString());
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
    localStorage.removeItem('cowork_memory');
    localStorage.setItem('cowork_session', '1');
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
              Cowork Memory Demo
            </h1>
            <p className="text-xs text-gray-500 mt-0">
              Persistent learning for agentic AI assistants
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFullReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <a
              href="https://anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#2f2f2f] text-white rounded-full hover:bg-[#1f1f1f] transition-colors"
            >
              Built for Anthropic
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 py-2 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-2 min-h-[calc(100vh-80px)]">
          {/* Left Column: Deal Browser + Memory */}
          <div className="col-span-2 flex flex-col gap-2 h-[calc(100vh-100px)]">
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
          <div className="col-span-8 h-[calc(100vh-100px)]">
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
          <div className="col-span-2 h-[calc(100vh-100px)]">
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
    </div>
  );
}
