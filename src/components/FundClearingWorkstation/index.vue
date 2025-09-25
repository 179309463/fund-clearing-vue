<template>
  <div class="workstation-container">
    <!-- Header -->
    <div class="header">
      <h1 class="title">基金清算工作台</h1>
      <p class="subtitle">Fund Clearing Workstation - Multi-Level Nested Grid</p>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="grid-container" :style="{ paddingBottom: `${operationPanelHeight}px` }">
        <div class="ag-theme-balham grid-wrapper">
          <AgGridVue
            ref="gridRef"
            :rowData="memoizedFundData"
            :columnDefs="columnDefs"
            :defaultColDef="defaultColDef"
            :masterDetail="true"
            :detailRowAutoHeight="true"
            :detailCellRendererParams="detailCellRendererParams"
            :components="gridComponents"
            @grid-ready="onGridReady"
            @selection-changed="onSelectionChanged"
            @row-double-clicked="onRowDoubleClicked"
            :groupDefaultExpanded="0"
            :animateRows="false"
            :enableCellTextSelection="true"
            :suppressCellFocus="true"
            class="grid"
          />
        </div>
      </div>
    </div>

    <!-- Bottom Operation Panel -->
    <OperationPanel
      ref="operationPanelRef"
      :selectedCount="selectedCount"
      :totalCount="totalCount"
      :tradeOrderSelectedCount="tradeOrderSelectedCount"
      :tradeOrderTotalCount="tradeOrderTotalCount"
      :statusFilters="statusFilters"
      @statusFilterChange="setStatusFilters"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';

import { fundData, NodeType } from '../../data/fundData';
import OperationPanel from '../OperationPanel.vue';
import { getLevel1ColumnDefs, getLevel2ColumnDefs, getLevel3ColumnDefs, getLevel4ColumnDefs, getDefaultColDef } from './columns';
import CustomCheckboxRenderer from '../CustomCheckboxRenderer.vue';
import CustomCheckboxHeaderRenderer from '../CustomCheckboxHeaderRenderer.vue';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule, MasterDetailModule]);

// 注册自定义组件
const gridComponents = {
  CustomCheckboxRenderer,
  CustomCheckboxHeaderRenderer,
};

const gridRef = ref();
const operationPanelRef = ref();
const operationPanelHeight = ref(160);
const selectedCount = ref(0);
const totalCount = ref(0);
const tradeOrderSelectedCount = ref(0);
const tradeOrderTotalCount = ref(0);
const statusFilters = ref({
  bondDistribution: false,
  fundManagerUnconfirmed: false,
  multipleReminders: false,
  noReminders: false,
  t0TradeUnsettled: false,
  accountingTimeout: false,
  custodyTimeout: false,
  awaitingUnlocking: false,
});

// 使用computed确保数据引用稳定，避免不必要的重新渲染
const memoizedFundData = computed(() => fundData);

// 用于存储所有网格实例的引用
const gridInstances = ref<Set<any>>(new Set());

// 列定义
const columnDefs = computed(() => getLevel1ColumnDefs());
const defaultColDef = computed(() => getDefaultColDef());

// 计算总数量
const calculateTotalCount = (data: any[]): number => {
  let count = 0;

  const countRows = (items: any[]) => {
    items.forEach(item => {
      count++;
      if (item.children) {
        item.children.forEach((custody: any) => {
          count++;
          if (custody.children) {
            custody.children.forEach((transfer: any) => {
              count++;
              if (transfer.children) {
                count += transfer.children.length;
              }
            });
          }
        });
      }
    });
  };

  countRows(data);
  return count;
};

// 计算成交单总数量
const calculateTradeOrderTotalCount = (data: any[]): number => {
  let count = 0;
  data.forEach(fund => {
    fund.children?.forEach((custody: any) => {
      custody.children?.forEach((transfer: any) => {
        count += transfer.children?.length || 0;
      });
    });
  });
  return count;
};

// 更新选择统计
const updateSelectionCounts = () => {
  let totalSelected = 0;
  let tradeOrderSelected = 0;

  // 统计所有层级的选中数量，使用nodeType进行精确识别
  const countSelected = (items: any[]) => {
    items.forEach(item => {
      if (item.selected) {
        totalSelected++;
        // 如果是成交单节点，同时计入成交单统计
        if (item.nodeType === NodeType.TRADE_ORDER) {
          tradeOrderSelected++;
        }
      }
      if (item.children) {
        countSelected(item.children);
      }
    });
  };

  countSelected(memoizedFundData.value);
  selectedCount.value = totalSelected;
  tradeOrderSelectedCount.value = tradeOrderSelected;
};

// 选择变化事件处理
const onSelectionChanged = () => {
  updateSelectionCounts();
};

// 网格准备就绪事件处理
const onGridReady = (params: any) => {
  params.api.sizeColumnsToFit();
};

// 双击行切换展开/收起状态
const onRowDoubleClicked = (event: any) => {
  const node = event.node;
  if (node && node.master) {
    // 切换展开状态
    node.setExpanded(!node.expanded);
  }
};

// 详情单元格渲染器参数配置
const detailCellRendererParams = computed(() => ({
  detailGridOptions: {
    columnDefs: getLevel2ColumnDefs(),
    defaultColDef: {
      ...defaultColDef.value,
      suppressSizeToFit: false,
    },
    masterDetail: true,
    detailRowAutoHeight: true,
    suppressCellFocus: true,
    groupDefaultExpanded: -1,
    onGridReady: (params: any) => {
      gridInstances.value.add(params.api);
    },
    onSelectionChanged: updateSelectionCounts,
    onRowDoubleClicked: onRowDoubleClicked,
    detailCellRendererParams: {
      detailGridOptions: {
        columnDefs: getLevel3ColumnDefs(),
        defaultColDef: {
          ...defaultColDef.value,
          suppressSizeToFit: false,
        },
        masterDetail: true,
        detailRowAutoHeight: true,
        suppressCellFocus: true,
        groupDefaultExpanded: -1,
        onGridReady: (params: any) => {
          gridInstances.value.add(params.api);
        },
        components: gridComponents,
        components: gridComponents,
        onSelectionChanged: updateSelectionCounts,
        onRowDoubleClicked: onRowDoubleClicked,
        detailCellRendererParams: {
          detailGridOptions: {
            columnDefs: getLevel4ColumnDefs(),
            defaultColDef: {
              ...defaultColDef.value,
              suppressSizeToFit: false,
            },
            detailRowAutoHeight: true,
            suppressCellFocus: true,
            onGridReady: (params: any) => {
              gridInstances.value.add(params.api);
            },
            components: gridComponents,
            onSelectionChanged: updateSelectionCounts,
          },
          getDetailRowData: (params: any) => {
          },
        },
      },
      getDetailRowData: (params: any) => {
        params.successCallback(params.data.children || []);
      },
    },
  },
  getDetailRowData: (params: any) => {
    params.successCallback(params.data.children || []);
                components: gridComponents,
  },
}));

// 动态计算操作面板高度
const updateOperationPanelHeight = () => {
  nextTick(() => {
    if (operationPanelRef.value?.$el) {
      const height = operationPanelRef.value.$el.offsetHeight;
      operationPanelHeight.value = height;
    }
  });
};

// 设置状态过滤器
const setStatusFilters = (filters: any) => {
  statusFilters.value = filters;
};

// 添加全局刷新监听器
const handleRefreshAllGrids = () => {
  console.log('=== Global checkbox refresh triggered ===');
  console.log('Grid instances count:', gridInstances.value.size);

  // 只刷新主网格的复选框列
  if (gridRef.value?.api) {
    console.log('Refreshing main grid checkboxes...');
    gridRef.value.api.refreshCells({
      columns: ['selected'],
      force: true
    });
  }

  // 只刷新所有子网格的复选框列
  let refreshCount = 0;
  gridInstances.value.forEach(gridApi => {
    if (gridApi && gridApi.refreshCells) {
      console.log(`Refreshing sub-grid ${refreshCount} checkboxes...`);
      gridApi.refreshCells({
        columns: ['selected'],
        force: true
      });
      refreshCount++;
    }
  });

  console.log(`Refreshed checkboxes in ${refreshCount} sub-grids`);
};

onMounted(() => {
  // 计算总数量
  totalCount.value = calculateTotalCount(memoizedFundData.value);
  tradeOrderTotalCount.value = calculateTradeOrderTotalCount(memoizedFundData.value);

  // 动态计算操作面板高度
  updateOperationPanelHeight();

  // 监听窗口大小变化
  window.addEventListener('resize', updateOperationPanelHeight);

  // 使用 ResizeObserver 监听操作面板大小变化
  const resizeObserver = new ResizeObserver(updateOperationPanelHeight);
  if (operationPanelRef.value?.$el) {
    resizeObserver.observe(operationPanelRef.value.$el);
  }

  // 添加全局刷新监听器
  window.addEventListener('refreshAllGrids', handleRefreshAllGrids);

  return () => {
    window.removeEventListener('resize', updateOperationPanelHeight);
    resizeObserver.disconnect();
    window.removeEventListener('refreshAllGrids', handleRefreshAllGrids);
  };
});

onUnmounted(() => {
  window.removeEventListener('resize', updateOperationPanelHeight);
  window.removeEventListener('refreshAllGrids', handleRefreshAllGrids);
});
</script>

<style scoped>
.workstation-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin: 4px 0 0 0;
}

.main-content {
  flex: 1;
  overflow: hidden;
}

.grid-container {
  background-color: white;
  height: 100%;
}

.grid-wrapper {
  height: 100%;
}

.grid {
  height: 100%;
}
</style>