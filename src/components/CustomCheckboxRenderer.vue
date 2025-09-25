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
import { ref, computed, nextTick, watch, onMounted, onUnmounted, getCurrentInstance, type Ref } from 'vue';
import { NodeType } from '../data/fundData';

// 在 Vue 3 的 AG Grid 中，参数通过 getCurrentInstance 获取
const instance = getCurrentInstance();
const props = (instance?.props || {}) as any;

// 获取实际的数据
const getData = () => {
  return props?.params?.data || props?.data || props?.node?.data;
};

const getApi = () => {
  return props?.params?.api || props?.api;
};

// 添加一个响应式状态来强制重新渲染
const forceUpdateKey = ref(0);
const checkboxRef: Ref<HTMLInputElement | null> = ref(null);

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

// 递归设置所有子节点的选择状态
const cascadeSelection = (nodeData: any, selected: boolean, isFromIndeterminate: boolean = false) => {
  console.log('cascadeSelection called:', {
    nodeId: nodeData.id,
    selected,
    isFromIndeterminate,
    hasChildren: !!nodeData.children?.length
  });
  
  const traverse = (item: any) => {
    console.log('Traversing item:', {
      id: item.id,
      nodeType: item.nodeType,
      selected: item.selected,
      instructionStatus: item.instructionStatus
    });
    
    if (item.nodeType === NodeType.TRADE_ORDER) {
      // 成交单节点
      if (selected) {
        if (isFromIndeterminate) {
          // 从半选状态切换到选中：选择所有成交单，不管状态
          item.selected = true;
          console.log('Trade order selected (from indeterminate):', item.id);
        } else {
          // 从未选状态切换到选中：只选择未生成状态的成交单
          if (item.instructionStatus === '未生成') {
            item.selected = true;
            console.log('Trade order selected (未生成):', item.id);
          } else {
            console.log('Trade order not selected (已生成):', item.id);
          }
          // 已生成的成交单保持原状态不变
        }
      } else {
        // 取消勾选时：取消所有成交单的选择（不管状态）
        item.selected = false;
        console.log('Trade order deselected:', item.id);
      }
    } else {
      // 非成交单节点：先递归处理子节点，然后根据子节点状态决定自己的状态
      if (item.children && Array.isArray(item.children)) {
        console.log('Processing children for:', item.id);
        item.children.forEach(traverse);
      }

      // 处理完子节点后，根据子节点的成交单状态决定自己的状态
      if (selected) {
        // 勾选时：只有当有成交单被选中时，才选中自己
        const stats = getTradeOrderStats(item);
        item.selected = stats.selectedCount > 0;
        console.log('Non-trade order node selection result:', {
          id: item.id,
          selected: item.selected,
          stats
        });
      } else {
        // 取消勾选时：直接取消选择
        item.selected = false;
        console.log('Non-trade order node deselected:', item.id);
      }
    }
  };

  // 从当前节点的子节点开始遍历
  if (nodeData.children && Array.isArray(nodeData.children)) {
    console.log('Starting cascade from children of:', nodeData.id);
    nodeData.children.forEach(traverse);
  } else {
    console.log('No children to cascade for:', nodeData.id);
  }
};

// 计算复选框状态
const getCheckboxState = () => {
  const data = getData();
  if (!data) {
    return { checked: false, indeterminate: false };
  }

  // 第4层成交单：直接返回自己的选择状态
  if (data.nodeType === NodeType.TRADE_ORDER) {
    return { checked: data.selected || false, indeterminate: false };
  }

  // 第1/2/3层：根据子节点中成交单的选择状态决定
  const stats = getTradeOrderStats(data);

  // 如果没有成交单，则根据自身状态决定
  if (stats.totalCount === 0) {
    return { checked: data.selected || false, indeterminate: false };
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
  const data = getData();
  const api = getApi();
  
  console.log('Checkbox change triggered:', {
    nodeType: data?.nodeType || 'undefined',
    dataExists: !!data,
    propsKeys: Object.keys(props || {}),
    newValue,
    hasChildren: !!data?.children?.length,
    data: data
  });

  if (data) {
    // 设置当前节点的状态
    data.selected = newValue;

    // 如果是第4层成交单，只设置自己，不处理子节点
    if (data.nodeType === NodeType.TRADE_ORDER) {
      // 成交单节点无需级联处理
      console.log('Trade order node, no cascade needed');
    } else {
      // 对于第1/2/3层级，执行级联选择
      // 判断当前是否为半选状态
      const currentCheckboxState = checkboxState.value;
      const isFromIndeterminate = currentCheckboxState.indeterminate;
      
      console.log('Cascading selection:', {
        isFromIndeterminate,
        childrenCount: data.children?.length || 0
      });

      cascadeSelection(data, newValue, isFromIndeterminate);
    }

    // 立即强制重新渲染当前组件
    forceUpdate();

    // 只刷新复选框列，不重绘整行
    if (api && typeof api.refreshCells === 'function') {
      console.log('Refreshing cells...');
      api.refreshCells({
        columns: ['selected'],
        force: true
      });
    } else {
      console.warn('API not available or refreshCells not a function', { api });
    }

    // 延迟刷新以确保数据传播到子网格
    setTimeout(() => {
      console.log('Triggering global refresh...');
      // 触发全局刷新事件
      const event = new CustomEvent('refreshAllGrids');
      window.dispatchEvent(event);

      // 再次强制重新渲染
      forceUpdate();

      // 触发选择变化事件
      if (api && typeof api.dispatchEvent === 'function') {
        api.dispatchEvent({ type: 'selectionChanged' });
      } else {
        console.warn('API not available for dispatching selection change', { api });
      }
    }, 50);
  }
};

// 强制更新函数
const forceUpdate = () => {
  forceUpdateKey.value++;
};

// 全局刷新事件处理
const handleGlobalRefresh = () => {
  console.log('CustomCheckboxRenderer: Global refresh triggered');
  forceUpdate();
  
  nextTick(() => {
    if (checkboxRef.value) {
      const state = getCheckboxState();
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
  // 监听全局刷新事件
  window.addEventListener('refreshAllGrids', handleGlobalRefresh);
});

onUnmounted(() => {
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
  min-height: 32px !important;
  padding: 0 !important;
}

.custom-checkbox {
  width: 16px !important;
  height: 16px !important;
  margin: 0 !important;
  cursor: pointer !important;
  flex-shrink: 0 !important;
}
</style>