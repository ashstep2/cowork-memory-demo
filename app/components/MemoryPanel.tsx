'use client';

// React
import { useState, useEffect } from 'react';

// External libraries
import {
  AlertTriangle,
  Brain,
  ChevronDown,
  ChevronRight,
  Download,
  Edit2,
  FileText,
  History,
  Info,
  Share2,
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

  // Export memory as JSON file
  const handleExport = () => {
    const dataStr = JSON.stringify(memory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `memory-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy memory as shareable text
  const handleShare = () => {
    const shareText = generateShareableText(memory);
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Memory copied to clipboard! Share with your team.');
    });
  };

  // Generate human-readable shareable text
  const generateShareableText = (mem: Memory): string => {
    let text = '# Investment Memory Profile\n\n';
    text += `Last Updated: ${new Date(mem.updatedAt).toLocaleString()}\n\n`;

    if (mem.investmentThesis) {
      text += '## Investment Thesis\n';
      if (mem.investmentThesis.stages?.length) {
        text += `**Stages:** ${mem.investmentThesis.stages.join(', ')}\n`;
      }
      if (mem.investmentThesis.sectors?.length) {
        text += `**Sectors:** ${mem.investmentThesis.sectors.join(', ')}\n`;
      }
      if (mem.investmentThesis.checkSize) {
        text += `**Check Size:** $${mem.investmentThesis.checkSize.min}M - $${mem.investmentThesis.checkSize.max}M\n`;
      }
      if (mem.investmentThesis.priorities?.length) {
        text += `**Priorities:** ${mem.investmentThesis.priorities.join(', ')}\n`;
      }
      text += '\n';
    }

    if (mem.redFlags.length > 0) {
      text += '## Red Flags\n';
      mem.redFlags.forEach(flag => {
        text += `- ${flag.description} (threshold: ${flag.threshold}, confidence: ${Math.round(flag.confidence * 100)}%)\n`;
      });
      text += '\n';
    }

    if (mem.dealHistory.length > 0) {
      text += '## Deal History\n';
      mem.dealHistory.forEach(deal => {
        text += `- **${deal.company}**: ${deal.outcome}\n`;
        if (deal.reasons && deal.reasons.length > 0) {
          text += `  Reasons: ${deal.reasons.join(', ')}\n`;
        }
      });
      text += '\n';
    }

    if (mem.memoPreferences) {
      text += '## Memo Preferences\n';
      text += `**Tone:** ${mem.memoPreferences.tone}\n`;
      text += `**Hedge Language:** ${mem.memoPreferences.hedgeLanguage ? 'Yes' : 'No'}\n`;
      if (mem.memoPreferences.maxLengthPages) {
        text += `**Max Length:** ${mem.memoPreferences.maxLengthPages} pages\n`;
      }
      if (mem.memoPreferences.structure && mem.memoPreferences.structure.length > 0) {
        text += `**Structure:** ${mem.memoPreferences.structure.join(', ')}\n`;
      }
    }

    return text;
  };

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
          <div className="ml-auto flex items-center gap-2">
            {!isEmpty && !isUpdating && (
              <>
                <span className="text-xs text-gray-500">
                  {memory.redFlags.length + memory.dealHistory.length + (memory.investmentThesis ? 1 : 0) + (memory.memoPreferences ? 1 : 0)} items
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleShare}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copy shareable summary"
                  >
                    <Share2 className="w-3.5 h-3.5 text-gray-600 hover:text-[#C96A50]" />
                  </button>
                  <button
                    onClick={handleExport}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Export as JSON"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-600 hover:text-[#C96A50]" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 pb-6 space-y-2 min-h-0">
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
                <div className="space-y-3 text-sm">
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

                  {/* Confidence indicator */}
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-gray-500">
                        {memory.investmentThesis.explicit ? 'Explicitly stated' : 'Inferred from conversation'}
                      </span>
                      <span className="text-gray-600 font-medium">
                        {Math.round(memory.investmentThesis.confidence * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${memory.investmentThesis.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* Red Flags */}
            {memory.redFlags.length > 0 && (
              <Section
                title="🚩 Red Flags"
                icon={<AlertTriangle className="w-4 h-4 text-gray-600" />}
                expanded={expandedSections.redFlags}
                onToggle={() => toggleSection('redFlags')}
                highlighted={isHighlighted('redFlags')}
                badge={memory.redFlags.length}
              >
                <div className="space-y-2">
                  {memory.redFlags.map(flag => (
                    <RedFlagItem
                      key={flag.id}
                      flag={flag}
                      highlighted={false}
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
                <div className="space-y-3 text-sm">
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

                  {/* Confidence indicator */}
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-gray-500">Learned from writing style</span>
                      <span className="text-gray-600 font-medium">
                        {Math.round(memory.memoPreferences.confidence * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          memory.memoPreferences.confidence >= 0.9 ? 'bg-green-500' : 'bg-[#C96A50]'
                        }`}
                        style={{ width: `${memory.memoPreferences.confidence * 100}%` }}
                      />
                    </div>
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
                highlighted={isHighlighted('history')}
                badge={memory.dealHistory.length}
              >
                <div className="space-y-2">
                  {memory.dealHistory.map((deal, index) => (
                    <div
                      key={index}
                      className="text-sm p-2 rounded bg-gray-50"
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
      <div className="px-3 py-1.5 border-t border-gray-200 bg-white text-[10px] text-gray-500 flex-shrink-0">
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
    <div className={`text-sm p-2 rounded ${highlighted ? 'bg-[#FDF0ED] ring-1 ring-[#E8A090]' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded w-24 focus:ring-2 focus:ring-[#C96A50] focus:border-[#C96A50] outline-none"
                autoFocus
              />
              <button
                onClick={() => onSave(editValue)}
                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={onCancel}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <span className="text-gray-800">{flag.description}</span>
          )}
        </div>
        {!editing && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-300 transition-all"
              title="Edit threshold"
            >
              <Edit2 className="w-3.5 h-3.5 text-gray-500 hover:text-[#C96A50]" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-white rounded border border-transparent hover:border-red-300 transition-all"
              title="Delete red flag"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 mt-2">
        {/* Confidence meter */}
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">
              {flag.explicit ? 'Explicit rule' : 'Inferred'}
            </span>
            <span className="text-gray-600 font-medium">
              {Math.round(flag.confidence * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                flag.confidence >= 0.9 ? 'bg-green-500' :
                flag.confidence >= 0.7 ? 'bg-[#C96A50]' :
                'bg-yellow-500'
              }`}
              style={{ width: `${flag.confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Times applied counter */}
        <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded border border-gray-200">
          <span className="text-[10px] text-gray-500">Applied</span>
          <span className="text-xs font-medium text-gray-700">{flag.timesApplied}×</span>
        </div>
      </div>
    </div>
  );
}
