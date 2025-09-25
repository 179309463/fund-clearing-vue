import React, { forwardRef } from 'react';
import { CheckSquare, Square } from 'lucide-react';

interface StatusFilters {
  bondDistribution: boolean;
  fundManagerUnconfirmed: boolean;
  multipleReminders: boolean;
  noReminders: boolean;
  t0TradeUnsettled: boolean;
  accountingTimeout: boolean;
  custodyTimeout: boolean;
  awaitingUnlocking: boolean;
}

interface OperationPanelProps {
  selectedCount: number;
  totalCount: number;
  tradeOrderSelectedCount?: number;
  tradeOrderTotalCount?: number;
  statusFilters: StatusFilters;
  onStatusFilterChange: (filters: StatusFilters) => void;
}

const OperationPanel = forwardRef<HTMLDivElement, OperationPanelProps>(({
  selectedCount,
  totalCount,
  tradeOrderSelectedCount = 0,
  tradeOrderTotalCount = 0,
  statusFilters,
  onStatusFilterChange,
}, ref) => {
  const handleStatusFilterChange = (key: keyof StatusFilters) => {
    onStatusFilterChange({
      ...statusFilters,
      [key]: !statusFilters[key],
    });
  };

  const statusOptions = [
    { key: 'bondDistribution', label: '有债券分销未发起' },
    { key: 'fundManagerUnconfirmed', label: '有基金经理未确认' },
    { key: 'multipleReminders', label: '含有多项未办提醒' },
    { key: 'noReminders', label: '无未办提醒' },
    { key: 't0TradeUnsettled', label: '有T+0交易未成交' },
    { key: 'accountingTimeout', label: '核算超时' },
    { key: 'custodyTimeout', label: '托管行超时' },
    { key: 'awaitingUnlocking', label: '待解券' },
  ] as const;

  const operationButtons = [
    { key: 'accountingInitiate', label: '申请核算发起流程', variant: 'primary' },
    { key: 'accountingCancel', label: '申请核算撤销流程', variant: 'secondary' },
    { key: 'accountingManual', label: '申请核算手动流程', variant: 'secondary' },
    { key: 'accountingDept', label: '申请核算部流程', variant: 'secondary' },
    { key: 'noGeneration', label: '无需生成', variant: 'secondary' },
    { key: 'dvpTransfer', label: 'DVP互转', variant: 'secondary' },
    { key: 'autoClearing', label: '自动清算', variant: 'primary' },
    { key: 'securityDelivery', label: '证券交收', variant: 'secondary' },
    { key: 'setDelivery', label: '置为交收', variant: 'secondary' },
  ];

  const getButtonStyles = (variant: string) => {
    return variant === 'primary'
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300';
  };

  return (
    <div ref={ref} className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      {/* Status Filters Row */}
      <div className="px-6 py-3 border-b bg-gray-50">
        <div className="flex flex-wrap gap-4">
          {statusOptions.map((option) => (
            <label
              key={option.key}
              className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors"
            >
              <div className="relative">
                {statusFilters[option.key] ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <span className="text-sm text-gray-700 select-none">{option.label}</span>
              <input
                type="checkbox"
                checked={statusFilters[option.key]}
                onChange={() => handleStatusFilterChange(option.key)}
                className="sr-only"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Operation Buttons Row */}
      <div className="px-6 py-4 bg-white">
        <div className="flex items-center justify-between">
          {/* Left: Selected Count */}
          <div className="flex items-center">
            <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium">
              已选：{tradeOrderSelectedCount}/{tradeOrderTotalCount}
            </div>
          </div>

          {/* Right: Operation Buttons */}
          <div className="flex items-center space-x-3">
            {operationButtons.map((button, index) => (
              <button
                key={button.key}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${getButtonStyles(button.variant)}`}
                disabled={selectedCount === 0 && button.variant === 'primary'}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

OperationPanel.displayName = 'OperationPanel';

export default OperationPanel;