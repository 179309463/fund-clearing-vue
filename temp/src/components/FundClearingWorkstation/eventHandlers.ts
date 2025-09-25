import { useCallback } from 'react';
import { GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community';
import { FundData, NodeType } from '../../data/fundData';

// 事件处理 Hook
export const useEventHandlers = (
  memoizedFundData: FundData[],
  setSelectedCount: (count: number) => void,
  setTradeOrderSelectedCount: (count: number) => void
) => {
  // 计算总数量
  const calculateTotalCount = useCallback((data: FundData[]): number => {
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
  }, []);

  // 计算成交单总数量
  const calculateTradeOrderTotalCount = useCallback((data: FundData[]): number => {
    let count = 0;
    data.forEach(fund => {
      fund.children?.forEach(custody => {
        custody.children?.forEach(transfer => {
          count += transfer.children?.length || 0;
        });
      });
    });
    return count;
  }, []);

  // 更新选择统计
  const updateSelectionCounts = useCallback(() => {
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

    countSelected(memoizedFundData);
    setSelectedCount(totalSelected);
    setTradeOrderSelectedCount(tradeOrderSelected);
  }, [memoizedFundData, setSelectedCount, setTradeOrderSelectedCount]);

  // 选择变化事件处理
  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    // 更新选择统计
    updateSelectionCounts();
  }, [updateSelectionCounts]);

  // 网格准备就绪事件处理
  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  // 双击行切换展开/收起状态
  const onRowDoubleClicked = useCallback((event: any) => {
    const node = event.node;
    if (node && node.master) {
      // 切换展开状态
      node.setExpanded(!node.expanded);
    }
  }, []);

  return {
    calculateTotalCount,
    calculateTradeOrderTotalCount,
    updateSelectionCounts,
    onSelectionChanged,
    onGridReady,
    onRowDoubleClicked,
  };
};