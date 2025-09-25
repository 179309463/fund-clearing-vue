<template>
  <div class="checkbox-container">
    <input
      type="checkbox"
      :checked="checkboxState.checked"
      :ref="setCheckboxRef"
      @change="handleChange"
      class="custom-checkbox"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';
import { NodeType } from '../data/fundData';

interface Props {
  data: any;
  api: any;
  node: any;
}

const props = defineProps<Props>();

// 添加一个响应式状态来强制重新渲染
const forceUpdateKey = ref(0);
const checkboxRef = ref<HTMLInputElement | null>(null);

const setCheckboxRef = (el: HTMLInputElement | null) => {
  checkboxRef.value = el;
  if (el) {
    el.indeterminate = checkboxState.value.indeterminate;
  }
};

// 递归统计所有成交单的选择状态
const getTradeOrderStats = (nodeData: any): { selectedCount: number; totalCount: number } => {
  let selectedCount = 0;
  let totalCount = 0;
  console.log('=== getTradeOrderStats for:', nodeData.id, '===');

  const traverse = (item: any) => {
    if (item.nodeType === NodeType.TRADE_ORDER) {
      totalCount++;
      if (item.selected) {
        selectedCount++;
      }
      console.log('Trade order:', item.id, 'selected:', item.selected);
    }

    if (item.children && Array.isArray(item.children)) {
      item.children.forEach(traverse);
    }
  };

  traverse(nodeData);
  console.log('Stats result - selected:', selectedCount, 'total:', totalCount);
  return { selectedCount, totalCount };
};

// 递归设置所有子节点的选择状态
const cascadeSelection = (nodeData: any, selected: boolean, isFromIndeterminate: boolean = false) => {
  console.log('=== cascadeSelection start ===');
  console.log('Node data:', nodeData);
  console.log('Selected:', selected);
  console.log('Is from indeterminate:', isFromIndeterminate);
  console.log('Children:', nodeData.children?.length || 0);

  const traverse = (item: any) => {
    console.log('Traversing item:', item.id, 'type:', item.nodeType);
    
    if (item.nodeType === NodeType.TRADE_ORDER) {
      // 成交单节点
      console.log('Processing trade order:', item.id, 'instructionStatus:', item.instructionStatus);
      if (selected) {
        if (isFromIndeterminate) {
          // 从半选状态切换到选中：选择所有成交单，不管状态
          item.selected = true;
          console.log('Set trade order selected (from indeterminate):', item.id);
        } else {
          // 从未选状态切换到选中：只选择未生成状态的成交单
          if (item.instructionStatus === '未生成') {
            item.selected = true;
            console.log('Set trade order selected (未生成):', item.id);
          } else {
            console.log('Skip trade order (已生成):', item.id);
          }
          // 已生成的成交单保持原状态不变
        }
      } else {
        // 取消勾选时：取消所有成交单的选择（不管状态）
        item.selected = false;
        console.log('Unset trade order selected:', item.id);
      }
    } else {
      // 非成交单节点：先递归处理子节点，然后根据子节点状态决定自己的状态
      console.log('Processing non-trade order node:', item.id);
      if (item.children && Array.isArray(item.children)) {
        console.log('Processing children of:', item.id, 'count:', item.children.length);
        item.children.forEach(traverse);
      }

      // 处理完子节点后，根据子节点的成交单状态决定自己的状态
      if (selected) {
        // 勾选时：只有当有成交单被选中时，才选中自己
        const stats = getTradeOrderStats(item);
        console.log('Trade order stats for', item.id, ':', stats);
        item.selected = stats.selectedCount > 0;
        console.log('Set non-trade order selected:', item.id, 'to:', item.selected);
      } else {
        // 取消勾选时：直接取消选择
        item.selected = false;
        console.log('Unset non-trade order selected:', item.id);
      }
    }
  };

  // 从当前节点的子节点开始遍历
  if (nodeData.children && Array.isArray(nodeData.children)) {
    console.log('Starting traverse from children of:', nodeData.id);
    nodeData.children.forEach(traverse);
  } else {
    console.log('No children to traverse for:', nodeData.id);
  }
  console.log('=== cascadeSelection end ===');
};

// 计算复选框状态
const getCheckboxState = () => {
  if (!props.data) {
    return { checked: false, indeterminate: false };
  }

  // 第4层成交单：直接返回自己的选择状态
  if (props.data.nodeType === NodeType.TRADE_ORDER) {
    return { checked: props.data.selected || false, indeterminate: false };
  }

  // 第1/2/3层：根据子节点中成交单的选择状态决定
  const stats = getTradeOrderStats(props.data);

  // 如果没有成交单，则根据自身状态决定
  if (stats.totalCount === 0) {
    return { checked: props.data.selected || false, indeterminate: false };
  }

  // 有成交单时，根据成交单的选择情况决定
  if (stats.selectedCount === 0) {
    // 没有成交单被选中
    return { checked: false, indeterminate: false };
  } else if (stats.selectedCount === stats.totalCount) {
    // 所有成交单都被选中
    return { checked: true, indeterminate: false };
  } else {
    // 部分成交单被选中
    return { checked: false, indeterminate: true };
  }
};

// 使用computed并依赖forceUpdateKey来强制重新计算
const checkboxState = computed(() => {
  // 依赖forceUpdateKey来触发重新计算
  forceUpdateKey.value;
  return getCheckboxState();
});

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newValue = target.checked;

  console.log('=== CustomCheckboxRenderer handleChange ===');
  console.log('Node data:', props.data);
  console.log('Node type:', props.data?.nodeType);
  console.log('New value:', newValue);
  console.log('Current selected state:', props.data?.selected);
  console.log('API available:', !!props.api);

  if (props.data) {
    // 设置当前节点的状态
    props.data.selected = newValue;
    console.log('Set current node selected to:', newValue);

    // 如果是第4层成交单，只设置自己，不处理子节点
    if (props.data.nodeType === NodeType.TRADE_ORDER) {
      // 成交单节点无需级联处理
      console.log('Trade order node - no cascading needed');
    } else {
      // 对于第1/2/3层级，执行级联选择
      // 判断当前是否为半选状态
      const currentCheckboxState = checkboxState.value;
      const isFromIndeterminate = currentCheckboxState.indeterminate;
      console.log('Non-trade order node - cascading selection');
      console.log('Current checkbox state:', currentCheckboxState);
      console.log('Is from indeterminate:', isFromIndeterminate);
      console.log('Children count:', props.data.children?.length || 0);

      cascadeSelection(props.data, newValue, isFromIndeterminate);
      console.log('Cascade selection completed');
    }

    // 立即强制重新渲染当前组件
    forceUpdate();
    console.log('Force update triggered');

    // 只刷新复选框列，不重绘整行
    if (props.api && typeof props.api.refreshCells === 'function') {
      props.api.refreshCells({
        columns: ['selected'],
        force: true
      });
      console.log('RefreshCells called');
    } else {
      console.warn('API not available or refreshCells not a function:', props.api);
    }

    // 延迟刷新以确保数据传播到子网格
    setTimeout(() => {
      // 触发全局刷新事件
      const event = new CustomEvent('refreshAllGrids');
      window.dispatchEvent(event);
      console.log('Global refresh event dispatched');

      // 再次强制重新渲染
      forceUpdate();

      // 触发选择变化事件
      if (props.api && typeof props.api.dispatchEvent === 'function') {
        props.api.dispatchEvent({ type: 'selectionChanged' });
        console.log('Selection changed event dispatched');
      } else {
        console.warn('API dispatchEvent not available');
      }
    }, 50);
  }
  console.log('=== End CustomCheckboxRenderer handleChange ===');
};

// 强制更新函数
const forceUpdate = () => {
  forceUpdateKey.value++;
};

// 全局刷新事件处理
const handleGlobalRefresh = () => {
  console.log('CustomCheckboxRenderer: Global refresh triggered');
  console.log('Current data:', props.data?.id, 'selected:', props.data?.selected);
  forceUpdate();
  
  nextTick(() => {
    if (checkboxRef.value) {
      const state = getCheckboxState();
      console.log('Updated checkbox state:', state);
      checkboxRef.value.indeterminate = state.indeterminate;
    }
  });
};

// 监听复选框状态变化，更新indeterminate属性
watch(() => checkboxState.value.indeterminate, (newVal) => {
  nextTick(() => {
    if (checkboxRef.value) {
      checkboxRef.value.indeterminate = newVal;
    }
  });
}, { immediate: true });

onMounted(() => {
  console.log('CustomCheckboxRenderer mounted, data:', props.data?.id, 'API:', !!props.api);
  // 监听全局刷新事件
  window.addEventListener('refreshAllGrids', handleGlobalRefresh);
});

onUnmounted(() => {
  console.log('CustomCheckboxRenderer unmounted, data:', props.data?.id);
  window.removeEventListener('refreshAllGrids', handleGlobalRefresh);
});
</script>

<style scoped>
.checkbox-container {
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