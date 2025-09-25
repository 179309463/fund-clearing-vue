import React, { useState } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { NodeType } from '../data/fundData';

interface CustomCheckboxRendererProps extends ICellRendererParams {
  data: any;
  value: boolean;
  api: any;
  node: any;
}

const CustomCheckboxRenderer: React.FC<CustomCheckboxRendererProps> = ({ data, api }) => {
  // 添加一个状态来强制重新渲染
  const [, forceUpdate] = useState({});

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

    // 从当前节点的子节点开始遍历
    if (nodeData.children && Array.isArray(nodeData.children)) {
      nodeData.children.forEach(traverse);
    }
  };

  // 计算复选框状态
  const getCheckboxState = () => {
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
    let result;
    if (stats.selectedCount === 0) {
      // 没有成交单被选中
      result = { checked: false, indeterminate: false };
    } else if (stats.selectedCount === stats.totalCount) {
      // 所有成交单都被选中
      result = { checked: true, indeterminate: false };
    } else {
      // 部分成交单被选中
      result = { checked: false, indeterminate: true };
    }
    return result;
  };

  const checkboxState = getCheckboxState();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;

    if (data) {
      // 设置当前节点的状态
      data.selected = newValue;

      // 如果是第4层成交单，只设置自己，不处理子节点
      if (data.nodeType === NodeType.TRADE_ORDER) {
        // 成交单节点无需级联处理
      } else {
        // 对于第1/2/3层级，执行级联选择
        // 判断当前是否为半选状态
        const currentCheckboxState = getCheckboxState();
        const isFromIndeterminate = currentCheckboxState.indeterminate;

        cascadeSelection(data, newValue, isFromIndeterminate);
      }

      // 精确刷新 - 只刷新复选框列，不影响展开状态

      // 1. 立即强制重新渲染当前组件
      forceUpdate({});

      // 2. 只刷新复选框列，不重绘整行
      api.refreshCells({
        columns: ['selected'],
        force: true
      });

      // 3. 延迟刷新以确保数据传播到子网格
      setTimeout(() => {
        // 触发全局刷新事件
        const event = new CustomEvent('refreshAllGrids');
        window.dispatchEvent(event);

        // 再次强制重新渲染
        forceUpdate({});

        // 触发选择变化事件
        api.dispatchEvent({ type: 'selectionChanged' });
      }, 50);
    }
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
        checked={checkboxState.checked}
        ref={(input) => {
          if (input) {
            input.indeterminate = checkboxState.indeterminate;
          }
        }}
        onChange={handleChange}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        style={{ margin: 0 }}
      />
    </div>
  );
};

export default CustomCheckboxRenderer;