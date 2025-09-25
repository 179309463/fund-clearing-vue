import { NodeType } from '../data/fundData';

/**
 * 根据节点类型获取节点层级名称
 */
export const getNodeTypeName = (nodeType: NodeType): string => {
  switch (nodeType) {
    case NodeType.FUND:
      return '第1层（基金）';
    case NodeType.CUSTODY:
      return '第2层（托管机构）';
    case NodeType.INSTRUCTION:
      return '第3层（划款指令）';
    case NodeType.TRADE_ORDER:
      return '第4层（成交单）';
    default:
      return '未知层级';
  }
};

/**
 * 根据节点类型获取层级数字
 */
export const getNodeLevel = (nodeType: NodeType): number => {
  switch (nodeType) {
    case NodeType.FUND:
      return 1;
    case NodeType.CUSTODY:
      return 2;
    case NodeType.INSTRUCTION:
      return 3;
    case NodeType.TRADE_ORDER:
      return 4;
    default:
      return 0;
  }
};

/**
 * 判断节点是否为指定类型
 */
export const isNodeType = (node: any, nodeType: NodeType): boolean => {
  return node?.nodeType === nodeType;
};

/**
 * 判断节点是否为基金节点
 */
export const isFundNode = (node: any): boolean => {
  return isNodeType(node, NodeType.FUND);
};

/**
 * 判断节点是否为托管机构节点
 */
export const isCustodyNode = (node: any): boolean => {
  return isNodeType(node, NodeType.CUSTODY);
};

/**
 * 判断节点是否为划款指令节点
 */
export const isInstructionNode = (node: any): boolean => {
  return isNodeType(node, NodeType.INSTRUCTION);
};

/**
 * 判断节点是否为成交单节点
 */
export const isTradeOrderNode = (node: any): boolean => {
  return isNodeType(node, NodeType.TRADE_ORDER);
};

/**
 * 获取节点的显示图标
 */
export const getNodeIcon = (nodeType: NodeType): string => {
  switch (nodeType) {
    case NodeType.FUND:
      return '💰'; // 基金
    case NodeType.CUSTODY:
      return '🏦'; // 托管机构
    case NodeType.INSTRUCTION:
      return '📋'; // 划款指令
    case NodeType.TRADE_ORDER:
      return '📄'; // 成交单
    default:
      return '❓';
  }
};