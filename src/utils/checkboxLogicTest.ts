import { NodeType } from '../data/fundData';

// 测试用的简化数据结构
interface TestNode {
  id: string;
  nodeType: NodeType;
  selected: boolean;
  instructionStatus?: string; // 只有成交单有这个字段
  children?: TestNode[];
}

// 创建测试数据
const createTestData = (): TestNode => {
  return {
    id: 'fund-1',
    nodeType: NodeType.FUND,
    selected: false,
    children: [
      {
        id: 'custody-1',
        nodeType: NodeType.CUSTODY,
        selected: false,
        children: [
          {
            id: 'instruction-1',
            nodeType: NodeType.INSTRUCTION,
            selected: false,
            children: [
              {
                id: 'order-1',
                nodeType: NodeType.TRADE_ORDER,
                selected: false,
                instructionStatus: '未生成', // 未完成
              },
              {
                id: 'order-2',
                nodeType: NodeType.TRADE_ORDER,
                selected: false,
                instructionStatus: '已生成', // 已完成
              },
              {
                id: 'order-3',
                nodeType: NodeType.TRADE_ORDER,
                selected: false,
                instructionStatus: '未生成', // 未完成
              }
            ]
          }
        ]
      }
    ]
  };
};

// 统计成交单状态的函数（与组件中的逻辑相同）
const getTradeOrderStats = (nodeData: TestNode): { selectedCount: number; uncompletedSelectedCount: number; totalUncompletedCount: number } => {
  let selectedCount = 0;
  let uncompletedSelectedCount = 0;
  let totalUncompletedCount = 0;

  const traverse = (item: TestNode) => {
    if (item.nodeType === NodeType.TRADE_ORDER) {
      const isUncompleted = item.instructionStatus === '未生成';
      if (isUncompleted) {
        totalUncompletedCount++;
        if (item.selected) {
          uncompletedSelectedCount++;
        }
      }
      if (item.selected) {
        selectedCount++;
      }
    }
    
    if (item.children && Array.isArray(item.children)) {
      item.children.forEach(traverse);
    }
  };

  traverse(nodeData);
  return { selectedCount, uncompletedSelectedCount, totalUncompletedCount };
};

// 设置子节点选择状态的函数（与组件中的逻辑相同）
const setChildrenSelection = (nodeData: TestNode, selected: boolean) => {
  const traverse = (item: TestNode) => {
    if (item.nodeType === NodeType.TRADE_ORDER) {
      if (selected) {
        // 勾选时：只选择未完成状态的成交单
        if (item.instructionStatus === '未生成') {
          item.selected = true;
        }
      } else {
        // 取消勾选时：取消所有成交单的选择（不管状态）
        item.selected = false;
      }
    } else {
      // 对于非成交单节点，设置自己的状态
      item.selected = selected;
    }
    
    if (item.children && Array.isArray(item.children)) {
      item.children.forEach(traverse);
    }
  };

  traverse(nodeData);
};

// 测试函数
export const testCheckboxLogic = () => {
  console.log('=== 测试复选框逻辑 ===');
  
  const testData = createTestData();
  console.log('初始数据:', JSON.stringify(testData, null, 2));
  
  // 测试1: 选择基金节点
  console.log('\n--- 测试1: 选择基金节点 ---');
  testData.selected = true;
  setChildrenSelection(testData, true);
  
  const stats1 = getTradeOrderStats(testData);
  console.log('选择后的统计:', stats1);
  console.log('选择后的数据:', JSON.stringify(testData, null, 2));
  
  // 验证：应该只有未完成的成交单被选中
  const expectedUncompletedSelected = 2; // order-1 和 order-3
  const expectedTotalUncompleted = 2;
  
  console.log(`预期未完成选中数: ${expectedUncompletedSelected}, 实际: ${stats1.uncompletedSelectedCount}`);
  console.log(`预期未完成总数: ${expectedTotalUncompleted}, 实际: ${stats1.totalUncompletedCount}`);
  
  // 测试2: 取消选择基金节点
  console.log('\n--- 测试2: 取消选择基金节点 ---');
  testData.selected = false;
  setChildrenSelection(testData, false);
  
  const stats2 = getTradeOrderStats(testData);
  console.log('取消选择后的统计:', stats2);
  console.log('取消选择后的数据:', JSON.stringify(testData, null, 2));
  
  // 验证：所有成交单都应该被取消选择
  console.log(`预期选中数: 0, 实际: ${stats2.selectedCount}`);
  console.log(`预期未完成选中数: 0, 实际: ${stats2.uncompletedSelectedCount}`);
  
  console.log('=== 测试完成 ===');
};

// 如果在浏览器环境中，可以在控制台运行测试
if (typeof window !== 'undefined') {
  (window as any).testCheckboxLogic = testCheckboxLogic;
}