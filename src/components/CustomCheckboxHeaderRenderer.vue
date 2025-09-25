<template>
  <div class="checkbox-header-container">
    <input
      type="checkbox"
      :checked="checkboxState === 'all'"
      :ref="setCheckboxRef"
      @change="handleHeaderCheckboxChange"
      class="custom-checkbox"
      :title="checkboxState === 'all' ? '取消全选' : checkboxState === 'some' ? '全选' : '全选'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { fundData, NodeType } from '../data/fundData';

interface Props {
  api: any;
  columnApi: any;
}

const props = defineProps<Props>();

const checkboxRef = ref<HTMLInputElement | null>(null);
const checkboxState = ref<'none' | 'some' | 'all'>('none');

const setCheckboxRef = (el: HTMLInputElement | null) => {
  checkboxRef.value = el;
  if (el) {
    el.indeterminate = checkboxState.value === 'some';
  }
};

// 计算全局选择状态（基于左下角的已选和全部总数）
const calculateGlobalSelectionState = () => {
  let selectedCount = 0;
  let totalCount = 0;

  const countRows = (items: any[]) => {
    items.forEach(item => {
      totalCount++;
      if (item.selected) {
        selectedCount++;
      }
      if (item.children) {
        item.children.forEach((custody: any) => {
          totalCount++;
          if (custody.selected) {
            selectedCount++;
          }
          if (custody.children) {
            custody.children.forEach((transfer: any) => {
              totalCount++;
              if (transfer.selected) {
                selectedCount++;
              }
              if (transfer.children) {
                transfer.children.forEach((tradeOrder: any) => {
                  totalCount++;
                  if (tradeOrder.selected) {
                    selectedCount++;
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  countRows(fundData);

  if (totalCount === 0) {
    return 'none';
  }

  if (selectedCount === 0) {
    return 'none';
  } else if (selectedCount === totalCount) {
    return 'all';
  } else {
    return 'some';
  }
};

// 更新选择状态
const updateSelectionState = () => {
  const newState = calculateGlobalSelectionState();
  checkboxState.value = newState;
  
  nextTick(() => {
    if (checkboxRef.value) {
      checkboxRef.value.indeterminate = newState === 'some';
    }
  });
};

// 递归统计所有成交单的选择状态
const getTradeOrderStats = (nodeData: any): { selectedCount: number; totalCount: number } => {
  let selectedCount = 0;
  let totalCount = 0;

  const traverse = (item: any) => {
    if (item.nodeType === NodeType.TRADE_ORDER) {
      totalCount++;
      if (item.selected) {
        selectedCount++;
      }
    }

    if (item.children && Array.isArray(item.children)) {
      item.children.forEach(traverse);
    }
  };

  traverse(nodeData);
  return { selectedCount, totalCount };
};

// 处理表头复选框点击
const handleHeaderCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const isChecked = target.checked;

  // 判断当前是否为半选状态
  const currentState = calculateGlobalSelectionState();
  const isFromIndeterminate = currentState === 'some';

  // 递归更新所有层级的选择状态，使用与CustomCheckboxRenderer相同的逻辑
  const cascadeSelection = (items: any[], selected: boolean, isFromIndeterminate: boolean = false) => {
    const traverse = (item: any) => {
      if (item.nodeType === NodeType.TRADE_ORDER) {
        // 成交单节点
        if (selected) {
          if (isFromIndeterminate) {
            // 从半选状态切换到选中：选择所有成交单，不管状态
            item.selected = true;
          } else {
            // 从未选状态切换到选中：只选择未生成状态的成交单
            if (item.instructionStatus === '未生成') {
              item.selected = true;
            }
            // 已生成的成交单保持原状态不变
          }
        } else {
          // 取消勾选时：取消所有成交单的选择（不管状态）
          item.selected = false;
        }
      } else {
        // 非成交单节点：先递归处理子节点，然后根据子节点状态决定自己的状态
        if (item.children && Array.isArray(item.children)) {
          item.children.forEach(traverse);
        }

        // 处理完子节点后，根据子节点的成交单状态决定自己的状态
        if (selected) {
          // 勾选时：只有当有成交单被选中时，才选中自己
          const stats = getTradeOrderStats(item);
          item.selected = stats.selectedCount > 0;
        } else {
          // 取消勾选时：直接取消选择
          item.selected = false;
        }
      }
    };

    items.forEach(traverse);
  };

  // 更新fundData中的所有数据
  cascadeSelection(fundData, isChecked, isFromIndeterminate);

  // 触发全局刷新事件，更新所有网格
  setTimeout(() => {
    const event = new CustomEvent('refreshAllGrids');
    window.dispatchEvent(event);

    // 触发选择变化事件
    props.api.dispatchEvent({ type: 'selectionChanged' });
  }, 10);
};

// 事件监听器
const onSelectionChanged = () => {
  updateSelectionState();
};

const onModelUpdated = () => {
  updateSelectionState();
};

const onGlobalRefresh = () => {
  setTimeout(() => {
    updateSelectionState();
  }, 10);
};

onMounted(() => {
  props.api.addEventListener('selectionChanged', onSelectionChanged);
  props.api.addEventListener('modelUpdated', onModelUpdated);
  window.addEventListener('refreshAllGrids', onGlobalRefresh);

  // 初始化状态
  updateSelectionState();
});

onUnmounted(() => {
  props.api.removeEventListener('selectionChanged', onSelectionChanged);
  props.api.removeEventListener('modelUpdated', onModelUpdated);
  window.removeEventListener('refreshAllGrids', onGlobalRefresh);
});
</script>

<style scoped>
.checkbox-header-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
}

.custom-checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
}
</style>