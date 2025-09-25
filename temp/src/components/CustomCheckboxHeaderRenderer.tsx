import React, { useState, useEffect } from 'react';
import { IHeaderParams } from 'ag-grid-community';
import { fundData, NodeType } from '../data/fundData';

interface CustomCheckboxHeaderRendererProps extends IHeaderParams {
  api: any;
  columnApi: any;
}

const CustomCheckboxHeaderRenderer: React.FC<CustomCheckboxHeaderRendererProps> = ({ api }) => {
  const [checkboxState, setCheckboxState] = useState<'none' | 'some' | 'all'>('none');

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
    setCheckboxState(newState);
  };

  // 监听数据变化
  useEffect(() => {
    const onSelectionChanged = () => {
      updateSelectionState();
    };

    const onModelUpdated = () => {
      updateSelectionState();
    };

    // 监听全局刷新事件，确保子网格的变化能触发表头更新
    const onGlobalRefresh = () => {
      setTimeout(() => {
        updateSelectionState();
      }, 10);
    };

    api.addEventListener('selectionChanged', onSelectionChanged);
    api.addEventListener('modelUpdated', onModelUpdated);
    window.addEventListener('refreshAllGrids', onGlobalRefresh);

    // 初始化状态
    updateSelectionState();

    return () => {
      api.removeEventListener('selectionChanged', onSelectionChanged);
      api.removeEventListener('modelUpdated', onModelUpdated);
      window.removeEventListener('refreshAllGrids', onGlobalRefresh);
    };
  }, [api]);

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
  const handleHeaderCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;

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
      api.dispatchEvent({ type: 'selectionChanged' });
    }, 10);
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '32px'
      }}
    >
      <input
        type="checkbox"
        checked={checkboxState === 'all'}
        ref={(input) => {
          if (input) {
            input.indeterminate = checkboxState === 'some';
          }
        }}
        onChange={handleHeaderCheckboxChange}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        style={{ margin: 0 }}
        title={
          checkboxState === 'all' ? '取消全选' :
            checkboxState === 'some' ? '全选' :
              '全选'
        }
      />
    </div>
  );
};

export default CustomCheckboxHeaderRenderer;