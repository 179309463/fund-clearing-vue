// 定义节点类型枚举
export enum NodeType {
  FUND = 'fund',           // 第1层：基金
  CUSTODY = 'custody',     // 第2层：托管机构
  INSTRUCTION = 'instruction', // 第3层：划款指令
  TRADE_ORDER = 'tradeOrder'   // 第4层：成交单
}

// 定义数据类型
export interface TradeOrder {
  id: string;
  nodeType: NodeType;
  selected: boolean;
  instructionStatus: string;
  validStatus: string;
  fundSettlementStatus: string;
  tradeOrderNumber: string;
  tradeType: string;
  tradeVarietyCode: string;
  tradeVariety: string;
  bondName: string;
  settlementDate: string;
  settlementMethod: string;
  settlementAmount: number;
  purpose: string;
  children?: TradeOrder[]; // 第4层没有子节点，但类型上保持一致
}

export interface TransferInstruction {
  id: string;
  nodeType: NodeType;
  selected: boolean;
  transferInstructionNumber: string;
  transferInstructionAmount: number;
  transferProgress: string;
  children: TradeOrder[];
}

export interface CustodyInstitution {
  id: string;
  nodeType: NodeType;
  selected: boolean;
  autoClearingStatus: string;
  transferApplicationStatus: string;
  pendingReminder: string;
  accountingProgress: string;
  custodyProgress: string;
  custodyInstitution: string;
  accountBalance: number;
  effectiveSettlementBalance: number;
  generatedTransferAmount: number;
  ungeneratedTransferAmount: number;
  children: TransferInstruction[];
}

export interface FundData {
  id: string;
  nodeType: NodeType;
  selected: boolean;
  fundCode: string;
  fundName: string;
  ossBankBalance: number;
  endDayBankDeposit: number;
  endDayBankDepositWithInquiry: number;
  custodyBank: string;
  trader1: string;
  trader2: string;
  requiredTransferAmount: number;
  children: CustodyInstitution[];
}

// 生成基金数据的函数
function generateFundData(): FundData[] {
  const fundData: FundData[] = [];

  // 基础数据模板
  const fundNames = [
    '增金宝货币A', '增金宝货币B', '稳健债券基金', '成长股票基金', '价值混合基金',
    '平衡配置基金', '创新科技基金', '消费升级基金', '绿色发展基金', '智能制造基金'
  ];

  const custodyInstitutions = [
    '中信银行', '上海清算所', '招商银行', '工商银行', '建设银行',
    '农业银行', '交通银行', '民生银行', '浦发银行', '光大银行',
    '华夏银行', '平安银行', '兴业银行', '中国银行'
  ];

  const tradeTypes = [
    '现券卖出', '卖出回购', '股票卖出', '融资回购', '现券买入', '买入返售', '股票买入'
  ];

  const tradeVarieties = [
    '正回购到期', '国债现券', '企业债现券', '政策性金融债', '地方政府债',
    '同业存单', '金融债现券', '可转债', 'A股现货', '逆回购'
  ];

  const bondNames = [
    '--', '3年期国债', '5年期国债', '10年期国债', '30年期国债', '某企业债券',
    '国开债', '农发债', '进出口银行债', '广东省政府债', '上海市政府债',
    '某银行同业存单', '政策性银行债', '商业银行债', '某科技可转债', '某银行可转债'
  ];

  const clearingStatuses = ['已开启', '未开启'];
  const applicationStatuses = ['已生成', '未生成'];
  const progressStatuses = ['已完成', '进行中', '待处理', '超时'];
  const validStatuses = ['正常', '异常'];
  const settlementStatuses = ['成功', '处理中', '失败'];
  const reminderStatuses = ['已办', '未办'];
  const instructionStatuses = ['已生成', '未生成'];
  const settlementMethods = ['券款对付', '纯券过户'];
  const purposes = ['资产配置', '流动性管理', '投资调整', '资金融通', '投资交易', '股票投资'];

  // 生成10个基金
  for (let fundIndex = 1; fundIndex <= 10; fundIndex++) {
    // 生成更真实的托管行编号
    const custodyBankCode = `020-${(73092978 + fundIndex - 1).toString()}`;
    
    const fund = {
      id: fundIndex.toString(),
      nodeType: NodeType.FUND,
      selected: false,
      fundCode: `00000${fundIndex.toString().padStart(1, '0')}`,
      fundName: fundNames[fundIndex - 1],
      ossBankBalance: fundIndex * 1.00,
      endDayBankDeposit: fundIndex * 1000000.00,
      endDayBankDepositWithInquiry: fundIndex * 1000000.00,
      custodyBank: custodyBankCode,
      trader1: `交易员${fundIndex}A`,
      trader2: `交易员${fundIndex}B`,
      requiredTransferAmount: fundIndex * 1000000.00,
      children: []
    };

    // 每个基金生成1-3个托管机构
    const custodyCount = Math.floor(Math.random() * 3) + 1; // 1-3个
    for (let custodyIndex = 1; custodyIndex <= custodyCount; custodyIndex++) {
      const custody = {
        id: `${fundIndex}-${custodyIndex}`,
        nodeType: NodeType.CUSTODY,
        selected: false,
        autoClearingStatus: clearingStatuses[Math.floor(Math.random() * clearingStatuses.length)],
        transferApplicationStatus: applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)],
        pendingReminder: reminderStatuses[Math.floor(Math.random() * reminderStatuses.length)],
        accountingProgress: progressStatuses[Math.floor(Math.random() * progressStatuses.length)],
        custodyProgress: progressStatuses[Math.floor(Math.random() * progressStatuses.length)],
        custodyInstitution: custodyInstitutions[Math.floor(Math.random() * custodyInstitutions.length)],
        accountBalance: (fundIndex * custodyIndex) * 100000000.00,
        effectiveSettlementBalance: (fundIndex * custodyIndex) * 10000000.00,
        generatedTransferAmount: (fundIndex * custodyIndex) * 5000000.00,
        ungeneratedTransferAmount: (fundIndex * custodyIndex) * 5000000.00,
        children: []
      };

      // 每个托管机构生成1-3个划款指令
      const instructionCount = Math.floor(Math.random() * 3) + 1; // 1-3个
      for (let instructionIndex = 1; instructionIndex <= instructionCount; instructionIndex++) {
        // 生成18位划款指令编号
        const instructionNumber = `${fundIndex.toString().padStart(3, '0')}${custodyIndex.toString().padStart(3, '0')}${instructionIndex.toString().padStart(3, '0')}`.padStart(18, '0');
        
        const instruction = {
          id: `${fundIndex}-${custodyIndex}-${instructionIndex}`,
          nodeType: NodeType.INSTRUCTION,
          selected: false,
          transferInstructionNumber: instructionNumber,
          transferInstructionAmount: (fundIndex * custodyIndex * instructionIndex) * 50000000.00,
          transferProgress: progressStatuses[Math.floor(Math.random() * progressStatuses.length)],
          children: []
        };

        // 每个划款指令生成3-5个成交单
        const orderCount = Math.floor(Math.random() * 3) + 3; // 3-5个
        for (let orderIndex = 1; orderIndex <= orderCount; orderIndex++) {
          // 生成20位成交单编号，使用重复数字模式
          const baseDigit = (fundIndex + orderIndex) % 10;
          const tradeOrderNumber = baseDigit.toString().repeat(20);
          
          // 生成交易品种代码
          const varietyCode = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
          
          const order = {
            id: `${fundIndex}-${custodyIndex}-${instructionIndex}-${orderIndex}`,
            nodeType: NodeType.TRADE_ORDER,
            selected: false,
            instructionStatus: instructionStatuses[Math.floor(Math.random() * instructionStatuses.length)],
            validStatus: validStatuses[Math.floor(Math.random() * validStatuses.length)],
            fundSettlementStatus: settlementStatuses[Math.floor(Math.random() * settlementStatuses.length)],
            tradeOrderNumber: tradeOrderNumber,
            tradeType: tradeTypes[Math.floor(Math.random() * tradeTypes.length)],
            tradeVarietyCode: varietyCode,
            tradeVariety: tradeVarieties[Math.floor(Math.random() * tradeVarieties.length)],
            bondName: bondNames[Math.floor(Math.random() * bondNames.length)],
            settlementDate: `2025-03-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            settlementMethod: settlementMethods[Math.floor(Math.random() * settlementMethods.length)],
            settlementAmount: Math.floor(Math.random() * 100000000) + 10000000, // 1000万到1亿之间
            purpose: purposes[Math.floor(Math.random() * purposes.length)]
          };

          instruction.children.push(order);
        }

        custody.children.push(instruction);
      }

      fund.children.push(custody);
    }

    fundData.push(fund);
  }

  return fundData;
}

// 导出生成的数据 - 每次都重新生成以获得随机数量
export const getFundData = () => {
  return generateFundData();
};

// 为了保持向后兼容，导出静态数据
export const fundData = getFundData();