'use client';

// React
import { useState, useEffect } from 'react';

// External libraries
import {
  AlertTriangle,
  Brain,
  ChevronDown,
  ChevronRight,
  Edit2,
  FileText,
  History,
  Info,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react';

// Types and utilities
import { Memory, RedFlag } from '@/lib/memory/types';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';

interface MemoryPanelProps {
  memory: Memory;
  onUpdateMemory: (memory: Memory) => void;
  highlightedItems: string[];
}

export default function MemoryPanel({
  memory,
  onUpdateMemory,
  highlightedItems
}: MemoryPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    thesis: false,
    redFlags: true,
    preferences: false,
    history: false,
  });
  const [editingFlag, setEditingFlag] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fix hydration error: only show time on client
  useEffect(() => {
    setLastUpdated(new Date(memory.updatedAt).toLocaleTimeString());
  }, [memory.updatedAt]);

  // Show updating state when highlights are present
  useEffect(() => {
    if (highlightedItems.length > 0) {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightedItems]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const deleteRedFlag = (id: string) => {
    const updatedFlags = memory.redFlags.filter(f => f.id !== id);
    onUpdateMemory({
      ...memory,
      redFlags: updatedFlags,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateRedFlagThreshold = (id: string, newThreshold: string) => {
    const updatedFlags = memory.redFlags.map(f => 
      f.id === id ? { ...f, threshold: newThreshold, description: `${f.pattern.replace(/_/g, ' ')} ${newThreshold}` } : f
    );
    onUpdateMemory({
      ...memory,
      redFlags: updatedFlags,
      updatedAt: new Date().toISOString(),
    });
    setEditingFlag(null);
  };

  const isHighlighted = (itemId: string) => highlightedItems.includes(itemId);

  const isEmpty = !memory.investmentThesis && 
    memory.redFlags.length === 0 && 
    !memory.memoPreferences && 
    memory.dealHistory.length === 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full overflow-hidden flex flex-col min-h-0">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-gray-600" />
          <h2 className="font-medium text-gray-900 text-xs">Memory</h2>
          {isUpdating && (
            <span className="flex items-center gap-1 text-xs text-[#C96A50]">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>Updating...</span>
            </span>
          )}
          {!isEmpty && !isUpdating && (
            <span className="ml-auto text-xs text-gray-500">
              {memory.redFlags.length + memory.dealHistory.length + (memory.investmentThesis ? 1 : 0) + (memory.memoPreferences ? 1 : 0)} items
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
        {isEmpty ? (
          <div className="text-center py-6 text-gray-400">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No memories yet</p>
            <p className="text-[10px] mt-0.5 text-gray-400">Chat with Claude to build memory</p>
          </div>
        ) : (
          <>
            {/* Investment Thesis */}
            {memory.investmentThesis && (
              <Section
                title="Investment Thesis"
                icon={<Target className="w-4 h-4 text-gray-600" />}
                expanded={expandedSections.thesis}
                onToggle={() => toggleSection('thesis')}
                highlighted={isHighlighted('thesis')}
              >
                <div className="space-y-2 text-sm">
                  {memory.investmentThesis.stages && memory.investmentThesis.stages.length > 0 && (
                    <div>
                      <span className="text-gray-500">Stages:</span>{' '}
                      <span className="text-gray-800">{memory.investmentThesis.stages.join(', ')}</span>
                    </div>
                  )}
                  {memory.investmentThesis.sectors && memory.investmentThesis.sectors.length > 0 && (
                    <div>
                      <span className="text-gray-500">Sectors:</span>{' '}
                      <span className="text-gray-800">{memory.investmentThesis.sectors.join(', ')}</span>
                    </div>
                  )}
                  {memory.investmentThesis.checkSize && (
                    <div>
                      <span className="text-gray-500">Check size:</span>{' '}
                      <span className="text-gray-800">
                        {formatCurrency(memory.investmentThesis.checkSize.min)} - {formatCurrency(memory.investmentThesis.checkSize.max)}
                      </span>
                    </div>
                  )}
                  {memory.investmentThesis.priorities && memory.investmentThesis.priorities.length > 0 && (
                    <div>
                      <span className="text-gray-500">Priorities:</span>{' '}
                      <span className="text-gray-800">{memory.investmentThesis.priorities.join(', ')}</span>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Red Flags */}
            {memory.redFlags.length > 0 && (
              <Section
                title="Red Flags"
                icon={<AlertTriangle className="w-4 h-4 text-gray-600" />}
                expanded={expandedSections.redFlags}
                onToggle={() => toggleSection('redFlags')}
                highlighted={highlightedItems.some(h => h.startsWith('rf_'))}
                badge={memory.redFlags.length}
              >
                <div className="space-y-2">
                  {memory.redFlags.map(flag => (
                    <RedFlagItem
                      key={flag.id}
                      flag={flag}
                      highlighted={isHighlighted(flag.id)}
                      editing={editingFlag === flag.id}
                      onEdit={() => setEditingFlag(flag.id)}
                      onDelete={() => deleteRedFlag(flag.id)}
                      onSave={(newThreshold) => updateRedFlagThreshold(flag.id, newThreshold)}
                      onCancel={() => setEditingFlag(null)}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Memo Preferences */}
            {memory.memoPreferences && (
              <Section
                title="Memo Preferences"
                icon={<FileText className="w-4 h-4 text-gray-600" />}
                expanded={expandedSections.preferences}
                onToggle={() => toggleSection('preferences')}
                highlighted={isHighlighted('preferences')}
              >
                <div className="space-y-2 text-sm">
                  {memory.memoPreferences.structure && memory.memoPreferences.structure.length > 0 && (
                    <div>
                      <span className="text-gray-500">Structure:</span>{' '}
                      <span className="text-gray-800">{memory.memoPreferences.structure.join(' → ')}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Tone:</span>{' '}
                    <span className="text-gray-800 capitalize">{memory.memoPreferences.tone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Hedge language:</span>{' '}
                    <span className="text-gray-800">{memory.memoPreferences.hedgeLanguage ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </Section>
            )}

            {/* Deal History */}
            {memory.dealHistory.length > 0 && (
              <Section
                title="Deal History"
                icon={<History className="w-4 h-4 text-gray-600" />}
                expanded={expandedSections.history}
                onToggle={() => toggleSection('history')}
                highlighted={highlightedItems.some(h => h.startsWith('deal_'))}
                badge={memory.dealHistory.length}
              >
                <div className="space-y-2">
                  {memory.dealHistory.map((deal, index) => (
                    <div
                      key={index}
                      className={`text-sm p-2 rounded ${isHighlighted(`deal_${deal.company}`) ? 'bg-[#FDF0ED] ring-1 ring-[#E8A090]' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-800 truncate">{deal.company}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${
                          deal.outcome === 'pass' ? 'bg-red-100 text-red-700' :
                          deal.outcome === 'invest' ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {deal.outcome.toUpperCase()}
                        </span>
                      </div>
                      {deal.reasons && deal.reasons.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {deal.reasons.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-gray-200 bg-gray-50 text-[10px] text-gray-500 flex-shrink-0">
        Last updated: {lastUpdated || '—'}
      </div>
    </div>
  );
}

// Helper Components

function Section({
  title,
  icon,
  expanded,
  onToggle,
  highlighted,
  badge,
  children
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  highlighted?: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border ${highlighted ? 'border-[#E8A090] bg-[#FDF0ED]' : 'border-gray-200'} overflow-hidden transition-all`}>
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
        {icon}
        <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{title}</span>
        {badge !== undefined && (
          <span className="ml-auto text-xs text-gray-600 px-1.5 py-0.5">
            {badge}
          </span>
        )}
        {highlighted && (
          <Sparkles className="w-3.5 h-3.5 text-[#C96A50] ml-1 animate-pulse" />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

function RedFlagItem({
  flag,
  highlighted,
  editing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}: {
  flag: RedFlag;
  highlighted: boolean;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (newThreshold: string) => void;
  onCancel: () => void;
}) {
  const [editValue, setEditValue] = useState(flag.threshold?.toString() || '');

  return (
    <div className={`text-sm p-2 rounded ${highlighted ? 'bg-[#FDF0ED] ring-1 ring-[#E8A090]' : 'bg-gray-50'} group`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded w-24"
                autoFocus
              />
              <button onClick={() => onSave(editValue)} className="text-green-600 text-xs">Save</button>
              <button onClick={onCancel} className="text-gray-400 text-xs">Cancel</button>
            </div>
          ) : (
            <span className="text-gray-800">{flag.description}</span>
          )}
        </div>
        {!editing && (
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="p-1 hover:bg-gray-200 rounded" title="Edit threshold">
              <Edit2 className="w-3 h-3 text-gray-400 hover:text-gray-600" />
            </button>
            <button onClick={onDelete} className="p-1 hover:bg-gray-200 rounded" title="Delete red flag">
              <Trash2 className="w-3 h-3 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1">
        {!flag.explicit && (
          <span className="text-xs text-[#C96A50] flex items-center gap-1">
            <Info className="w-3 h-3" />
            Inferred ({Math.round(flag.confidence * 100)}% conf)
          </span>
        )}
        {flag.explicit && (
          <span className="text-xs text-gray-400">Explicit rule</span>
        )}
      </div>
    </div>
  );
}
