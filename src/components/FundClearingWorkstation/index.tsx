import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { MasterDetailModule } from 'ag-grid-enterprise';
import '../../styles/custom-checkbox.css';

import { fundData } from '../../data/fundData';
import OperationPanel from '../OperationPanel';
import { getLevel1ColumnDefs } from './columns';
import { useEventHandlers } from './eventHandlers';
import { useGridConfig } from './gridConfig';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule, MasterDetailModule]);

const FundClearingWorkstation: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null);
  const operationPanelRef = useRef<HTMLDivElement>(null);
  const [operationPanelHeight, setOperationPanelHeight] = useState(160);
  const [selectedCount, setSelectedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [tradeOrderSelectedCount, setTradeOrderSelectedCount] = useState(0);
  const [tradeOrderTotalCount, setTradeOrderTotalCount] = useState(0);
  const [statusFilters, setStatusFilters] = useState({
    bondDistribution: false,
    fundManagerUnconfirmed: false,
    multipleReminders: false,
    noReminders: false,
    t0TradeUnsettled: false,
    accountingTimeout: false,
    custodyTimeout: false,
    awaitingUnlocking: false,
  });

  // 使用useMemo确保数据引用稳定，避免不必要的重新渲染
  const memoizedFundData = useMemo(() => fundData, []);

  // 用于存储所有网格实例的引用
  const gridInstances = useRef<Set<any>>(new Set());

  // 使用事件处理 Hook
  const {
    calculateTotalCount,
    calculateTradeOrderTotalCount,
    updateSelectionCounts,
    onSelectionChanged,
    onGridReady,
    onRowDoubleClicked,
  } = useEventHandlers(memoizedFundData, setSelectedCount, setTradeOrderSelectedCount);

  // 使用表格配置 Hook
  const { defaultColDef, detailCellRendererParams } = useGridConfig(
    gridInstances,
    updateSelectionCounts,
    onRowDoubleClicked
  );

  // 列定义
  const columnDefs = useMemo(() => getLevel1ColumnDefs(), []);

  // 动态计算操作面板高度
  useEffect(() => {
    const updateOperationPanelHeight = () => {
      if (operationPanelRef.current) {
        const height = operationPanelRef.current.offsetHeight;
        setOperationPanelHeight(height);
      }
    };

    // 初始计算
    updateOperationPanelHeight();

    // 监听窗口大小变化
    window.addEventListener('resize', updateOperationPanelHeight);

    // 使用 ResizeObserver 监听操作面板大小变化
    const resizeObserver = new ResizeObserver(updateOperationPanelHeight);
    if (operationPanelRef.current) {
      resizeObserver.observe(operationPanelRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateOperationPanelHeight);
      resizeObserver.disconnect();
    };
  }, []);

  // 计算总数量
  useEffect(() => {
    const total = calculateTotalCount(memoizedFundData);
    const tradeOrderTotal = calculateTradeOrderTotalCount(memoizedFundData);
    setTotalCount(total);
    setTradeOrderTotalCount(tradeOrderTotal);
  }, [calculateTotalCount, calculateTradeOrderTotalCount, memoizedFundData]);

  // 添加全局刷新监听器
  useEffect(() => {
    const handleRefreshAllGrids = () => {
      console.log('=== Global checkbox refresh triggered ===');
      console.log('Grid instances count:', gridInstances.current.size);

      // 只刷新主网格的复选框列
      if (gridRef.current?.api) {
        console.log('Refreshing main grid checkboxes...');
        gridRef.current.api.refreshCells({
          columns: ['selected'],
          force: true
        });
      }

      // 只刷新所有子网格的复选框列
      let refreshCount = 0;
      gridInstances.current.forEach(gridApi => {
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

    window.addEventListener('refreshAllGrids', handleRefreshAllGrids);

    return () => {
      window.removeEventListener('refreshAllGrids', handleRefreshAllGrids);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">基金清算工作台</h1>
        <p className="text-sm text-gray-600 mt-1">Fund Clearing Workstation - Multi-Level Nested Grid</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="bg-white h-full" style={{ paddingBottom: `${operationPanelHeight}px` }}>
          <div className="ag-theme-balham h-full">
            <AgGridReact
              ref={gridRef}
              rowData={memoizedFundData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              masterDetail={true}
              detailRowAutoHeight={true}
              detailCellRendererParams={detailCellRendererParams}
              onGridReady={onGridReady}
              onSelectionChanged={onSelectionChanged}
              onRowDoubleClicked={onRowDoubleClicked}
              groupDefaultExpanded={0}
              animateRows={false}
              enableCellTextSelection={true}
              suppressCellFocus={true}
            />
          </div>
        </div>
      </div>

      {/* Bottom Operation Panel */}
      <OperationPanel
        ref={operationPanelRef}
        selectedCount={selectedCount}
        totalCount={totalCount}
        tradeOrderSelectedCount={tradeOrderSelectedCount}
        tradeOrderTotalCount={tradeOrderTotalCount}
        statusFilters={statusFilters}
        onStatusFilterChange={setStatusFilters}
      />
    </div>
  );
};

export default FundClearingWorkstation;