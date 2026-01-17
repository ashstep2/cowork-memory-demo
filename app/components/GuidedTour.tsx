'use client';

// React
import { useState } from 'react';

// External libraries
import { Check, ChevronRight, Play, RotateCcw, Sparkles } from 'lucide-react';

interface TourStep {
  id: string;
  wowNumber: number;
  title: string;
  description: string;
  suggestedPrompt: string;
  whatToNotice: string[];
  dealToSelect?: string;
  requiresNewSession?: boolean;
  followUpPrompt?: string;
  followUpNotice?: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'wow1',
    wowNumber: 1,
    title: 'WOW 1: Basic Recall',
    description: 'Tell Claude about Anthropic\'s strategic priorities, then start a new session and watch it remember.',
    suggestedPrompt: `Our strategic priorities: Invest in developer tools that strengthen Claude's ecosystem. Target companies with strong mission alignment (AI safety, Constitutional AI). Check sizes $10-30M for strategic investments. We care deeply about Claude API integration and competitive positioning vs. OpenAI.`,
    whatToNotice: [
      'Watch the Memory panel populate with strategic priorities',
      'Claude acknowledges and summarizes Anthropic\'s criteria',
    ],
    followUpPrompt: `We have an acquisition opportunity for Bun (the JavaScript runtime). Does this align with our strategic criteria?`,
    followUpNotice: [
      'Start a new session → Claude remembers priorities without repeating',
      'Select Bun deal → Claude evaluates against Anthropic\'s criteria automatically',
    ],
    dealToSelect: 'bun',
    requiresNewSession: true,
  },
  {
    id: 'wow2',
    wowNumber: 2,
    title: 'WOW 2: Implicit Learning',
    description: 'Review LangChain and express concerns. Claude will learn your decision criteria without explicit instructions.',
    suggestedPrompt: `Review the LangChain opportunity. Give me the key metrics and strategic considerations.`,
    whatToNotice: [
      'Claude surfaces key metrics and strategic risks automatically',
      'After you respond, express concerns about runway and dependency risk',
    ],
    followUpPrompt: `The tight runway (18 months) concerns me - that's borderline for momentum. And the competitive dynamics with Sequoia leading could create conflicts. Also, they control the abstraction layer above Claude which is a dependency risk. Pass for now.`,
    followUpNotice: [
      'Watch Red Flags section update with your specific thresholds',
      'Claude learns: runway <18mo = risky, strategic control = red flag',
      'Deal History records your decision and reasoning',
    ],
    dealToSelect: 'langchain',
    requiresNewSession: true,
  },
  {
    id: 'wow3',
    wowNumber: 3,
    title: 'WOW 3: Cross-Deal Inference',
    description: 'Review a new opportunity. Claude will connect patterns from past decisions and proactively apply your learned criteria.',
    suggestedPrompt: `I have a new opportunity to review - Humanloop. Given our recent strategic decisions, what should I focus on?`,
    whatToNotice: [
      'Claude references your LangChain pass and specific concerns',
      'It proactively checks Humanloop against YOUR learned criteria',
      'Connects patterns: compares runway, strategic fit, dependency risks',
    ],
    dealToSelect: 'humanloop',
    requiresNewSession: true,
  },
  {
    id: 'wow4',
    wowNumber: 4,
    title: 'WOW 4: Behavioral Adaptation',
    description: 'Ask for a memo. Claude will use your preferred style and structure automatically.',
    suggestedPrompt: `Write up the investment memo for Humanloop.`,
    whatToNotice: [
      'Claude uses learned memo structure (Strategic Fit → Metrics → Risks)',
      'Tone is direct with no hedging - matches your communication style',
      'Gives clear recommendation without being asked',
    ],
  },
  {
    id: 'wow5',
    wowNumber: 5,
    title: 'WOW 5: User Control',
    description: 'Edit your memory directly. Changes take effect immediately in the next conversation.',
    suggestedPrompt: `(No prompt needed - interact with the Memory panel)`,
    whatToNotice: [
      'Look at the Red Flags section in the Memory panel',
      'Click edit (pencil) to change thresholds or delete (trash) to remove',
      'Export memory as JSON or share as markdown summary',
      'Your next conversation reflects changes instantly',
    ],
  },
];

interface GuidedTourProps {
  currentStep: number;
  onSetStep: (step: number) => void;
  onUseSuggestedPrompt: (prompt: string) => void;
  onSelectDeal: (dealId: string) => void;
  onNewSession: () => void;
  onReset: () => void;
  completedSteps: number[];
}

export default function GuidedTour({
  currentStep,
  onSetStep,
  onUseSuggestedPrompt,
  onSelectDeal,
  onNewSession,
  onReset,
  completedSteps,
}: GuidedTourProps) {
  const [showFollowUp, setShowFollowUp] = useState(false);
  const step = TOUR_STEPS[currentStep];
  const isComplete = currentStep >= TOUR_STEPS.length;

  const handleUsePrompt = (prompt: string) => {
    onUseSuggestedPrompt(prompt);
    if (step?.followUpPrompt && !showFollowUp) {
      setShowFollowUp(true);
    }
  };

  const handleNextStep = () => {
    setShowFollowUp(false);
    onSetStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setShowFollowUp(false);
    onSetStep(Math.max(0, currentStep - 1));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full overflow-hidden flex flex-col min-h-0">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gray-600" />
            <h2 className="font-medium text-gray-900 text-xs">Guided Demo</h2>
          </div>
          <button
            onClick={onReset}
            className="text-[10px] text-gray-700 hover:text-gray-900 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-1">
          {TOUR_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setShowFollowUp(false);
                onSetStep(i);
              }}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < currentStep
                  ? 'bg-[#C96A50]'
                  : i === currentStep
                    ? 'bg-[#E8A090]'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1.5">
          Step {currentStep + 1} of {TOUR_STEPS.length}
        </div>
      </div>

      {/* Current Step */}
      {!isComplete && step && (
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          <div className="p-4 flex-1">
            {/* Step Header */}
            <div className="mb-3">
              <h3 className="font-medium text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {step.requiresNewSession && (
                <button
                  onClick={onNewSession}
                  className="w-full text-left px-3 py-2 bg-[#FDF0ED] text-[#C96A50] rounded-lg text-sm hover:bg-[#FCE5DF] transition-colors flex items-center gap-2 border border-[#E8A090]"
                >
                  <Play className="w-4 h-4" />
                  Start New Session (keeps memory)
                </button>
              )}

              {step.dealToSelect && (
                <button
                  onClick={() => onSelectDeal(step.dealToSelect!)}
                  className="w-full text-left px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  📁 Select {step.dealToSelect === 'humanloop' ? 'Humanloop' : step.dealToSelect === 'langchain' ? 'LangChain' : 'Bun'} opportunity
                </button>
              )}

              {step.suggestedPrompt && !step.suggestedPrompt.startsWith('(') && (
                <button
                  onClick={() => handleUsePrompt(step.suggestedPrompt)}
                  className="w-full text-left px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                >
                  <div className="text-xs text-gray-500 mb-1">Suggested prompt:</div>
                  <div className="text-gray-700">{step.suggestedPrompt}</div>
                </button>
              )}

              {showFollowUp && step.followUpPrompt && (
                <button
                  onClick={() => handleUsePrompt(step.followUpPrompt!)}
                  className="w-full text-left px-3 py-2 bg-[#FDF0ED] border border-[#E8A090] rounded-lg text-sm hover:bg-[#FCE5DF] transition-colors"
                >
                  <div className="text-xs text-[#C96A50] mb-1">Follow-up prompt:</div>
                  <div className="text-gray-700">{step.followUpPrompt}</div>
                </button>
              )}
            </div>

            {/* What to Notice */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-2">👀 What to notice:</div>
              <ul className="space-y-1">
                {(showFollowUp && step.followUpNotice ? step.followUpNotice : step.whatToNotice).map((notice, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 mt-0.5 text-[#C96A50] flex-shrink-0" />
                    {notice}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Navigation - Fixed at bottom */}
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={handleNextStep}
                className="text-sm text-[#C96A50] hover:text-[#B85A40] font-medium flex items-center gap-1"
              >
                {currentStep < TOUR_STEPS.length - 1 ? 'Next Step' : 'Finish Tour'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete State */}
      {isComplete && (
        <div className="p-6 text-center flex-1 flex flex-col items-center justify-center min-h-0">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-medium text-gray-900">Tour Complete!</h3>
          <p className="text-sm text-gray-600 mt-1">
            You've seen all 5 Wow Moments. Feel free to continue exploring!
          </p>
          <button
            onClick={onReset}
            className="mt-4 text-sm text-[#C96A50] hover:text-[#B85A40] font-medium px-3 py-1.5 rounded hover:bg-[#FDF0ED] transition-colors"
          >
            Restart Tour
          </button>
        </div>
      )}
    </div>
  );
}

export { TOUR_STEPS };
