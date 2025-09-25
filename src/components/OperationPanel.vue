<template>
  <div class="operation-panel">
    <!-- Status Filters Row -->
    <div class="status-filters">
      <div class="filters-container">
        <label
          v-for="option in statusOptions"
          :key="option.key"
          class="filter-item"
          @click="handleStatusFilterChange(option.key)"
        >
          <div class="checkbox-wrapper">
            <CheckSquareOutlined v-if="statusFilters[option.key]" class="checkbox-icon checked" />
            <BorderOutlined v-else class="checkbox-icon unchecked" />
          </div>
          <span class="filter-label">{{ option.label }}</span>
        </label>
      </div>
    </div>

    <!-- Operation Buttons Row -->
    <div class="operation-buttons">
      <div class="buttons-container">
        <!-- Left: Selected Count -->
        <div class="selected-count">
          <div class="count-badge">
            已选：{{ tradeOrderSelectedCount }}/{{ tradeOrderTotalCount }}
          </div>
        </div>

        <!-- Right: Operation Buttons -->
        <div class="buttons-group">
          <a-button
            v-for="button in operationButtons"
            :key="button.key"
            :type="button.variant === 'primary' ? 'primary' : 'default'"
            :disabled="selectedCount === 0 && button.variant === 'primary'"
            class="operation-btn"
          >
            {{ button.label }}
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckSquareOutlined, BorderOutlined } from '@ant-design/icons-vue';
import { nextTick, watch } from 'vue';

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

interface Props {
  selectedCount: number;
  totalCount: number;
  tradeOrderSelectedCount?: number;
  tradeOrderTotalCount?: number;
  statusFilters: StatusFilters;
}

interface Emits {
  (e: 'statusFilterChange', filters: StatusFilters): void;
}

const props = withDefaults(defineProps<Props>(), {
  tradeOrderSelectedCount: 0,
  tradeOrderTotalCount: 0,
});

const emit = defineEmits<Emits>();

// 监听状态过滤器变化，触发高度重新计算
watch(() => props.statusFilters, () => {
  nextTick(() => {
    // 触发父组件重新计算高度
    window.dispatchEvent(new Event('resize'));
  });
}, { deep: true });

const handleStatusFilterChange = (key: keyof StatusFilters) => {
  const newFilters = {
    ...props.statusFilters,
    [key]: !props.statusFilters[key],
  };
  emit('statusFilterChange', newFilters);
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
</script>

<style scoped>
.operation-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #d9d9d9;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.status-filters {
  padding: 12px 24px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: color 0.2s;
}

.filter-item:hover {
  color: #1890ff;
}

.checkbox-wrapper {
  position: relative;
}

.checkbox-icon {
  width: 16px;
  height: 16px;
}

.checkbox-icon.checked {
  color: #1890ff;
}

.checkbox-icon.unchecked {
  color: #d9d9d9;
}

.filter-label {
  font-size: 14px;
  color: #595959;
  user-select: none;
}

.operation-buttons {
  padding: 16px 24px;
  background-color: white;
}

.buttons-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.selected-count {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.count-badge {
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.buttons-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
  min-width: 0;
}

.operation-btn {
  font-size: 14px;
  height: 32px;
  padding: 0 16px;
  flex-shrink: 0;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .buttons-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .buttons-group {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .operation-buttons {
    padding: 12px 16px;
  }
  
  .buttons-group {
    gap: 8px;
  }
  
  .operation-btn {
    font-size: 13px;
    height: 30px;
    padding: 0 12px;
  }
}
</style>