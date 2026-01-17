'use client';

// React
import { useState } from 'react';

// External libraries
import { ChevronDown, ChevronRight, DollarSign, FileText, Folder, TrendingUp, Users } from 'lucide-react';

// Types and utilities
import { Deal } from '@/lib/memory/types';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';

interface DealBrowserProps {
  deals: Deal[];
  activeDeal: string | null;
  onSelectDeal: (dealId: string) => void;
}

export default function DealBrowser({ deals, activeDeal, onSelectDeal }: DealBrowserProps) {
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);

  const selectedDeal = deals.find(d => d.id === activeDeal);

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full overflow-hidden flex flex-col min-h-0">
      {/* Header */}
      <div className="px-2 py-1.5 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Folder className="w-3 h-3 text-gray-600" />
          <h2 className="font-medium text-gray-900 text-[10px]">Deal Flow</h2>
        </div>
      </div>

      {/* Deal List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-1.5 space-y-0.5">
          {deals.map(deal => (
            <DealItem
              key={deal.id}
              deal={deal}
              isActive={deal.id === activeDeal}
              isExpanded={deal.id === expandedDeal}
              onSelect={() => onSelectDeal(deal.id)}
              onToggleExpand={() => setExpandedDeal(expandedDeal === deal.id ? null : deal.id)}
            />
          ))}
        </div>

        {/* Deal Details */}
        {selectedDeal && (
          <div className="border-t border-gray-200 p-2">
            <h3 className="font-medium text-gray-800 mb-2 text-[10px]">Deal Details</h3>
            <div className="space-y-2 text-[10px]">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-1">
                <MetricCard
                  icon={<DollarSign className="w-3 h-3 text-gray-600" />}
                  label="ARR"
                  value={formatCurrency(selectedDeal.metrics.arr)}
                />
                <MetricCard
                  icon={<TrendingUp className="w-3 h-3 text-gray-600" />}
                  label="Growth"
                  value={`${formatPercent(selectedDeal.metrics.growthMoM)} MoM`}
                />
                <MetricCard
                  icon={<DollarSign className="w-3 h-3 text-gray-600" />}
                  label="Burn"
                  value={`${formatCurrency(selectedDeal.metrics.burnMonthly)}/mo`}
                />
                <MetricCard
                  icon={<Users className="w-3 h-3 text-gray-600" />}
                  label="Customers"
                  value={selectedDeal.metrics.customers.toString()}
                />
              </div>

              {/* Risk Indicators */}
              <div className="space-y-0.5 pt-1.5 border-t border-gray-100 text-[9px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Runway</span>
                  <span className={selectedDeal.metrics.runwayMonths < 18 ? 'text-orange-600 font-medium' : 'text-gray-800'}>
                    {selectedDeal.metrics.runwayMonths} months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Top Customer %</span>
                  <span className={selectedDeal.metrics.topCustomerPct > 0.30 ? 'text-orange-600 font-medium' : 'text-gray-800'}>
                    {formatPercent(selectedDeal.metrics.topCustomerPct)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross Margin</span>
                  <span className="text-gray-800">{formatPercent(selectedDeal.metrics.grossMargin)}</span>
                </div>
              </div>

              {/* Team */}
              <div className="pt-1.5 border-t border-gray-100">
                <div className="text-gray-500 mb-0.5 text-[9px]">Team</div>
                <div className="text-[9px] space-y-0.5">
                  <div>
                    <span className="font-medium text-[#C96A50]">{selectedDeal.team.ceo.name}</span>
                    <span className="text-gray-500"> · {selectedDeal.team.ceo.background}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#C96A50]">{selectedDeal.team.cto.name}</span>
                    <span className="text-gray-500"> · {selectedDeal.team.cto.background}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DealItem({
  deal,
  isActive,
  isExpanded,
  onSelect,
  onToggleExpand,
}: {
  deal: Deal;
  isActive: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}) {
  return (
    <div className={`rounded transition-colors ${isActive ? 'bg-[#FDF0ED] border border-[#E8A090]' : 'hover:bg-gray-50'}`}>
      <div className="flex items-center gap-1 px-1.5 py-1">
        <button onClick={onToggleExpand} className="p-0.5 hover:bg-gray-200 rounded transition-colors">
          {isExpanded ? (
            <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
          ) : (
            <ChevronRight className="w-2.5 h-2.5 text-gray-400" />
          )}
        </button>
        <button
          onClick={onSelect}
          className="flex-1 flex items-center gap-1.5 text-left"
        >
          <Folder className={`w-3 h-3 ${isActive ? 'text-[#C96A50]' : 'text-gray-400'}`} />
          <div>
            <div className={`text-[11px] font-medium ${isActive ? 'text-[#C96A50]' : 'text-gray-900'}`}>
              {deal.name}
            </div>
            <div className="text-[9px] text-gray-500">
              {deal.stage} · {formatCurrency(deal.metrics.arr)} ARR
            </div>
          </div>
        </button>
      </div>

      {isExpanded && (
        <div className="px-2 pb-1 pl-7 space-y-0.5">
          <FileItem name="pitch_deck.pdf" />
          <FileItem name="financials.xlsx" />
          <FileItem name="notes.md" />
        </div>
      )}
    </div>
  );
}

function FileItem({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-1 text-[9px] text-gray-600 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer transition-colors">
      <FileText className="w-2.5 h-2.5 text-gray-400" />
      {name}
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded p-1 border border-gray-200">
      <div className="flex items-center gap-0.5 text-gray-500 text-[9px] mb-0.5">
        {icon}
        {label}
      </div>
      <div className="font-medium text-gray-900 text-[10px]">{value}</div>
    </div>
  );
}
